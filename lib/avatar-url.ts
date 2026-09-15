const NORMAL_SIZE_SUFFIX = "_normal";

export const toOriginalAvatarUrl = (url: string) =>
  url.replace(NORMAL_SIZE_SUFFIX, "");
