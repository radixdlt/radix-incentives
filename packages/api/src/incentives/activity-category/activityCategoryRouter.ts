import { TRPCError } from '@trpc/server';
import { Exit } from 'effect';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { UpdateActivityCategorySchema } from './activityCategory';

export const activityCategoryRouter = createTRPCRouter({
  getActivityCategoriesForEarnPage: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getActivityCategoriesForEarnPage();

    return Exit.match(result, {
      onSuccess: (value) => {
        return value;
      },
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        });
      },
    });
  }),

  getEarnPageData: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getEarnPageData();

    return Exit.match(result, {
      onSuccess: (value) => {
        return value;
      },
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        });
      },
    });
  }),
});

export const adminActivityCategoryRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getActivityCategories();
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
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: UpdateActivityCategorySchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.dependencyLayer.updateActivityCategory(
        input.id,
        input.data,
      );
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
