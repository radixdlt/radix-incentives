import { TRPCError } from '@trpc/server';
import { Effect, Exit } from 'effect';
import { z } from 'zod';
import { resolveEffect } from '../runtime';
import { SeasonBonusService } from '../season-bonus/seasonBonusService';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { UserEmailInputSchema, UserService } from './user';

export const userRouter = createTRPCRouter({
  getUserStats: protectedProcedure
    .input(z.object({ weekId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getUserStats({
        userId: ctx.session.user.id,
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

  getUserCategoryBreakdown: protectedProcedure
    .input(z.object({ weekId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getUserCategoryBreakdown({
        userId: ctx.session.user.id,
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

  getUserReferralStats: protectedProcedure
    .input(z.object({ seasonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getUserReferralStats({
        userId: ctx.session.user.id,
        seasonId: input.seasonId,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  getUserCapitalAtWork: protectedProcedure
    .input(z.object({ weekId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getUserCapitalAtWork({
        userId: ctx.session.user.id,
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

  getAnonymousCapitalAtWork: publicProcedure
    .input(z.object({ weekId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getUserCapitalAtWork({
        userId: undefined, // Explicitly undefined for anonymous data
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

  userExists: publicProcedure
    .input(z.object({ identityAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getUserByIdentityAddress({
        identityAddress: input.identityAddress,
      });
      return Exit.match(result, {
        onSuccess: (value) => !!value,
        onFailure: (error) => {
          if (error._tag === 'Fail') {
            if (error.error._tag === 'UserNotFoundError') {
              return false;
            }
          }

          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  getMultiplierByUserId: protectedProcedure
    .input(z.object({ weekId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getMultiplierByUserId({
        userId: ctx.session.user.id,
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
  setEmail: protectedProcedure
    .input(UserEmailInputSchema.omit({ userId: true }))
    .mutation(async ({ ctx, input }) => {
      return resolveEffect(
        Effect.gen(function* () {
          const userService = yield* UserService;
          yield* userService.setEmail({
            email: input.email,
            userId: ctx.session.user.id,
          });
        }),
      );
    }),
  getUser: protectedProcedure.query(async ({ ctx }) => {
    return resolveEffect(
      Effect.gen(function* () {
        const userService = yield* UserService;
        return yield* userService.getUser({ userId: ctx.session.user.id });
      }),
    );
  }),

  getSeasonBonus: protectedProcedure
    .input(z.object({ seasonId: z.string().uuid() }))
    .query(async ({ ctx, input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const service = yield* SeasonBonusService;
          return yield* service.getSeasonBonus(
            ctx.session.user.id,
            input.seasonId,
          );
        }),
      ),
    ),
});

export const adminUserRouter = createTRPCRouter({
  getUsersPaginated: publicProcedure
    .input(z.object({ page: z.number(), limit: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getUsersPaginated(input);

      if (result._tag === 'Failure') {
        console.error(result.cause);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      return result.value;
    }),

  getUserActivityPointsByWeek: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        weekId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const result =
        await ctx.dependencyLayer.getUserActivityPointsByWeek(input);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
          });
        },
      });
    }),
});
