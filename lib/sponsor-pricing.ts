export const FOUNDING_SEAT_USD = 299;
export const LIST_SEAT_USD = 599;
export const FOUNDING_SEAT_QUOTA = 20;

export type RailPriceTier = "founding" | "list";

export const resolveRailPriceTier = (soldCount: number): RailPriceTier =>
  soldCount < FOUNDING_SEAT_QUOTA ? "founding" : "list";
