import type { Metadata } from "next";
import Lightning from "@/components/lightning";
import SponsorCheckoutForm from "@/components/sponsor-checkout-form";
import {
  FOUNDING_SEAT_USD,
  LIST_SEAT_USD,
  resolveRailPriceTier,
} from "@/lib/sponsor-pricing";
import { RAIL_SEAT_CAP } from "@/lib/sponsor-rails";
import { isStripeConfigured } from "@/lib/stripe-config";
import { countSoldSeats } from "@/server/sponsors";
import { countActiveSeats } from "@/server/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sponsor · The Horde",
  description: "Buy a monthly seat on The Horde rails.",
};

export default async function SponsorPage() {
  const configured = isStripeConfigured();
  const taken = configured ? await countActiveSeats() : 0;
  const sold = configured ? await countSoldSeats() : 0;
  const remaining = Math.max(RAIL_SEAT_CAP - taken, 0);
  const soldOut = remaining === 0;
  const tier = resolveRailPriceTier(sold);
  const monthlyUsd = tier === "founding" ? FOUNDING_SEAT_USD : LIST_SEAT_USD;

  return (
    <div className="absolute h-full w-full overflow-y-auto">
      <Lightning hue={220} intensity={1} size={1} speed={1} xOffset={0} />
      <div className="relative z-10 mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-5 px-4 py-16">
        <h1 className="text-center font-bold text-3xl text-white md:text-5xl">
          Sponsor the rails
        </h1>
        <p className="text-center text-sm text-white/70">
          {tier === "founding" ? "Founding" : "List"} seat ${monthlyUsd}/mo.{" "}
          {remaining}/{RAIL_SEAT_CAP} left.
        </p>
        <SponsorCheckoutForm configured={configured} soldOut={soldOut} />
      </div>
    </div>
  );
}
