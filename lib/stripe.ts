import "server-only";

import Stripe from "stripe";

export const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Stripe is not configured");
  }

  return new Stripe(secretKey);
};

export const getStripeWebhookSecret = () => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Stripe is not configured");
  }

  return webhookSecret;
};
