import { randomBytes } from "node:crypto";
import type Stripe from "stripe";
import {
  type RailPriceTier,
  resolveRailPriceTier,
} from "@/lib/sponsor-pricing";
import { RAIL_SEAT_CAP } from "@/lib/sponsor-rails";
import { type SponsorCheckoutInput, slugifyName } from "@/lib/sponsor-schema";
import { getStripe } from "@/lib/stripe";
import {
  countSoldSeats,
  getSponsorByEmail,
  getSponsorBySubscriptionId,
  listActiveSeatRecords,
  removeSponsorBySubscriptionId,
  type SponsorStatus,
  syncSubscription,
  upsertFromCheckout,
} from "@/server/sponsors";

const LINE_ITEM_QUANTITY = 1;
const INTEGRATION_SUFFIX_LENGTH = 8;
const MS_PER_SECOND = 1000;
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const TRAILING_SLASH = /\/$/;

export type CheckoutSessionResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number };

export type PortalSessionResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number };

const randomLetterSuffix = (length: number) => {
  const bytes = randomBytes(length);
  let suffix = "";

  for (const byte of bytes) {
    suffix += LETTERS[byte % LETTERS.length];
  }

  return suffix;
};

export const getAppOrigin = (requestUrl: string) => {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(
    TRAILING_SLASH,
    ""
  );

  if (configured) {
    return configured;
  }

  return new URL(requestUrl).origin;
};

export const countActiveSeats = async () => {
  const seats = await listActiveSeatRecords();
  return seats.length;
};

const priceIdForTier = (tier: RailPriceTier) =>
  tier === "founding"
    ? process.env.STRIPE_FOUNDING_PRICE_ID
    : process.env.STRIPE_LIST_PRICE_ID;

const asStripeId = (value: string | { id: string } | null) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.id;
};

const getSubscriptionPeriodEnd = (subscription: Stripe.Subscription) => {
  const periodEnd = subscription.items.data.at(0)?.current_period_end;

  if (!periodEnd) {
    return new Date();
  }

  return new Date(periodEnd * MS_PER_SECOND);
};

const mapSubscriptionStatus = (
  status: Stripe.Subscription.Status
): SponsorStatus => {
  if (status === "past_due") {
    return "past_due";
  }

  if (status === "active" || status === "trialing") {
    return "active";
  }

  if (status === "incomplete" || status === "incomplete_expired") {
    return "incomplete";
  }

  return "canceled";
};

const getInvoiceSubscriptionId = (invoice: Stripe.Invoice) => {
  const parent = invoice.parent;

  if (parent?.type !== "subscription_details") {
    return null;
  }

  const subscription = parent.subscription_details?.subscription;

  if (!subscription) {
    return null;
  }

  if (typeof subscription === "string") {
    return subscription;
  }

  return subscription.id;
};

const cancelExcessSeats = async () => {
  const seats = await listActiveSeatRecords();

  if (seats.length <= RAIL_SEAT_CAP) {
    return;
  }

  const newestFirst = [...seats].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
  );
  const excess = newestFirst.slice(RAIL_SEAT_CAP);
  const stripe = getStripe();

  for (const seat of excess) {
    await stripe.subscriptions.cancel(seat.stripeSubscriptionId);
    await removeSponsorBySubscriptionId(seat.stripeSubscriptionId);
  }
};

export const createCheckoutSession = async (
  input: SponsorCheckoutInput & { origin: string }
): Promise<CheckoutSessionResult> => {
  const taken = await countActiveSeats();

  if (taken >= RAIL_SEAT_CAP) {
    return { ok: false, error: "Sold out.", status: 409 };
  }

  const sold = await countSoldSeats();
  const tier = resolveRailPriceTier(sold);
  const priceId = priceIdForTier(tier);

  if (!priceId) {
    return { ok: false, error: "Stripe is not configured", status: 503 };
  }

  const metadata = {
    name: input.name,
    slug: slugifyName(input.name),
    tagline: input.tagline,
    url: input.url,
    logoUrl: input.logoUrl,
    tier,
  };

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: input.email,
      line_items: [
        {
          price: priceId,
          quantity: LINE_ITEM_QUANTITY,
        },
      ],
      success_url: `${input.origin}/sponsor/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}/sponsor`,
      metadata,
      subscription_data: {
        metadata,
      },
      integration_identifier: `horde-rail-${randomLetterSuffix(INTEGRATION_SUFFIX_LENGTH)}`,
    });

    if (!session.url) {
      return { ok: false, error: "Checkout is unavailable", status: 502 };
    }

    return { ok: true, url: session.url };
  } catch {
    return { ok: false, error: "Checkout is unavailable", status: 502 };
  }
};

const resolvePortalCustomerId = async (input: {
  sessionId?: string;
  stripeCustomerId?: string;
  email?: string;
}) => {
  if (input.stripeCustomerId) {
    return input.stripeCustomerId;
  }

  const stripe = getStripe();

  if (input.sessionId) {
    const session = await stripe.checkout.sessions.retrieve(input.sessionId);
    return asStripeId(session.customer);
  }

  if (!input.email) {
    return null;
  }

  const existing = await getSponsorByEmail(input.email);
  return existing?.stripeCustomerId ?? null;
};

export const createPortalSession = async (input: {
  origin: string;
  sessionId?: string;
  stripeCustomerId?: string;
  email?: string;
}): Promise<PortalSessionResult> => {
  try {
    const customerId = await resolvePortalCustomerId(input);

    if (!customerId) {
      return { ok: false, error: "No billing customer found", status: 404 };
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${input.origin}/sponsor`,
    });

    return { ok: true, url: session.url };
  } catch {
    return { ok: false, error: "Portal is unavailable", status: 502 };
  }
};

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  const metadata = session.metadata ?? {};
  const name = metadata.name;
  const tagline = metadata.tagline;
  const url = metadata.url;
  const logoUrl = metadata.logoUrl;
  const customerId = asStripeId(session.customer);
  const subscriptionId = asStripeId(session.subscription);
  const email = session.customer_details?.email ?? session.customer_email ?? "";

  if (
    !(
      name &&
      tagline &&
      url &&
      logoUrl &&
      customerId &&
      subscriptionId &&
      email
    )
  ) {
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);
  const otherActive = (await listActiveSeatRecords()).filter(
    (seat) => seat.stripeSubscriptionId !== subscriptionId
  );

  if (otherActive.length >= RAIL_SEAT_CAP) {
    await stripe.subscriptions.cancel(subscriptionId);
    await removeSponsorBySubscriptionId(subscriptionId);
    return;
  }

  await upsertFromCheckout({
    name,
    slug: metadata.slug || slugifyName(name),
    tagline,
    logoUrl,
    url,
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    status: mapSubscriptionStatus(subscription.status),
    currentPeriodEnd,
  });

  await cancelExcessSeats();
};

const handleSubscriptionSync = async (subscription: Stripe.Subscription) => {
  const existing = await getSponsorBySubscriptionId(subscription.id);

  if (!existing) {
    return;
  }

  await syncSubscription({
    stripeSubscriptionId: subscription.id,
    status: mapSubscriptionStatus(subscription.status),
    currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    stripeCustomerId: asStripeId(subscription.customer) ?? undefined,
  });
};

const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) {
    return;
  }

  const existing = await getSponsorBySubscriptionId(subscriptionId);

  if (!existing) {
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await syncSubscription({
    stripeSubscriptionId: subscriptionId,
    status: "active",
    currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    stripeCustomerId: asStripeId(subscription.customer) ?? undefined,
  });
};

export const handleStripeEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object);
      return;
    case "customer.subscription.updated":
      await handleSubscriptionSync(event.data.object);
      return;
    case "customer.subscription.deleted":
      await handleSubscriptionSync(event.data.object);
      return;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object);
      return;
    default:
      return;
  }
};
