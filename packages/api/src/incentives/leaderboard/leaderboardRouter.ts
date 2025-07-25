import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";
import { CacheNotAvailableError } from "./leaderboard";

// Helper function to get user ID from session token
const getUserId = async (ctx: {
  sessionToken: string | null;
  dependencyLayer: {
    validateSessionToken: (
      token: string
    ) => Promise<Exit.Exit<{ user: { id: string } }, unknown>>;
  };
}): Promise<string | undefined> => {
  if (!ctx.sessionToken) {
    return undefined;
  }

  try {
    const result = await ctx.dependencyLayer.validateSessionToken(
      ctx.sessionToken
    );

    if (Exit.isSuccess(result)) {
      const validatedSession = result.value as { user: { id: string } };
      return validatedSession.user.id;
    }
  } catch (error) {
    // Silently ignore session validation errors for public procedures
    console.log("Session validation failed for public procedure:", error);
  }

  return undefined;
};

// Helper function to handle errors consistently
const handleServiceError = (error: unknown): never => {
  if (error instanceof CacheNotAvailableError) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: error.message,
    });
  }

  console.error(error);
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
};

export const leaderboardRouter = createTRPCRouter({
  getSeasonLeaderboard: publicProcedure
    .input(
      z.object({
        seasonId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = await getUserId(ctx);

      const result = await ctx.dependencyLayer.getSeasonLeaderboard({
        seasonId: input.seasonId,
        userId,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: handleServiceError,
      });
    }),

  getAvailableSeasons: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getAvailableSeasons();

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      },
    });
  }),

  getAvailableWeeks: publicProcedure
    .input(
      z.object({
        seasonId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getAvailableWeeks({
        seasonId: input.seasonId,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: handleServiceError,
      });
    }),

  getAvailableActivities: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getAvailableActivities();

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      },
    });
  }),

  getActivityCategoryLeaderboard: publicProcedure
    .input(
      z.object({
        categoryId: z.string(),
        weekId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = await getUserId(ctx);

      const result = await ctx.dependencyLayer.getActivityCategoryLeaderboard({
        categoryId: input.categoryId,
        weekId: input.weekId,
        userId,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: handleServiceError,
      });
    }),

  getAvailableCategories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getAvailableCategories();

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      },
    });
  }),
});
