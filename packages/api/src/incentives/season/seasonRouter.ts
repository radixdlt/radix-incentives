import { TRPCError } from '@trpc/server';
import { Effect, Exit, Option, Schema } from 'effect';
import { SeasonId } from 'shared/brandedTypes';
import { z } from 'zod';
import { resolveEffect } from '../runtime';
import { IncentivesVester } from '../season-reward/incentives-vester/incentivesVester';
import {
  RewardBudget,
  SeasonRewardService,
} from '../season-reward/seasonReward';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { effectSchemaParser } from '../trpc/helpers';
import {
  CreateSeasonSchema,
  EditSeasonSchema,
  SeasonConfigSchema,
  SeasonService,
} from './season';

export const seasonRouter = createTRPCRouter({
  getSeasons: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getSeasons();

    if (result._tag === 'Failure') {
      console.error(result.cause);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    return result.value;
  }),

  getSeasonById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getSeasonById({
        id: input.id,
        includeWeeks: true,
      });

      return Exit.match(result, {
        onSuccess: (value) => {
          const { weeks, activityWeeks, season } = value;

          return {
            season,
            weeks: weeks ?? [],
            activityWeeks: activityWeeks ?? [],
          };
        },
        onFailure: (error) => {
          if (error._tag === 'Fail') {
            if (error.error._tag === 'SeasonNotFoundError') {
              throw new TRPCError({
                code: 'NOT_FOUND',
                message: error.error.message,
              });
            }

            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'An unexpected error occurred',
            });
          }
        },
      });
    }),
});

export const adminSeasonRouter = createTRPCRouter({
  getSeasons: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getSeasons();

    if (result._tag === 'Failure') {
      console.error(result.cause);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    return result.value;
  }),

  getSeasonById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getSeasonById({
        id: input.id,
        includeWeeks: true,
      });

      return Exit.match(result, {
        onSuccess: (value) => {
          const { weeks, activityWeeks, season } = value;

          return {
            season,
            weeks: weeks ?? [],
            activityWeeks: activityWeeks ?? [],
          };
        },
        onFailure: (error) => {
          if (error._tag === 'Fail') {
            if (error.error._tag === 'SeasonNotFoundError') {
              throw new TRPCError({
                code: 'NOT_FOUND',
                message: error.error.message,
              });
            }

            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'An unexpected error occurred',
            });
          }
        },
      });
    }),

  createSeason: publicProcedure
    .input(CreateSeasonSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.createSeason({
        ...input,
        config: {},
      });

      return Exit.match(result, {
        onSuccess: (value) => {
          return value;
        },
        onFailure: (error) => {
          if (error._tag === 'Fail') {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
            });
          }
        },
      });
    }),

  editSeason: publicProcedure
    .input(EditSeasonSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.editSeason(input);

      return Exit.match(result, {
        onSuccess: (value) => {
          return value;
        },
        onFailure: (error) => {
          if (error._tag === 'Fail') {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
            });
          }
        },
      });
    }),

  addProcessWeekJob: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
        force: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${process.env.WORKERS_API_BASE_URL}/queues/process-week/add`,
        {
          method: 'POST',
          body: JSON.stringify({
            weekId: input.weekId,
            force: input.force,
          }),
        },
      );

      if (!response.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  updateWeekStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        processed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateWeekStatus(input);

      return Exit.match(result, {
        onSuccess: () => {
          return { success: true };
        },
        onFailure: (error) => {
          if (error._tag === 'Fail') {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
            });
          }
        },
      });
    }),

  calculateRewards: publicProcedure
    .input(
      effectSchemaParser(
        Schema.Struct({
          seasonId: SeasonId,
          rewardBudget: Schema.NumberFromString.pipe(
            Schema.greaterThan(0),
            Schema.transform(RewardBudget, {
              decode: (n) => n.toString(),
              encode: (s) => Number(s),
            }),
          ),
        }),
      ),
    )
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const seasonRewardService = yield* SeasonRewardService;

          // Calculate rewards
          const calculatedRewards =
            yield* seasonRewardService.calculateSeasonReward({
              seasonId: input.seasonId,
              rewardBudget: input.rewardBudget,
            });

          // Save rewards
          yield* seasonRewardService.saveSeasonRewards({
            seasonId: input.seasonId,
            rewards: calculatedRewards.map((reward) => ({
              userId: reward.userId,
              rewardAmount: reward.rewardAmount,
            })),
          });

          return {
            success: true,
            userCount: calculatedRewards.length,
            totalRewardBudget: input.rewardBudget,
          };
        }),
      ),
    ),

  getSeasonConfig: publicProcedure
    .input(effectSchemaParser(Schema.Struct({ seasonId: SeasonId })))
    .query(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const seasonService = yield* SeasonService;
          return yield* seasonService.getConfig(input.seasonId);
        }),
      ),
    ),

  updateSeasonConfig: publicProcedure
    .input(
      effectSchemaParser(
        Schema.Struct({
          seasonId: SeasonId,
          config: SeasonConfigSchema,
        }),
      ),
    )
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const seasonService = yield* SeasonService;
          yield* seasonService.updateConfig(input.seasonId, input.config);
          return { success: true };
        }),
      ),
    ),

  toggleKillSwitch: publicProcedure
    .input(effectSchemaParser(Schema.Struct({ seasonId: SeasonId })))
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const seasonService = yield* SeasonService;
          const config = yield* seasonService.getConfig(input.seasonId);

          const componentAddress = Option.getOrThrow(
            Option.fromNullable(config.seasonRewardComponentAddress),
          );
          const adminAccount = Option.getOrThrow(
            Option.fromNullable(config.adminAccount),
          );
          const adminBadge = Option.getOrThrow(
            Option.fromNullable(config.adminBadge),
          );

          const incentivesVester = yield* IncentivesVester;
          yield* incentivesVester.toggleKillSwitch({
            componentAddress,
            adminAccount,
            adminBadge,
          });

          return { success: true };
        }),
      ),
    ),
});
