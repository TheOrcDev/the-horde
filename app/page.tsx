import Link from "next/link";
import HordeRoster from "@/components/horde-roster";
import Lightning from "@/components/lightning";
import SignInXButton from "@/components/sign-in-x-button";
import { isAuthConfigured } from "@/lib/auth-config";
import { listCards } from "@/server/cards";

const HOMEPAGE_ROSTER_SIZE = 12;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cards = await listCards(HOMEPAGE_ROSTER_SIZE);
  const emptyCount = Math.max(0, HOMEPAGE_ROSTER_SIZE - cards.length);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0">
        <Lightning hue={220} intensity={1} size={1} speed={1} xOffset={0} />
      </div>
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-bold text-3xl text-white md:text-5xl">
            Join the Horde
          </h1>
          {error === "oauth_cancelled" ? (
            <p className="text-sm text-white/70">Sign-in cancelled.</p>
          ) : null}
          <SignInXButton configured={isAuthConfigured()} />
        </div>
        <HordeRoster cards={cards} emptyCount={emptyCount} />
        {cards.length >= HOMEPAGE_ROSTER_SIZE ? (
          <Link
            className="text-sm text-white/80 underline underline-offset-4 hover:text-white"
            href="/horde"
          >
            See the full roster
          </Link>
        ) : null}
      </main>
    </div>
  );
}
