import Image from "next/image";
import {
  type CardClass,
  type CardRole,
  CLASS_DISPLAY,
  type Faction,
  ROLE_DISPLAY,
} from "@/lib/card-schema";
import { timezoneShortLabel } from "@/lib/timezones";
import { cn } from "@/lib/utils";

const AVATAR_SIZE = 192;

export interface HordeCardProps {
  avatarUrl: string;
  class: CardClass;
  createdAt: Date;
  displayName: string;
  faction: Faction;
  handle: string;
  role: CardRole;
  timezone: string;
  title: string;
}

const factionFrame = (faction: Faction) =>
  faction === "horde"
    ? "border-red-800/80 bg-red-950/50"
    : "border-sky-800/80 bg-sky-950/50";

function FactionCrest({ faction }: { faction: Faction }) {
  if (faction === "horde") {
    return (
      <svg
        className="size-8 text-red-400"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Horde crest</title>
        <path
          d="M12 2 4 8v6c0 5 3.5 7.5 8 8 4.5-.5 8-3 8-8V8l-8-6Zm0 4.2 5 3.6V14c0 2.8-1.8 4.4-5 4.9-3.2-.5-5-2.1-5-4.9V9.8l5-3.6Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      className="size-8 text-sky-300"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Alliance crest</title>
      <path
        d="M12 3 5 7v5.5c0 4.2 2.8 6.8 7 7.5 4.2-.7 7-3.3 7-7.5V7l-7-4Zm0 3.1 4.5 2.5v4c0 2.3-1.4 3.8-4.5 4.3-3.1-.5-4.5-2-4.5-4.3v-4L12 6.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function HordeCard({
  handle,
  displayName,
  avatarUrl,
  title,
  faction,
  class: cardClass,
  role,
  timezone,
  createdAt,
}: HordeCardProps) {
  const enlisted = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(createdAt);
  const initial = displayName.at(0) ?? handle.at(0) ?? "?";

  return (
    <article
      className={cn(
        "flex w-full max-w-md flex-col items-center gap-4 border-2 px-6 py-8 text-center shadow-2xl",
        factionFrame(faction)
      )}
    >
      <p className="font-semibold text-amber-200/90 text-xs tracking-[0.35em]">
        WANTED
      </p>
      <div className="border-4 border-amber-800/90 p-1 shadow-[inset_0_0_0_2px_rgba(0,0,0,0.45)]">
        {avatarUrl ? (
          <Image
            alt={displayName}
            className="aspect-square object-cover"
            height={AVATAR_SIZE}
            src={avatarUrl}
            width={AVATAR_SIZE}
          />
        ) : (
          <div
            className="flex aspect-square items-center justify-center bg-black/50 font-serif text-5xl text-amber-200"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          >
            {initial}
          </div>
        )}
      </div>
      <FactionCrest faction={faction} />
      <h1 className="font-serif text-3xl text-amber-50 leading-tight">
        {title}
      </h1>
      <p className="text-white/85">{displayName}</p>
      <p className="font-medium text-amber-200">@{handle}</p>
      <p className="text-sm text-white/70">
        {CLASS_DISPLAY[cardClass]} · {ROLE_DISPLAY[role]} ·{" "}
        {timezoneShortLabel(timezone)}
      </p>
      <p className="text-white/50 text-xs">Enlisted {enlisted}</p>
    </article>
  );
}
