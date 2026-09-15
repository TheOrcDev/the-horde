const TRAILING_SLASH = /\/$/;

export const cardShareText = (title: string) =>
  `I enlisted in The Horde as ${title}.\n\n#ForTheHorde`;

export const cardPermalink = (origin: string, handle: string) => {
  const base = origin.replace(TRAILING_SLASH, "");
  return `${base}/c/${handle}`;
};

export const getAppOrigin = (headerList: Headers) => {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL;

  if (fromEnv) {
    return fromEnv.replace(TRAILING_SLASH, "");
  }

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (!host) {
    return "";
  }

  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
};
