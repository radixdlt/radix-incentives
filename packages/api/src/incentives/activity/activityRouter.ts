import { TRPCError } from '@trpc/server';
import {
  activityCategories,
  activityCategoryWeeks,
  dapps,
  db,
  weeks,
} from 'db/incentives';
import { desc, eq, inArray } from 'drizzle-orm';
import { Exit } from 'effect';
import { z } from 'zod';
import {
  CreateActivityCategorySchema,
  UpdateActivityCategorySchema,
} from '../activity-category/activityCategory';
import { CreateDappSchema, UpdateDappSchema } from '../dapp/dapp';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { UpdateActivitySchema } from './activity';

export const adminActivityRouter = createTRPCRouter({
  getActivities: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getActivities();

    if (result._tag === 'Failure') {
      console.error(result.cause);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    return result.value;
  }),
  getActivityById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getActivityById({
        id: input.id,
      });

      return Exit.match(result, {
        onSuccess: (value) => {
          return value;
        },
        onFailure: (error) => {
          if (error._tag === 'Fail') {
            if (error.error._tag === 'NotFoundError') {
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

  updateActivity: publicProcedure
    .input(UpdateActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateActivity(input);

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

  getActivityCategories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getActivityCategories();

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

  // Activity Category Management
  createActivityCategory: publicProcedure
    .input(CreateActivityCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.createActivityCategory(input);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create activity category',
          });
        },
      });
    }),

  updateActivityCategory: publicProcedure
    .input(UpdateActivityCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateActivityCategory(input);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update activity category',
          });
        },
      });
    }),

  deleteActivityCategory: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.deleteActivityCategory(input.id);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete activity category',
          });
        },
      });
    }),

  // Dapp Management
  getDapps: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getDapps();

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dapps',
        });
      },
    });
  }),

  createDapp: publicProcedure
    .input(CreateDappSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.createDapp(input);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create dapp',
          });
        },
      });
    }),

  updateDapp: publicProcedure
    .input(UpdateDappSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateDapp(input);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update dapp',
          });
        },
      });
    }),

  deleteDapp: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.deleteDapp(input.id);

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete dapp',
          });
        },
      });
    }),
});

export const activityRouter = createTRPCRouter({
  getActivityCategories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getActivityCategories();

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

  getEarnPageCategories: publicProcedure.query(async () => {
    try {
      // First, get the current active week (most recent week)
      const currentWeek = await db
        .select({ id: weeks.id })
        .from(weeks)
        .orderBy(desc(weeks.startDate))
        .limit(1);

      if (currentWeek.length === 0) {
        return [];
      }

      const currentWeekId = currentWeek[0].id;

      // Get all categories that should be shown on earn page
      const categoriesData = await db
        .select()
        .from(activityCategories)
        .where(eq(activityCategories.showOnEarnPage, true));

      // Get SP allocations for current week
      const spAllocations = await db
        .select({
          activityCategoryId: activityCategoryWeeks.activityCategoryId,
          pointsPool: activityCategoryWeeks.pointsPool,
        })
        .from(activityCategoryWeeks)
        .where(eq(activityCategoryWeeks.weekId, currentWeekId));

      const spAllocationMap = new Map(
        spAllocations.map((alloc) => [
          alloc.activityCategoryId,
          alloc.pointsPool,
        ]),
      );

      // Get related dApps for each category
      const categoriesWithData = await Promise.all(
        categoriesData.map(async (category) => {
          const dappIds = (category.dappIds as string[]) || [];
          let relatedDapps = [];

          if (dappIds.length > 0) {
            relatedDapps = await db
              .select()
              .from(dapps)
              .where(inArray(dapps.id, dappIds));
          }

          return {
            id: category.id,
            name: category.name,
            description: category.description,
            multiplier: category.multiplier || false,
            dappIds,
            showOnEarnPage: category.showOnEarnPage || true,
            seasonPointsPerWeek: spAllocationMap.get(category.id) || 0,
            dapps: relatedDapps,
          };
        }),
      );

      return categoriesWithData;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch earn page categories',
      });
    }
  }),
  getActivityData: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getActivityData();

    return Exit.match(result, {
      onSuccess: (value) => {
        return value.filter((activity) => activity.data?.showOnEarnPage);
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
