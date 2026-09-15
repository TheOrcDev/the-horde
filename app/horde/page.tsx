import type { Metadata } from "next";
import HordeRoster from "@/components/horde-roster";
import Lightning from "@/components/lightning";
import SignInXButton from "@/components/sign-in-x-button";
import { isAuthConfigured } from "@/lib/auth-config";
import { listCards } from "@/server/cards";

const DIRECTORY_CARD_LIMIT = 100;

export const metadata: Metadata = {
  title: "Horde",
  description: "Wanted posters for people who ship.",
};

export default async function HordeDirectoryPage() {
  const cards = await listCards(DIRECTORY_CARD_LIMIT);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0">
        <Lightning hue={220} intensity={1} size={1} speed={1} xOffset={0} />
      </div>
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12">
        <h1 className="font-bold text-3xl text-white md:text-5xl">The Horde</h1>
        {cards.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-white/80">
              The first wanted posters are being nailed up.
            </p>
            <SignInXButton configured={isAuthConfigured()} />
          </div>
        ) : (
          <HordeRoster cards={cards} emptyCount={0} />
        )}
      </main>
    </div>
  );
}
