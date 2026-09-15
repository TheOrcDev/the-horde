import type { CardClass, CardRole } from "@/lib/card-schema";

const CLASS_NOUN: Record<CardClass, string> = {
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

const AMERICA_PREFIX = "America/";
const EUROPE_PREFIX = "Europe/";
const ASIA_PREFIX = "Asia/";
const FALLBACK_REALM = "Outer Realms";
const PACIFIC_WATCH = "Pacific Watch";
const EASTERN_WATCH = "Eastern Watch";
const CENTRAL_WATCH = "Central Watch";
const MOUNTAIN_WATCH = "Mountain Watch";
const WESTERN_KEEP = "Western Keep";
const CENTRAL_KEEP = "Central Keep";
const DAWN_WATCH = "Dawn Watch";

const AMERICA_WATCH: Record<string, string> = {
  "America/Los_Angeles": PACIFIC_WATCH,
  "America/Vancouver": PACIFIC_WATCH,
  "America/Tijuana": PACIFIC_WATCH,
  "America/Seattle": PACIFIC_WATCH,
  "America/New_York": EASTERN_WATCH,
  "America/Toronto": EASTERN_WATCH,
  "America/Detroit": EASTERN_WATCH,
  "America/Indiana/Indianapolis": EASTERN_WATCH,
  "America/Chicago": CENTRAL_WATCH,
  "America/Mexico_City": CENTRAL_WATCH,
  "America/Winnipeg": CENTRAL_WATCH,
  "America/Denver": MOUNTAIN_WATCH,
  "America/Phoenix": MOUNTAIN_WATCH,
  "America/Edmonton": MOUNTAIN_WATCH,
  "America/Boise": MOUNTAIN_WATCH,
};

const EUROPE_WESTERN_KEEP = new Set([
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Guernsey",
  "Europe/Isle_of_Man",
  "Europe/Jersey",
]);

const realmFromTimezone = (timezone: string) => {
  if (timezone.startsWith(AMERICA_PREFIX)) {
    return AMERICA_WATCH[timezone] ?? FALLBACK_REALM;
  }

  if (timezone.startsWith(EUROPE_PREFIX)) {
    if (EUROPE_WESTERN_KEEP.has(timezone)) {
      return WESTERN_KEEP;
    }

    return CENTRAL_KEEP;
  }

  if (timezone.startsWith(ASIA_PREFIX)) {
    return DAWN_WATCH;
  }

  return FALLBACK_REALM;
};

interface TitleInput {
  class: CardClass;
  role: CardRole;
  timezone: string;
}

export const generateCardTitle = ({
  class: cardClass,
  role,
  timezone,
}: TitleInput) => {
  const realm = realmFromTimezone(timezone);

  if (role === "raid-lead") {
    return `Raid Lead of the ${realm}`;
  }

  return `${CLASS_NOUN[cardClass]} of the ${realm}`;
};
