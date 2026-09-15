import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { isStripeConfigured } from "@/lib/stripe-config";
import { handleStripeEvent } from "@/server/stripe";

export const runtime = "nodejs";

const readStripeEvent = (rawBody: string, signature: string) => {
  try {
    return getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret()
    );
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return Response.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const event = readStripeEvent(await request.text(), signature);

  if (!event) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  await handleStripeEvent(event);

  return Response.json({ received: true });
}
