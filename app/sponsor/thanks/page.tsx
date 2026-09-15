import type { Metadata } from "next";
import Lightning from "@/components/lightning";
import SponsorManageBilling from "@/components/sponsor-manage-billing";
import { isStripeConfigured } from "@/lib/stripe-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thank you · Sponsor · The Horde",
  description:
    "Your rail seat activates when Stripe confirms the subscription.",
};

export default async function SponsorThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; stripeCustomerId?: string }>;
}) {
  const { session_id: sessionId, stripeCustomerId } = await searchParams;
  const configured = isStripeConfigured();

  return (
    <div className="absolute h-full w-full overflow-y-auto">
      <Lightning hue={220} intensity={1} size={1} speed={1} xOffset={0} />
      <div className="relative z-10 mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-5 px-4 py-16">
        <h1 className="text-center font-bold text-3xl text-white md:text-5xl">
          Seat reserved
        </h1>
        <p className="text-center text-sm text-white/70">
          The rail updates when Stripe confirms the subscription. You stay up
          while billing is active.
        </p>
        <SponsorManageBilling
          configured={configured}
          sessionId={sessionId}
          stripeCustomerId={stripeCustomerId}
        />
      </div>
    </div>
  );
}
