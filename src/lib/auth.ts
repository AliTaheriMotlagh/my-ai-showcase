import "server-only";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { usernameError } from "./rules";
import { site } from "./site";

/**
 * Accounts use email + password. Sessions are httpOnly cookies, stored in Postgres.
 * Profile fields live on the same `user` row, so one query gives the viewer everything.
 */
export const auth = betterAuth({
  appName: site.name,
  baseURL: process.env.BETTER_AUTH_URL || site.url,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  user: {
    deleteUser: { enabled: true },
    additionalFields: {
      // Chosen at sign-up and validated in the create hook below.
      username: { type: "string", required: true, input: true },
      // Everything else is edited through our own actions, never accepted from sign-up.
      headline: { type: "string", required: false, defaultValue: "", input: false },
      bio: { type: "string", required: false, defaultValue: "", input: false },
      location: { type: "string", required: false, defaultValue: "", input: false },
      website: { type: "string", required: false, defaultValue: "", input: false },
      tools: { type: "string[]", required: false, defaultValue: [], input: false },
      banner: { type: "string", required: false, input: false },
      verified: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (data) => {
          const username = String(data.username ?? "").trim().toLowerCase();
          const problem = usernameError(username);
          if (problem) throw new APIError("BAD_REQUEST", { message: problem });
          const taken = await db
            .select({ id: schema.user.id })
            .from(schema.user)
            .where(sql`lower(${schema.user.username}) = ${username}`)
            .limit(1);
          if (taken.length) throw new APIError("BAD_REQUEST", { message: "That username is taken." });
          return { data: { ...data, username } };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
