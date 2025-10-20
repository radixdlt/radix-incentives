import { TRPCError } from '@trpc/server';
import { Exit } from 'effect';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const resourceRewardRouter = createTRPCRouter({
  getResourceRewards: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.listResourceRewards();

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      },
    });
  }),
  getUserResourceRewards: protectedProcedure
    .input(z.object({ weekId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const result = await ctx.dependencyLayer.getUserResourceRewards({
        userId,
        weekId: input.weekId,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  claimResourceRewards: protectedProcedure
    .input(
      z.object({
        resourceManager: z.string(),
        weekId: z.string(),
        seasonId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.claimResourceRewards({
        ...input,
        userId: ctx.session.user.id,
      });
      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          if (error._tag === 'Fail') {
            switch (error.error._tag) {
              case 'ConfigError':
              case 'DbError':
              case 'GatewayError':
              case 'ParseError':
                throw new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                });
              default:
                throw new TRPCError({
                  code: 'BAD_GATEWAY',
                  message:
                    'message' in error.error
                      ? error.error.message
                      : 'An unexpected error occurred',
                });
            }
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),
});
