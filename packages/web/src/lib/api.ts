import { treaty } from "@elysiajs/eden";
import { createAuthClient } from "better-auth/react";
import type { App } from "server";

const API_URL = "http://localhost:3005";

// Eden client for type-safe API calls.
export const api = treaty<App>(API_URL, {
  fetch: {
    credentials: "include",
  },
});

// Better-auth client for authentication.
export const authClient = createAuthClient({
  baseURL: API_URL,
  basePath: "/api",
});

export const { signIn, signUp, signOut, useSession } = authClient;

