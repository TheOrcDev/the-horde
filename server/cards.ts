"use server";

import { and, count, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import db from "@/db/drizzle";
import { account, hordeCard, hordeCardAlias } from "@/db/schema";
import { toOriginalAvatarUrl } from "@/lib/avatar-url";
import {
  type CardSheetInput,
  cardSchema,
  isPlaceholderEmail,
} from "@/lib/card-schema";
import { generateCardTitle } from "@/lib/card-title";
import { requireSession } from "@/server/session";
import { addEmail } from "@/server/waiting-list";

const LIST_CARDS_DEFAULT = 12;
const X_USER_FIELDS = "profile_image_url,name,username";
const LEADING_AT = /^@/;

const xUserResponseSchema = z.object({
  data: z
    .object({
      id: z.string(),
      name: z.string().optional(),
      username: z.string().optional(),
      profile_image_url: z.string().optional(),
    })
    .optional(),
});

export type HordeCardRow = typeof hordeCard.$inferSelect;

export interface CardLookup {
  canonicalHandle: string;
  card: HordeCardRow;
}

export interface SessionIdentity {
  avatarUrl: string;
  displayName: string;
  username: string | null;
  xUserId: string;
}

const parseSheet = (input: CardSheetInput) => {
  const parsed = cardSchema.safeParse(input);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};

const fetchXProfile = async (accessToken: string, xUserId: string) => {
  const urls = [
    `https://api.twitter.com/2/users/me?user.fields=${X_USER_FIELDS}`,
    `https://api.twitter.com/2/users/${xUserId}?user.fields=${X_USER_FIELDS}`,
  ];

  for (const url of urls) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      continue;
    }

    const parsed = xUserResponseSchema.safeParse(await response.json());

    if (parsed.success && parsed.data.data) {
      return parsed.data.data;
    }
  }

  return null;
};

const getTwitterAccount = async (userId: string) => {
  const [twitterAccount] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "twitter")))
    .limit(1);

  return twitterAccount ?? null;
};

export const getSessionIdentity = async (user: {
  id: string;
  name: string;
  image?: string | null;
}): Promise<SessionIdentity | null> => {
  const twitterAccount = await getTwitterAccount(user.id);

  if (!twitterAccount) {
    return null;
  }

  const profile = twitterAccount.accessToken
    ? await fetchXProfile(twitterAccount.accessToken, twitterAccount.accountId)
    : null;

  const rawAvatar = profile?.profile_image_url ?? user.image ?? "";

  return {
    xUserId: twitterAccount.accountId,
    username: profile?.username?.replace(LEADING_AT, "").toLowerCase() ?? null,
    displayName: profile?.name ?? user.name,
    avatarUrl: rawAvatar ? toOriginalAvatarUrl(rawAvatar) : "",
  };
};

export const getCardByUserId = async (userId: string) => {
  const [card] = await db
    .select()
    .from(hordeCard)
    .where(eq(hordeCard.userId, userId))
    .limit(1);

  return card ?? null;
};

export const getCardByHandle = async (
  handle: string
): Promise<CardLookup | null> => {
  const normalized = handle.toLowerCase();
  const [card] = await db
    .select()
    .from(hordeCard)
    .where(eq(hordeCard.handle, normalized))
    .limit(1);

  if (card) {
    return { card, canonicalHandle: card.handle };
  }

  const [alias] = await db
    .select()
    .from(hordeCardAlias)
    .where(eq(hordeCardAlias.handle, normalized))
    .limit(1);

  if (!alias) {
    return null;
  }

  const [canonical] = await db
    .select()
    .from(hordeCard)
    .where(eq(hordeCard.id, alias.cardId))
    .limit(1);

  if (!canonical) {
    return null;
  }

  return { card: canonical, canonicalHandle: canonical.handle };
};

export const listCards = async (limit = LIST_CARDS_DEFAULT) =>
  db.select().from(hordeCard).orderBy(desc(hordeCard.createdAt)).limit(limit);

export const factionCounts = async () => {
  const rows = await db
    .select({
      faction: hordeCard.faction,
      n: count(),
    })
    .from(hordeCard)
    .groupBy(hordeCard.faction);

  let horde = 0;
  let alliance = 0;

  for (const row of rows) {
    const n = Number(row.n);

    if (row.faction === "horde") {
      horde = n;
    } else if (row.faction === "alliance") {
      alliance = n;
    }
  }

  return { horde, alliance };
};

export const syncProfileFromSession = async () => {
  const session = await requireSession();
  const card = await getCardByUserId(session.user.id);

  if (!card) {
    return card;
  }

  const identity = await getSessionIdentity(session.user);

  if (!identity) {
    return card;
  }

  const displayName = identity.displayName;
  const avatarUrl = identity.avatarUrl || card.avatarUrl;
  const xUsername = identity.username ?? card.xUsername;

  const [updated] = await db
    .update(hordeCard)
    .set({
      displayName,
      avatarUrl,
      xUsername,
      updatedAt: new Date(),
    })
    .where(eq(hordeCard.id, card.id))
    .returning();

  return updated ?? card;
};

const raidEmailFromInput = (
  email: string | undefined,
  sessionEmail: string
) => {
  if (email) {
    return email;
  }

  if (isPlaceholderEmail(sessionEmail)) {
    return;
  }

  return sessionEmail;
};

export const createHordeCard = async (input: CardSheetInput) => {
  const session = await requireSession();
  const existing = await getCardByUserId(session.user.id);

  if (existing) {
    redirect(`/c/${existing.handle}`);
  }

  const parsed = parseSheet(input);

  if (!parsed) {
    return {
      success: false as const,
      message: "Check the sheet and try again.",
    };
  }

  const identity = await getSessionIdentity(session.user);

  if (!identity?.username) {
    return {
      success: false as const,
      message: "Could not read your X handle. Sign in with X again.",
    };
  }

  const handle = identity.username;
  const title = generateCardTitle({
    class: parsed.class,
    role: parsed.role,
    timezone: parsed.timezone,
  });
  const raidEmail = raidEmailFromInput(parsed.email, session.user.email);

  try {
    await db.insert(hordeCard).values({
      userId: session.user.id,
      xUserId: identity.xUserId,
      handle,
      xUsername: identity.username,
      displayName: identity.displayName,
      avatarUrl: identity.avatarUrl,
      email: raidEmail,
      faction: parsed.faction,
      class: parsed.class,
      role: parsed.role,
      timezone: parsed.timezone,
      title,
    });
  } catch {
    return {
      success: false as const,
      message: "Could not mint this card. That handle may already be enlisted.",
    };
  }

  if (raidEmail) {
    await addEmail(raidEmail);
  }

  redirect(`/c/${handle}`);
};

export const updateHordeCard = async (input: CardSheetInput) => {
  const session = await requireSession();
  const existing = await getCardByUserId(session.user.id);

  if (!existing) {
    redirect("/join");
  }

  const parsed = parseSheet(input);

  if (!parsed) {
    return {
      success: false as const,
      message: "Check the sheet and try again.",
    };
  }

  const title = generateCardTitle({
    class: parsed.class,
    role: parsed.role,
    timezone: parsed.timezone,
  });

  await db
    .update(hordeCard)
    .set({
      faction: parsed.faction,
      class: parsed.class,
      role: parsed.role,
      timezone: parsed.timezone,
      title,
      updatedAt: new Date(),
    })
    .where(eq(hordeCard.id, existing.id));

  revalidatePath(`/c/${existing.handle}`);

  return { success: true as const, message: "Sheet updated." };
};
