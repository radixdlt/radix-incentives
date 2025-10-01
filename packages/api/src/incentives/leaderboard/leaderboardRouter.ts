import { TRPCError } from '@trpc/server';
import { Exit } from 'effect';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

// Helper function to get user ID from session token
const getUserId = async (ctx: {
  sessionToken: string | null;
  dependencyLayer: {
    validateSessionToken: (
      token: string,
    ) => Promise<Exit.Exit<{ user: { id: string } }, unknown>>;
  };
}): Promise<string | undefined> => {
  if (!ctx.sessionToken) {
    return undefined;
  }

  try {
    const result = await ctx.dependencyLayer.validateSessionToken(
      ctx.sessionToken,
    );

    if (Exit.isSuccess(result)) {
      const validatedSession = result.value as { user: { id: string } };
      return validatedSession.user.id;
    }
  } catch (error) {
    // Silently ignore session validation errors for public procedures
    console.log('Session validation failed for public procedure:', error);
  }

  return undefined;
};

export const leaderboardRouter = createTRPCRouter({
  getSeasonLeaderboard: publicProcedure
    .input(
      z.object({
        seasonId: z.string().uuid(),
        weekId: z.string().uuid().optional(), // Optional week filter
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = await getUserId(ctx);

      const result = await ctx.dependencyLayer.getSeasonLeaderboard({
        seasonId: input.seasonId,
        weekId: input.weekId,
        userId,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          const isCacheNotAvailableError =
            error._tag === 'Fail' &&
            error.error._tag === 'CacheNotAvailableError';

          if (isCacheNotAvailableError) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message:
                'Leaderboard is still being built. Please check back in a few minutes.',
            });
          }

          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  getAvailableSeasons: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getAvailableSeasons();

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      },
    });
  }),

  getAvailableWeeks: publicProcedure
    .input(
      z.object({
        seasonId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getAvailableWeeks({
        seasonId: input.seasonId,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          const isCacheNotAvailableError =
            error._tag === 'Fail' &&
            error.error._tag === 'CacheNotAvailableError';

          if (isCacheNotAvailableError) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message:
                'Leaderboard is still being built. Please check back in a few minutes.',
            });
          }

          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  getActivityCategoryLeaderboard: publicProcedure
    .input(
      z.object({
        categoryId: z.string(),
        weekId: z.string().uuid(),
      }),
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
        onFailure: (error) => {
          const isCacheNotAvailableError =
            error._tag === 'Fail' &&
            error.error &&
            typeof error.error === 'object' &&
            '_tag' in error.error &&
            error.error._tag === 'CacheNotAvailableError';

          if (isCacheNotAvailableError) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message:
                'Leaderboard is still being built. Please check back in a few minutes.',
            });
          }

          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  getAvailableCategories: publicProcedure
    .input(z.object({ weekId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getAvailableCategories(input);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),
});
