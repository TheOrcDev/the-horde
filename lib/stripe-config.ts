export const isStripeConfigured = () =>
  Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_FOUNDING_PRICE_ID &&
      process.env.STRIPE_LIST_PRICE_ID
  );
