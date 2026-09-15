import Image from "next/image";
import { redirect } from "next/navigation";
import CharacterSheetForm from "@/components/character-sheet-form";
import Lightning from "@/components/lightning";
import { isPlaceholderEmail } from "@/lib/card-schema";
import { getCardByUserId, getSessionIdentity } from "@/server/cards";
import { requireSession } from "@/server/session";

const LOCKED_AVATAR_SIZE = 80;

export default async function JoinPage() {
  const session = await requireSession();
  const [existing, identity] = await Promise.all([
    getCardByUserId(session.user.id),
    getSessionIdentity(session.user),
  ]);

  if (existing) {
    redirect(`/c/${existing.handle}`);
  }
  const needsEmail = isPlaceholderEmail(session.user.email);
  const displayName = identity?.displayName ?? session.user.name;
  const avatarUrl = identity?.avatarUrl ?? session.user.image ?? "";
  const handle = identity?.username;
  const initial = displayName.at(0) ?? "?";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Lightning hue={220} intensity={1} size={1} speed={1} xOffset={0} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-4 py-16">
        <a className="font-bold text-white" href="/">
          The Horde
        </a>
        <h1 className="font-bold text-3xl text-white">Character sheet</h1>
        <div className="flex flex-col items-center gap-2 text-center">
          {avatarUrl ? (
            <Image
              alt={displayName}
              className="rounded-full border border-white/20 object-cover"
              height={LOCKED_AVATAR_SIZE}
              src={avatarUrl}
              width={LOCKED_AVATAR_SIZE}
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full border border-white/20 bg-black/40 font-serif text-2xl text-white">
              {initial}
            </div>
          )}
          <p className="text-white">{displayName}</p>
          <p className="text-amber-200 text-sm">
            {handle ? `@${handle}` : "X handle locked after sign-in"}
          </p>
        </div>
        {handle ? (
          <CharacterSheetForm mode="create" needsEmail={needsEmail} />
        ) : (
          <p className="text-center text-sm text-white/70">
            Could not read your X handle. Sign in with X again.
          </p>
        )}
      </div>
    </div>
  );
}
