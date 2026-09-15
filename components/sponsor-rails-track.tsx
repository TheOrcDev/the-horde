"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  desktopRailWindows,
  HOUSE_TILE_HREF,
  isHttpUrl,
  isSafeLogoSrc,
  MOBILE_RAIL_VISIBLE,
  type PaidRailSeat,
  RAIL_ROTATION_MS,
  RAIL_SEAT_CAP,
  type RailTile,
  tilesForOffset,
} from "@/lib/sponsor-rails";
import { cn } from "@/lib/utils";

const LEFT_STACK_TILTS_DEG = [-1.2, 0.9, -0.7, 1.1, -1] as const;
const RIGHT_STACK_TILTS_DEG = [1.1, -0.8, 1, -1.2, 0.7] as const;
const LOGO_SIZE_CLASS = "size-8";

interface SponsorRailsTrackProps {
  children: ReactNode;
  seats: PaidRailSeat[];
}

const HouseTile = ({ seatsLeft }: { seatsLeft: number }) => (
  <a
    className="flex min-h-14 flex-col justify-center rounded-lg border border-border/70 border-dashed bg-card/70 px-3 py-2 text-xs backdrop-blur-sm hover:border-primary/50"
    href={HOUSE_TILE_HREF}
  >
    Advertise · {seatsLeft}/{RAIL_SEAT_CAP} left
  </a>
);

const PaidTile = ({ tile }: { tile: Extract<RailTile, { kind: "paid" }> }) => {
  const isExternal = isHttpUrl(tile.url);
  const href = isExternal ? tile.url : HOUSE_TILE_HREF;
  const showLogo = isSafeLogoSrc(tile.logoUrl);

  return (
    <a
      className="flex min-h-14 flex-col justify-center gap-1 rounded-lg border border-border/60 bg-card/80 px-3 py-2 backdrop-blur-sm hover:border-primary/40"
      href={href}
      rel={isExternal ? "noopener" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      <div className="flex items-center gap-2">
        {showLogo ? (
          <div
            aria-label={`${tile.name} mark`}
            className={cn(
              LOGO_SIZE_CLASS,
              "shrink-0 bg-center bg-contain bg-no-repeat"
            )}
            role="img"
            style={{ backgroundImage: `url(${JSON.stringify(tile.logoUrl)})` }}
          />
        ) : (
          <div
            className={cn(
              LOGO_SIZE_CLASS,
              "flex shrink-0 items-center justify-center rounded-md bg-muted font-semibold text-xs"
            )}
          >
            {tile.name.at(0) ?? "?"}
          </div>
        )}
        <p className="font-medium text-xs leading-tight">{tile.name}</p>
      </div>
      <p className="line-clamp-2 text-muted-foreground text-xs">
        {tile.tagline}
      </p>
    </a>
  );
};

const RailCard = ({ tile }: { tile: RailTile }) => {
  if (tile.kind === "paid") {
    return <PaidTile tile={tile} />;
  }

  return <HouseTile seatsLeft={tile.seatsLeft} />;
};

const StackedRail = ({
  label,
  side,
  tiles,
}: {
  label: string;
  side: "left" | "right";
  tiles: RailTile[];
}) => {
  const tilts = side === "left" ? LEFT_STACK_TILTS_DEG : RIGHT_STACK_TILTS_DEG;

  return (
    <aside
      aria-label={label}
      className="sticky top-0 z-30 hidden h-svh w-44 shrink-0 flex-col justify-center lg:flex"
    >
      <div className="flex flex-col gap-2 p-2">
        {tiles.map((tile, index) => {
          const tilt = tilts.at(index) ?? 0;
          const key =
            tile.kind === "paid"
              ? `${side}-${tile.id}-${index}`
              : `${side}-house-${index}`;

          return (
            <div
              className="origin-center"
              key={key}
              style={{ transform: `rotate(${tilt}deg)` }}
            >
              <RailCard tile={tile} />
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export const SponsorRailsTrack = ({
  children,
  seats,
}: SponsorRailsTrackProps) => {
  const [offset, setOffset] = useState(0);
  const { left, right } = desktopRailWindows(seats, offset);
  const mobileTiles = tilesForOffset(seats, offset, MOBILE_RAIL_VISIBLE);

  useEffect(() => {
    if (seats.length <= MOBILE_RAIL_VISIBLE) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (media.matches) {
      return;
    }

    const timerId = window.setInterval(() => {
      setOffset((current) => current + 1);
    }, RAIL_ROTATION_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [seats.length]);

  return (
    <div className="flex min-h-svh">
      <StackedRail label="Left sponsor rail" side="left" tiles={left} />
      <div className="relative min-w-0 flex-1">
        <div className="sticky top-0 z-40 border-border/50 border-b bg-background/75 px-2 py-2 backdrop-blur-sm lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {mobileTiles.map((tile, index) => {
              const key =
                tile.kind === "paid"
                  ? `mobile-${tile.id}-${index}`
                  : `mobile-house-${index}`;

              return <RailCard key={key} tile={tile} />;
            })}
          </div>
        </div>
        {children}
      </div>
      <StackedRail label="Right sponsor rail" side="right" tiles={right} />
    </div>
  );
};
