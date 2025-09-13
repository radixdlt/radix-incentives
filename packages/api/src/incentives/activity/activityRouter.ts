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
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
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

  getEarnPageCategories: publicProcedure.query(async ({ ctx: _ctx }) => {
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
          let relatedDapps: any[] = [];

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

  getEarnPageCategoriesWithUserData: protectedProcedure.query(
    async ({ ctx }) => {
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

        // Get user's account balances
        const userBalancesResult =
          await ctx.dependencyLayer.getLatestAccountBalances({
            userId: ctx.session.user.id,
          });

        let userBalances: Array<{ activityId: string; usdValue: string }> = [];
        if (userBalancesResult._tag === 'Success') {
          userBalances = userBalancesResult.value.flatMap(
            (balance) => balance.data,
          );
        }

        // Group user balances by activity category
        const userBalancesByCategory = new Map<string, number>();

        // Get activities to map them to categories
        const activitiesResult = await ctx.dependencyLayer.getActivities();
        if (activitiesResult._tag === 'Success') {
          const activities = activitiesResult.value;

          // Create a map of activityId -> categoryId
          const activityToCategoryMap = new Map<string, string>();
          for (const activity of activities) {
            activityToCategoryMap.set(activity.id, activity.category);
          }

          // Sum up user balances by category
          for (const balance of userBalances) {
            const categoryId = activityToCategoryMap.get(balance.activityId);
            if (categoryId) {
              const currentValue = userBalancesByCategory.get(categoryId) || 0;
              userBalancesByCategory.set(
                categoryId,
                currentValue + parseFloat(balance.usdValue),
              );
            }
          }
        }

        // Get related dApps for each category and include user data
        const categoriesWithData = await Promise.all(
          categoriesData.map(async (category) => {
            const dappIds = (category.dappIds as string[]) || [];
            let relatedDapps: any[] = [];

            if (dappIds.length > 0) {
              relatedDapps = await db
                .select()
                .from(dapps)
                .where(inArray(dapps.id, dappIds));
            }

            const userInvestment = userBalancesByCategory.get(category.id) || 0;
            const hoursInWeek = 168; // 7 days * 24 hours
            const apPerHour = userInvestment / hoursInWeek;

            return {
              id: category.id,
              name: category.name,
              description: category.description,
              multiplier: category.multiplier || false,
              dappIds,
              showOnEarnPage: category.showOnEarnPage || true,
              seasonPointsPerWeek: spAllocationMap.get(category.id) || 0,
              dapps: relatedDapps,
              userInvestment,
              apPerHour,
            };
          }),
        );

        return categoriesWithData;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch earn page categories with user data',
        });
      }
    },
  ),
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

  getActivitiesByCategory: publicProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const result = await ctx.dependencyLayer.getActivityData();

        if (result._tag === 'Failure') {
          console.error(result.cause);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch activities',
          });
        }

        // Filter by category without the showOnEarnPage restriction
        const activities = result.value.filter(
          (activity) => activity.category === input.categoryId,
        );
        console.log(
          `Found ${activities.length} activities for category ${input.categoryId}`,
        );

        // Get dApp data for activities (extract dApp IDs from activity IDs)
        const dappIds = new Set<string>();
        activities.forEach((activity) => {
          // Extract dApp ID from activity ID (e.g., 'oc_ho_ilis-xrd' -> 'oc')
          const dappId = activity.id.split('_')[0];
          dappIds.add(dappId);
        });

        // Fetch dApp data
        const dappsData = await db
          .select()
          .from(dapps)
          .where(inArray(dapps.id, Array.from(dappIds)));

        const dappMap = new Map(dappsData.map((dapp) => [dapp.id, dapp]));

        // Enhance activities with dApp info
        const activitiesWithDappData = activities.map((activity) => {
          // Extract dApp ID from activity ID
          const dappId = activity.id.split('_')[0];
          const dapp = dappMap.get(dappId);

          return {
            ...activity,
            dapp,
          };
        });

        return activitiesWithDappData;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        });
      }
    }),

  getActivitiesByCategoryWithUserData: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Get activities for the category
        const activitiesResult = await ctx.dependencyLayer.getActivityData();

        if (activitiesResult._tag === 'Failure') {
          console.error(activitiesResult.cause);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch activities',
          });
        }

        const activities = activitiesResult.value.filter(
          (activity) => activity.category === input.categoryId,
        );

        // Get user's account balances
        const userBalancesResult =
          await ctx.dependencyLayer.getLatestAccountBalances({
            userId: ctx.session.user.id,
          });

        let userBalances: Array<{ activityId: string; usdValue: string }> = [];
        if (userBalancesResult._tag === 'Success') {
          userBalances = userBalancesResult.value.flatMap(
            (balance) => balance.data,
          );
        }

        // Create a map of activityId -> user investment
        const userInvestmentMap = new Map<string, number>();
        for (const balance of userBalances) {
          userInvestmentMap.set(
            balance.activityId,
            parseFloat(balance.usdValue),
          );
        }

        // Get dApp data for activities (extract dApp IDs from activity IDs)
        const dappIds = new Set<string>();
        activities.forEach((activity) => {
          // Extract dApp ID from activity ID (e.g., 'oc_ho_ilis-xrd' -> 'oc')
          const dappId = activity.id.split('_')[0];
          dappIds.add(dappId);
        });

        // Fetch dApp data
        const dappsData = await db
          .select()
          .from(dapps)
          .where(inArray(dapps.id, Array.from(dappIds)));

        const dappMap = new Map(dappsData.map((dapp) => [dapp.id, dapp]));

        // Enhance activities with user data and dApp info
        const activitiesWithUserData = activities.map((activity) => {
          const userInvestment = userInvestmentMap.get(activity.id) || 0;
          const hoursInWeek = 168; // 7 days * 24 hours
          const apPerHour = userInvestment / hoursInWeek;

          // Extract dApp ID from activity ID
          const dappId = activity.id.split('_')[0];
          const dapp = dappMap.get(dappId);

          return {
            ...activity,
            userInvestment,
            apPerHour,
            dapp,
          };
        });
        return activitiesWithUserData;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch activities with user data',
        });
      }
    }),
});
