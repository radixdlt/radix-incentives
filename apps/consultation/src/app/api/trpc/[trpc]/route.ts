import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { env } from "~/env";
import { appRouter, createDependencyLayer } from "api/consultation";
import { createTRPCContext } from "api/consultation";
import { db } from "db/consultation";
import { cookies } from "next/headers";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
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
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
