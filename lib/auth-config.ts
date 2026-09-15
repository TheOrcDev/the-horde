export const isAuthConfigured = () =>
  Boolean(
    process.env.TWITTER_CLIENT_ID &&
      process.env.TWITTER_CLIENT_SECRET &&
      process.env.BETTER_AUTH_SECRET
  );
