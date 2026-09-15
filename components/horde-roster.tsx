import Link from "next/link";
import EmptyWantedSlot from "@/components/empty-wanted-slot";
import HordeCard from "@/components/horde-card";
import type { HordeCardRow } from "@/server/cards";

const EMPTY_WANTED_KEYS = [
  "north-gate",
  "south-gate",
  "east-watch",
  "west-watch",
  "keep-wall",
  "raid-pit",
  "mage-tower",
  "stables",
  "war-camp",
  "outer-realms",
  "dawn-watch",
  "last-post",
] as const;

interface HordeRosterProps {
  cards: HordeCardRow[];
  emptyCount: number;
}

export default function HordeRoster({ cards, emptyCount }: HordeRosterProps) {
  const emptyKeys = EMPTY_WANTED_KEYS.slice(0, emptyCount);

  return (
    <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <li key={card.id}>
          <Link className="block h-full" href={`/c/${card.handle}`}>
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
          </Link>
        </li>
      ))}
      {emptyKeys.map((slotKey) => (
        <li key={slotKey}>
          <EmptyWantedSlot />
        </li>
      ))}
    </ul>
  );
}
