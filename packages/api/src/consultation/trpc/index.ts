import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { BigNumber } from "bignumber.js";
import {
  type DependencyLayer,
  createDependencyLayer,
} from "./createDependencyLayer";
import { Exit } from "effect";

export type { DependencyLayer };
export { createDependencyLayer };

// Register BigNumber transformation with SuperJSON
superjson.registerCustom<BigNumber, string>(
  {
    isApplicable: (v): v is BigNumber => BigNumber.isBigNumber(v),
    serialize: v => v.toString(),
    deserialize: v => new BigNumber(v)
  },
  'BigNumber'
);

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  dependencyLayer: DependencyLayer;
  setSessionToken: (token: string, expiresAt: Date) => Promise<void>;
  getSessionToken: () => Promise<string | null>;
}) => {
  const sessionToken = await opts.getSessionToken();

  return {
    ...opts,
    sessionToken,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.sessionToken) {
      console.error("session token not found");
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    console.log("validating session token", ctx.sessionToken);

    const result = await ctx.dependencyLayer.validateSessionToken(
      ctx.sessionToken
    );

    if (Exit.isFailure(result)) {
      console.error(result.cause);
      if (result.cause._tag === "Fail") {
        switch (result.cause.error._tag) {
          case "SessionExpiredError":
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Session expired",
            });
          case "SessionNotFoundError":
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Session not found",
            });
        }
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unknown error",
      });
    }

    const { user } = result.value;

    return next({
      ctx: {
        session: { user },
      },
    });
  });
