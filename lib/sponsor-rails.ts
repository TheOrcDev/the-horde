export const RAIL_SEAT_CAP = 20;
export const RAIL_ROTATION_MS = 8000;
export const DESKTOP_RAIL_VISIBLE = 5;
export const MOBILE_RAIL_VISIBLE = 2;
export const HOUSE_TILE_HREF = "/sponsor";

const DESKTOP_WINDOW = DESKTOP_RAIL_VISIBLE + DESKTOP_RAIL_VISIBLE;

export interface PaidRailSeat {
  id: string;
  logoUrl: string;
  name: string;
  slug: string;
  tagline: string;
  url: string;
}

export interface HouseRailTile {
  kind: "house";
  seatsLeft: number;
}

export interface PaidRailTile extends PaidRailSeat {
  kind: "paid";
}

export type RailTile = HouseRailTile | PaidRailTile;

export const remainingSeats = (sold: number): number =>
  Math.max(0, RAIL_SEAT_CAP - sold);

export const tilesForOffset = (
  seats: PaidRailSeat[],
  offset: number,
  visible: number
): RailTile[] => {
  const seatsLeft = remainingSeats(seats.length);

  if (seats.length === 0) {
    return Array.from({ length: visible }, () => ({
      kind: "house" as const,
      seatsLeft,
    }));
  }

  if (seats.length <= visible) {
    return [
      ...seats.map((seat) => ({ ...seat, kind: "paid" as const })),
      ...Array.from({ length: visible - seats.length }, () => ({
        kind: "house" as const,
        seatsLeft,
      })),
    ];
  }

  return Array.from({ length: visible }, (_, index) => {
    const seat = seats.at((offset + index) % seats.length);

    if (!seat) {
      return { kind: "house" as const, seatsLeft };
    }

    return { ...seat, kind: "paid" as const };
  });
};

export const desktopRailWindows = (
  seats: PaidRailSeat[],
  offset: number
): { left: RailTile[]; right: RailTile[] } => {
  const tiles = tilesForOffset(seats, offset, DESKTOP_WINDOW);

  return {
    left: tiles.slice(0, DESKTOP_RAIL_VISIBLE),
    right: tiles.slice(DESKTOP_RAIL_VISIBLE),
  };
};

export const isHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export const isSafeLogoSrc = (value: string): boolean => {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return true;
  }

  return isHttpUrl(value);
};
