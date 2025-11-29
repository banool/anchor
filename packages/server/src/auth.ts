import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./database/client";
import Elysia from "elysia";
/*
import {
  APPLE_CLIENT_ID,
  APPLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET,
} from "./config";
*/

export const auth = betterAuth({
  appName: "Anchor",
  basePath: "/api",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 96,
  },
  /*
  socialProviders: {
    apple: {
      enabled: true,
      clientId: APPLE_CLIENT_ID,
      clientSecret: APPLE_CLIENT_SECRET,
    },
    facebook: {
      enabled: true,
      clientId: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
    },
    google: {
      enabled: true,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
    microsoft: {
      enabled: true,
      clientId: MICROSOFT_CLIENT_ID,
      clientSecret: MICROSOFT_CLIENT_SECRET,
    },
  },
  */
  experimental: { joins: true },
} satisfies BetterAuthOptions);

export const betterAuthElysia = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
  auth: {
    async resolve({ status, request: { headers, url } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) {
        console.error("Unauthorized request received for route", url);
        return status(401);
      }

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
