import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { createCaller, createDependencyLayer, type AppRouter } from "api";
import { createTRPCContext } from "api";
import { createQueryClient } from "./query-client";
import { db } from "db/incentives";

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
      // TODO: Implement setSessionToken
    },
    getSessionToken: async () => {
      // TODO: Implement getSessionToken
      return null;
    },
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);
