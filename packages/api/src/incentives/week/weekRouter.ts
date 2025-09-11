import { TRPCError } from '@trpc/server';
import { Exit } from 'effect';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const weekRouter = createTRPCRouter({
  getWeeks: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getAvailableWeeks({
      seasonId: undefined,
    });

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      },
    });
  }),
});

export const weekAdminRouter = createTRPCRouter({
  getWeekDetails: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getWeekDetails({
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
  updatePointsPool: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
        activityCategoryId: z.string(),
        pointsPool: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateCategoryWeekPointsPool({
        weekId: input.weekId,
        activityCategoryId: input.activityCategoryId,
        pointsPool: input.pointsPool,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),
  updateActivityWeekMultiplier: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
        activityId: z.string(),
        multiplier: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateActivityWeekMultiplier({
        weekId: input.weekId,
        activityId: input.activityId,
        multiplier: input.multiplier,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  updateCategoryWeekLowerBoundsPercentage: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
        activityCategoryId: z.string(),
        lowerBoundsPercentage: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result =
        await ctx.dependencyLayer.updateCategoryWeekLowerBoundsPercentage({
          weekId: input.weekId,
          activityCategoryId: input.activityCategoryId,
          lowerBoundsPercentage: input.lowerBoundsPercentage,
        });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  updateCategoryWeekOutlierThresholdPercentage: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
        activityCategoryId: z.string(),
        outlierThresholdPercentage: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result =
        await ctx.dependencyLayer.updateCategoryWeekOutlierThresholdPercentage({
          weekId: input.weekId,
          activityCategoryId: input.activityCategoryId,
          outlierThresholdPercentage: input.outlierThresholdPercentage,
        });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  updateCategoryWeekEnableOutlierDetection: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
        activityCategoryId: z.string(),
        enableOutlierDetection: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result =
        await ctx.dependencyLayer.updateCategoryWeekEnableOutlierDetection({
          weekId: input.weekId,
          activityCategoryId: input.activityCategoryId,
          enableOutlierDetection: input.enableOutlierDetection,
        });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),

  createWeek: publicProcedure
    .input(
      z.object({
        seasonId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.createWeek({
        seasonId: input.seasonId,
        startDate: input.startDate,
        endDate: input.endDate,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        },
      });
    }),
});
