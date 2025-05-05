import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cookies, headers } from "next/headers";
import { cache } from "react";

import {
  createCaller,
  createDependencyLayer,
  type AppRouter,
} from "api/consultation";
import { createTRPCContext } from "api/consultation";
import { createQueryClient } from "./query-client";
import { db } from "db/consultation";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
    dependencyLayer: createDependencyLayer({
      dbClient: db,
    }),
    setSessionToken: async (token: string, expiresAt: Date) => {
      console.log("setting session token", { token, expiresAt });
      const cookieStore = await cookies();
      cookieStore.set("session", token, {
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    },
    getSessionToken: async () => {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get("session")?.value;

      return sessionToken ?? null;
    },
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);
