import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import CharacterSheetForm from "@/components/character-sheet-form";
import HordeCard from "@/components/horde-card";
import Lightning from "@/components/lightning";
import ShareOnXButton from "@/components/share-on-x-button";
import SignInXButton from "@/components/sign-in-x-button";
import { isAuthConfigured } from "@/lib/auth-config";
import { getAppOrigin } from "@/lib/card-share";
import { getCardByHandle } from "@/server/cards";
import { getSession } from "@/server/session";

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

type HandleParams = Promise<{ handle: string }>;

export async function generateMetadata({
  params,
}: {
  params: HandleParams;
}): Promise<Metadata> {
  const { handle } = await params;
  const result = await getCardByHandle(handle);

  if (!result) {
    return {
      title: "The Horde",
      description: "Wanted posters for people who ship.",
    };
  }

  const { card } = result;
  const title = `${card.title} · @${card.handle} · The Horde`;
  const description = "Wanted posters for people who ship.";
  const ogImage = `/c/${card.handle}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: card.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CardPage({ params }: { params: HandleParams }) {
  const { handle } = await params;
  const [result, session, headerList] = await Promise.all([
    getCardByHandle(handle),
    getSession(),
    headers(),
  ]);

  if (!result) {
    notFound();
  }

  if (result.canonicalHandle !== handle.toLowerCase()) {
    permanentRedirect(`/c/${result.canonicalHandle}`);
  }

  const { card } = result;
  const isOwner = session?.user.id === card.userId;
  const origin = getAppOrigin(headerList);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Lightning hue={220} intensity={1} size={1} speed={1} xOffset={0} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center gap-6 px-4 py-16">
        <a className="font-bold text-white" href="/">
          The Horde
        </a>
        <HordeCard
          avatarUrl={card.avatarUrl}
          class={card.class}
          createdAt={card.createdAt}
          displayName={card.displayName}
          faction={card.faction}
          handle={card.handle}
          role={card.role}
          timezone={card.timezone}
          title={card.title}
        />
        {isOwner ? (
          <>
            <ShareOnXButton
              handle={card.handle}
              origin={origin}
              title={card.title}
            />
            <section className="w-full max-w-md border border-white/10 bg-black/30 p-4">
              <h2 className="mb-4 font-semibold text-white">Edit sheet</h2>
              <CharacterSheetForm
                defaults={{
                  faction: card.faction,
                  class: card.class,
                  role: card.role,
                  timezone: card.timezone,
                }}
                mode="edit"
              />
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-white/70">Claim yours</p>
            <SignInXButton configured={isAuthConfigured()} />
          </div>
        )}
      </div>
    </div>
  );
}
