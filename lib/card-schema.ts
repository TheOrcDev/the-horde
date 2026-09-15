import { z } from "zod";
import { isValidIanaTimeZone } from "@/lib/timezones";

export const FACTIONS = ["horde", "alliance"] as const;
export const CARD_CLASSES = [
  "grunt",
  "mage",
  "hunter",
  "warlock",
  "priest",
  "rogue",
  "paladin",
  "shaman",
  "death-knight",
  "druid",
] as const;
export const CARD_ROLES = ["tank", "healer", "dps", "raid-lead"] as const;

export type Faction = (typeof FACTIONS)[number];
export type CardClass = (typeof CARD_CLASSES)[number];
export type CardRole = (typeof CARD_ROLES)[number];

export const CLASS_LABELS: Record<CardClass, string> = {
  grunt: "Grunt — builder",
  mage: "Mage — AI/agents",
  hunter: "Hunter — growth",
  warlock: "Warlock — infra",
  priest: "Priest — design/DX",
  rogue: "Rogue — indie",
  paladin: "Paladin — founder",
  shaman: "Shaman — DevRel",
  "death-knight": "Death Knight — security",
  druid: "Druid — fullstack",
};

export const ROLE_LABELS: Record<CardRole, string> = {
  tank: "Tank — staff/lead",
  healer: "Healer — mentor/reviewer",
  dps: "DPS — IC",
  "raid-lead": "Raid Lead — founder/CEO",
};

export const CLASS_DISPLAY: Record<CardClass, string> = {
  grunt: "Grunt",
  mage: "Mage",
  hunter: "Hunter",
  warlock: "Warlock",
  priest: "Priest",
  rogue: "Rogue",
  paladin: "Paladin",
  shaman: "Shaman",
  "death-knight": "Death Knight",
  druid: "Druid",
};

export const ROLE_DISPLAY: Record<CardRole, string> = {
  tank: "Tank",
  healer: "Healer",
  dps: "DPS",
  "raid-lead": "Raid Lead",
};

export const PLACEHOLDER_EMAIL_SUFFIX = "@twitter.placeholder.invalid";

export const isPlaceholderEmail = (email: string) =>
  email.endsWith(PLACEHOLDER_EMAIL_SUFFIX);

export const cardSchema = z.object({
  faction: z.enum(FACTIONS),
  class: z.enum(CARD_CLASSES),
  role: z.enum(CARD_ROLES),
  timezone: z
    .string()
    .min(1)
    .refine(isValidIanaTimeZone, "Use a valid IANA timezone"),
  email: z.union([z.email(), z.literal("")]).optional(),
});

export type CardSheetInput = z.infer<typeof cardSchema>;
