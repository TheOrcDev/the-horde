import { z } from "zod";

export const SPONSOR_NAME_MAX = 80;
export const SPONSOR_TAGLINE_MAX = 160;
const SLUG_MAX_LENGTH = 48;

export const sponsorCheckoutSchema = z.object({
  name: z.string().trim().min(1).max(SPONSOR_NAME_MAX),
  tagline: z.string().trim().min(1).max(SPONSOR_TAGLINE_MAX),
  url: z.url(),
  logoUrl: z.url(),
  email: z.email(),
});

export const portalRequestSchema = z
  .object({
    sessionId: z.string().min(1).optional(),
    stripeCustomerId: z.string().min(1).optional(),
    email: z.email().optional(),
  })
  .refine(
    (value) =>
      Boolean(value.sessionId || value.stripeCustomerId || value.email),
    { message: "A billing reference is required" }
  );

export type SponsorCheckoutInput = z.infer<typeof sponsorCheckoutSchema>;

export const slugifyName = (name: string) => {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    return "sponsor";
  }

  return slug.slice(0, SLUG_MAX_LENGTH);
};
