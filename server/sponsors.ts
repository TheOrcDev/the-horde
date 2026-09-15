import type { sponsorStatusEnum } from "@/db/schema";
import { type PaidRailSeat, RAIL_SEAT_CAP } from "@/lib/sponsor-rails";
import { slugifyName } from "@/lib/sponsor-schema";

export type SponsorStatus = (typeof sponsorStatusEnum.enumValues)[number];

export interface UpsertSponsorInput {
  currentPeriodEnd: Date;
  email: string;
  logoUrl: string;
  name: string;
  slug: string;
  status: SponsorStatus;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tagline: string;
  url: string;
}

interface ActiveSeatRecord extends PaidRailSeat {
  createdAt: Date;
  currentPeriodEnd: Date;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

const ACTIVE_SEAT_STATUSES = ["active", "past_due"] as const;

const loadSponsorDb = async () => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [{ default: db }, drizzle, { sponsor }] = await Promise.all([
      import("@/db/drizzle"),
      import("drizzle-orm"),
      import("@/db/schema"),
    ]);

    return { db, sponsor, ...drizzle };
  } catch {
    return null;
  }
};

const requireSponsorDb = async () => {
  const loaded = await loadSponsorDb();

  if (!loaded) {
    throw new Error("DATABASE_URL is not set");
  }

  return loaded;
};

export const listActiveSeatRecords = async (): Promise<ActiveSeatRecord[]> => {
  const loaded = await loadSponsorDb();

  if (!loaded) {
    return [];
  }

  try {
    const { and, asc, db, gt, inArray, sponsor } = loaded;
    const rows = await db
      .select({
        createdAt: sponsor.createdAt,
        currentPeriodEnd: sponsor.currentPeriodEnd,
        id: sponsor.id,
        logoUrl: sponsor.logoUrl,
        name: sponsor.name,
        slug: sponsor.slug,
        stripeCustomerId: sponsor.stripeCustomerId,
        stripeSubscriptionId: sponsor.stripeSubscriptionId,
        tagline: sponsor.tagline,
        url: sponsor.url,
      })
      .from(sponsor)
      .where(
        and(
          inArray(sponsor.status, [...ACTIVE_SEAT_STATUSES]),
          gt(sponsor.currentPeriodEnd, new Date())
        )
      )
      .orderBy(asc(sponsor.createdAt))
      .limit(RAIL_SEAT_CAP);

    return rows.slice(0, RAIL_SEAT_CAP);
  } catch {
    return [];
  }
};

export const countSoldSeats = async () => {
  const loaded = await loadSponsorDb();

  if (!loaded) {
    return 0;
  }

  try {
    const { db, sponsor, sql } = loaded;
    const [row] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(sponsor);

    return row?.count ?? 0;
  } catch {
    return 0;
  }
};

export const listActiveSeats = async (): Promise<PaidRailSeat[]> => {
  const rows = await listActiveSeatRecords();

  return rows.map(({ id, logoUrl, name, slug, tagline, url }) => ({
    id,
    logoUrl,
    name,
    slug,
    tagline,
    url,
  }));
};

export const getSponsorBySubscriptionId = async (
  stripeSubscriptionId: string
) => {
  const loaded = await loadSponsorDb();

  if (!loaded) {
    return null;
  }

  const { db, eq, sponsor } = loaded;
  const [row] = await db
    .select()
    .from(sponsor)
    .where(eq(sponsor.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  return row ?? null;
};

export const getSponsorByEmail = async (email: string) => {
  const loaded = await loadSponsorDb();

  if (!loaded) {
    return null;
  }

  const { db, desc, eq, sponsor } = loaded;
  const [row] = await db
    .select()
    .from(sponsor)
    .where(eq(sponsor.email, email))
    .orderBy(desc(sponsor.updatedAt))
    .limit(1);

  return row ?? null;
};

const resolveUniqueSlug = async (
  name: string,
  stripeSubscriptionId: string
) => {
  const loaded = await requireSponsorDb();
  const { db, eq, sponsor } = loaded;
  const base = slugifyName(name);
  const [conflict] = await db
    .select({
      slug: sponsor.slug,
      stripeSubscriptionId: sponsor.stripeSubscriptionId,
    })
    .from(sponsor)
    .where(eq(sponsor.slug, base))
    .limit(1);

  if (!conflict || conflict.stripeSubscriptionId === stripeSubscriptionId) {
    return base;
  }

  return `${base}-${stripeSubscriptionId.slice(-8).toLowerCase()}`;
};

export const upsertFromCheckout = async (input: UpsertSponsorInput) => {
  const { db, sponsor } = await requireSponsorDb();
  const slug = await resolveUniqueSlug(input.name, input.stripeSubscriptionId);
  const now = new Date();

  await db
    .insert(sponsor)
    .values({
      ...input,
      slug,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: sponsor.stripeSubscriptionId,
      set: {
        currentPeriodEnd: input.currentPeriodEnd,
        email: input.email,
        logoUrl: input.logoUrl,
        name: input.name,
        slug,
        status: input.status,
        stripeCustomerId: input.stripeCustomerId,
        tagline: input.tagline,
        updatedAt: now,
        url: input.url,
      },
    });
};

export const removeSponsorBySubscriptionId = async (
  stripeSubscriptionId: string
) => {
  const { db, eq, sponsor } = await requireSponsorDb();

  await db
    .delete(sponsor)
    .where(eq(sponsor.stripeSubscriptionId, stripeSubscriptionId));
};

export const syncSubscription = async (input: {
  currentPeriodEnd: Date;
  status: SponsorStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId: string;
}) => {
  const { db, eq, sponsor } = await requireSponsorDb();
  const now = new Date();

  await db
    .update(sponsor)
    .set({
      currentPeriodEnd: input.currentPeriodEnd,
      status: input.status,
      ...(input.stripeCustomerId
        ? { stripeCustomerId: input.stripeCustomerId }
        : {}),
      updatedAt: now,
    })
    .where(eq(sponsor.stripeSubscriptionId, input.stripeSubscriptionId));
};
