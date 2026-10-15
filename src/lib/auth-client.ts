"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

/** Type-only import of the server config, so sign-up knows about `username` and the other profile fields. */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
