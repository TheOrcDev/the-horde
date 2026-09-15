import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import db from "@/db/drizzle";
import { schema } from "@/db/schema";

interface TwitterProfile {
  data: {
    id: string;
    name: string;
    username?: string;
    profile_image_url?: string;
    confirmed_email?: string;
    email?: string;
  };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      scope: ["users.read", "tweet.read", "offline.access", "users.email"],
      mapProfileToUser: (profile: TwitterProfile) => {
        const data = profile.data;
        return {
          name: data.name,
          image: data.profile_image_url,
          email:
            data.email ??
            data.confirmed_email ??
            `${data.id}@twitter.placeholder.invalid`,
        };
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["twitter"],
    },
  },
  plugins: [nextCookies()],
});
