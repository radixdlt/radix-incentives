import { TRPCError } from '@trpc/server';
import { Exit } from 'effect';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import type { MilestoneType } from './milestoneService';

const milestoneTypeSchema = z.enum([
  'tvl',
  'transactions',
  'dex_volume',
  'wallet_downloads',
]) as z.ZodEnum<[MilestoneType, ...MilestoneType[]]>;

export const adminMilestoneRouter = createTRPCRouter({
  /**
   * Get all milestones grouped by season for admin
   */
  getAllMilestonesGroupedBySeason: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getAllMilestonesGroupedBySeason();

    if (result._tag === 'Failure') {
      console.error(result.cause);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    return result.value;
  }),

  /**
   * Create a new milestone
   */
  createMilestone: publicProcedure
    .input(
      z.object({
        seasonId: z.string(),
        type: milestoneTypeSchema,
        goal: z.string(),
        rewardXrd: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.dependencyLayer.createMilestone(input);

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

  /**
   * Update an existing milestone
   */
  updateMilestone: publicProcedure
    .input(
      z.object({
        seasonId: z.string(),
        type: milestoneTypeSchema,
        goal: z.string(),
        newGoal: z.string().optional(),
        rewardXrd: z.string().optional(),
        currentValue: z.string().optional(),
        isAchieved: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.dependencyLayer.updateMilestone(input);

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

  /**
   * Delete a milestone
   */
  deleteMilestone: publicProcedure
    .input(
      z.object({
        seasonId: z.string(),
        type: milestoneTypeSchema,
        goal: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.dependencyLayer.deleteMilestone(input);

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

export const milestoneRouter = createTRPCRouter({
  /**
   * Get milestone data formatted for frontend components
   */
  getMilestoneProgress: publicProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.dependencyLayer.getMilestoneProgress(input);

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
