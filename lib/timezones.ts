export const OTHER_TIMEZONE_VALUE = "other";

export const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "New York" },
  { value: "America/Chicago", label: "Chicago" },
  { value: "America/Denver", label: "Denver" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "America/Phoenix", label: "Phoenix" },
  { value: "America/Anchorage", label: "Anchorage" },
  { value: "America/Honolulu", label: "Honolulu" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Vancouver", label: "Vancouver" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { value: "America/Bogota", label: "Bogotá" },
  { value: "America/Lima", label: "Lima" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Dublin", label: "Dublin" },
  { value: "Europe/Lisbon", label: "Lisbon" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Amsterdam", label: "Amsterdam" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/Rome", label: "Rome" },
  { value: "Europe/Stockholm", label: "Stockholm" },
  { value: "Europe/Warsaw", label: "Warsaw" },
  { value: "Europe/Helsinki", label: "Helsinki" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "Kolkata" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Seoul", label: "Seoul" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Australia/Melbourne", label: "Melbourne" },
  { value: "Pacific/Auckland", label: "Auckland" },
  { value: "Africa/Johannesburg", label: "Johannesburg" },
  { value: "Africa/Cairo", label: "Cairo" },
  { value: "UTC", label: "UTC" },
] as const;

export const isValidIanaTimeZone = (value: string) => {
  if (!value || value === OTHER_TIMEZONE_VALUE) {
    return false;
  }

  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

export const timezoneShortLabel = (timeZone: string) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(new Date());

    return (
      parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone
    );
  } catch {
    return timeZone;
  }
};

export const isListedTimezone = (value: string) =>
  COMMON_TIMEZONES.some((zone) => zone.value === value);
