import { sponsorCheckoutSchema } from "@/lib/sponsor-schema";
import { isStripeConfigured } from "@/lib/stripe-config";
import { createCheckoutSession, getAppOrigin } from "@/server/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return Response.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const parsed = sponsorCheckoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid sponsor details" }, { status: 400 });
  }

  const result = await createCheckoutSession({
    ...parsed.data,
    origin: getAppOrigin(request.url),
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ url: result.url });
}
