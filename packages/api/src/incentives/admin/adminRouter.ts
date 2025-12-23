import { TRPCError } from '@trpc/server';
import BigNumber from 'bignumber.js';
import {
  ActivitySchema,
  accountActivityPoints,
  accountBalances,
  accounts,
  activities,
  db,
  seasonPointsMultiplier,
  user,
  userSeasonPoints,
} from 'db/incentives';
import { and, count, desc, eq, inArray, lte, sql, sum } from 'drizzle-orm';
import { Effect, Exit } from 'effect';
import { groupBy } from 'effect/Array';
import { z } from 'zod';
import { resolveEffect } from '../runtime';
import {
  GetSeasonRewardStatsInputSchema,
  ListUserSeasonRewardsInputSchema,
  SeasonRewardService,
} from '../season-reward/seasonReward';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { effectSchemaParser } from '../trpc/helpers';
import {
  seasonPointsMultiplierJobSchema,
  snapshotDateRangeJobSchema,
} from '../worker/workerApi';

export const adminRouter = createTRPCRouter({
  user: {
    getUser: publicProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .query(async ({ input }) => {
        const userResult = await db
          .select({
            userId: user.id,
            label: user.label,
            email: user.email,
            totalSeasonPoints: sum(userSeasonPoints.points),
          })
          .from(user)
          .where(eq(user.id, input.id))
          .leftJoin(userSeasonPoints, eq(user.id, userSeasonPoints.userId))
          .groupBy(user.id, user.label, user.email);

        if (userResult.length === 0) {
          return [];
        }

        const userAccounts = await db.query.accounts.findMany({
          where: eq(accounts.userId, input.id),
        });

        const result = userResult.map((item) => ({
          ...item,
          totalSeasonPoints: new BigNumber(item.totalSeasonPoints ?? 0),
          accounts: userAccounts,
        }));

        return result;
      }),

    getActivityPoints: publicProcedure
      .input(
        z.object({
          address: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return db.query.accountActivityPoints.findMany({
          where: and(eq(accountActivityPoints.accountAddress, input.address)),
        });
      }),

    getSeasonPoints: publicProcedure
      .input(
        z.object({
          weekId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return db
          .select({
            userId: user.id,
            label: user.label,
            multiplier: seasonPointsMultiplier.multiplier,
            points: userSeasonPoints.points,
          })
          .from(userSeasonPoints)
          .innerJoin(user, eq(userSeasonPoints.userId, user.id))
          .innerJoin(
            seasonPointsMultiplier,
            and(
              eq(user.id, seasonPointsMultiplier.userId),
              eq(seasonPointsMultiplier.weekId, input.weekId),
            ),
          )
          .where(eq(userSeasonPoints.weekId, input.weekId))
          .then((items) =>
            items.map((item) => ({
              userId: item.userId,
              label: item.label,
              multiplier: item.multiplier,
              points: new BigNumber(item.points),
            })),
          );
      }),

    getAccountBalances: publicProcedure
      .input(
        z.object({
          address: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return db.query.accountBalances.findMany({
          where: and(eq(accountBalances.accountAddress, input.address)),
        });
      }),

    getLatestAccountBalances: publicProcedure
      .input(z.object({ userId: z.string(), timestamp: z.date() }))
      .query(async ({ input }) => {
        // First get all accounts for this user
        const userAccounts = await db
          .select({ address: accounts.address })
          .from(accounts)
          .where(eq(accounts.userId, input.userId));

        const activityData = await db.query.activities.findMany({
          columns: {
            id: true,
            category: true,
          },
        });

        const activityDataMap = new Map(
          activityData.map((item) => [item.id, item]),
        );

        if (userAccounts.length === 0) {
          return [];
        }

        // Then get the latest balance for each account
        const addresses = userAccounts.map((acc) => acc.address);
        return await db
          .selectDistinctOn([accountBalances.accountAddress])
          .from(accountBalances)
          .where(
            and(
              inArray(accountBalances.accountAddress, addresses),
              lte(accountBalances.timestamp, input.timestamp),
            ),
          )
          .orderBy(
            accountBalances.accountAddress,
            desc(accountBalances.timestamp),
          )
          .then((items) =>
            items.map((item) => ({
              ...item,
              data: (
                item.data as { activityId: string; usdValue: string }[]
              ).map((item) => ({
                ...item,
                categoryId: activityDataMap.get(item.activityId)?.category!,
              })),
            })),
          );
      }),

    simulateCalculateSeasonPoints: publicProcedure
      .input(
        z.object({
          weekId: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const result = await ctx.dependencyLayer.calculateSeasonPoints({
          weekId: input.weekId,
          markAsProcessed: false,
          dryRun: true,
        });

        const value = Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (error) => {
            console.error(error);
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
            });
          },
        });

        const users = await db
          .select({
            userId: user.id,
            label: user.label,
            multiplier: seasonPointsMultiplier.multiplier,
          })
          .from(user)
          .where(
            inArray(
              user.id,
              value.userSeasonPoints.map((item) => item.userId),
            ),
          )
          .innerJoin(
            seasonPointsMultiplier,
            and(
              eq(user.id, seasonPointsMultiplier.userId),
              eq(seasonPointsMultiplier.weekId, input.weekId),
            ),
          )
          .then((items) => groupBy(items, (item) => item.userId));

        const output = value.userSeasonPoints.map(
          ({ seasonId, weekId, ...item }) => {
            const user = users[item.userId]?.[0]!;
            return {
              ...item,
              ...user,
            };
          },
        );

        return {
          users: output,
          categoryStatistics: value.categoryStatistics,
        };
      }),
  },
  activity: {
    userCount: publicProcedure
      .input(
        z.object({
          weekId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return db
          .select({
            numberOfAccounts: count(),
            activityId: accountActivityPoints.activityId,
          })
          .from(accountActivityPoints)
          .where(eq(accountActivityPoints.weekId, input.weekId))
          .groupBy(accountActivityPoints.activityId);
      }),

    getUsers: publicProcedure
      .input(
        z.object({
          activityId: z.string(),
          weekId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return db
          .select({
            accountAddress: accountActivityPoints.accountAddress,
            activityPoints: accountActivityPoints.activityPoints,
            accountLabel: user.label,
            accountId: user.id,
            multiplier: seasonPointsMultiplier.multiplier,
          })
          .from(accountActivityPoints)
          .where(
            and(
              eq(accountActivityPoints.activityId, input.activityId),
              eq(accountActivityPoints.weekId, input.weekId),
            ),
          )
          .innerJoin(
            accounts,
            eq(accountActivityPoints.accountAddress, accounts.address),
          )
          .innerJoin(user, eq(accounts.userId, user.id))
          .leftJoin(
            seasonPointsMultiplier,
            and(
              eq(accounts.userId, seasonPointsMultiplier.userId),
              eq(seasonPointsMultiplier.weekId, input.weekId),
            ),
          );
      }),

    triggerActivityPointsCalculation: publicProcedure
      .input(
        z.object({
          weekId: z.string(),
          addresses: z.array(z.string()).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const response = await fetch(
          `${process.env.WORKERS_API_BASE_URL}/queues/calculate-activity-points/add`,
          {
            method: 'POST',
            body: JSON.stringify({
              weekId: input.weekId,
              addresses: input.addresses,
            }),
          },
        );

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
          });
        }
      }),

    bulkEdit: publicProcedure
      .input(z.array(ActivitySchema))
      .mutation(async ({ input }) => {
        await db
          .insert(activities)
          .values(input)
          .onConflictDoUpdate({
            target: [activities.id],
            set: {
              name: sql`excluded.name`,
              data: sql`excluded.data`,
            },
          });
      }),
  },
  transactionStream: {
    getState: publicProcedure.query(async ({ ctx }) => {
      const result = await ctx.dependencyLayer.getTransactionStreamState();
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
    getStateVersion: publicProcedure.query(async ({ ctx }) => {
      const result =
        await ctx.dependencyLayer.getTransactionStreamStateVersion();

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
    setState: publicProcedure
      .input(z.object({ state: z.enum(['START', 'PAUSE']) }))
      .mutation(async ({ input, ctx }) => {
        const result = await ctx.dependencyLayer.setState(input);

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
    setStateVersion: publicProcedure
      .input(z.object({ timestamp: z.date() }))
      .mutation(async ({ input, ctx }) => {
        const result = await ctx.dependencyLayer.setStateVersion(input);

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
  },
  queues: {
    getQueues: publicProcedure.query(async ({ ctx }) => {
      const result = await ctx.dependencyLayer.getQueues();
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
    addDateRangeJob: publicProcedure
      .input(snapshotDateRangeJobSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await ctx.dependencyLayer.addDateRangeJob(input);
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
    addSeasonPointsMultiplierJob: publicProcedure
      .input(seasonPointsMultiplierJobSchema)
      .mutation(async ({ input, ctx }) => {
        const result =
          await ctx.dependencyLayer.addSeasonPointsMultiplierJob(input);
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
  },
  dex: {
    getDexComponentTvl: publicProcedure.query(async ({ ctx }) => {
      const result = await ctx.dependencyLayer.getDexComponentTvl();
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
  },
  resourceReward: {
    createResourceReward: publicProcedure
      .input(
        z.object({
          address: z.string(),
          points: z.number(),
          weeklyLimit: z.number().optional(),
          url: z.string().optional(),
          weekId: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const result = await ctx.dependencyLayer.createResourceReward({
          ...input,
          weeklyLimit: input.weeklyLimit ?? undefined,
          url: input.url ?? undefined,
          weekId: input.weekId,
        });
        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (error) => {
            console.error(error);
            if (error._tag === 'Fail') {
              switch (error.error._tag) {
                case 'InvalidResourceTypeError':
                case 'ParseError':
                  throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.error.message,
                  });
              }
            }
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
            });
          },
        });
      }),
    listResourceRewards: publicProcedure
      .input(
        z.object({
          weekId: z.string(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const result = await ctx.dependencyLayer.listResourceRewards({
          weekId: input.weekId,
        });
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
    updateResourceReward: publicProcedure
      .input(
        z.object({
          address: z.string(),
          points: z.number(),
          weeklyLimit: z.number().optional(),
          url: z.string().optional(),
          weekId: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const result = await ctx.dependencyLayer.updateResourceReward({
          ...input,
          weeklyLimit: input.weeklyLimit ?? undefined,
          url: input.url ?? undefined,
          weekId: input.weekId,
        });
        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (error) => {
            console.error(error);
            if (error._tag === 'Fail') {
              switch (error.error._tag) {
                case 'ResourceNotFoundError':
                  throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: error.error.message,
                  });
              }
            }
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
            });
          },
        });
      }),
    deleteResourceReward: publicProcedure
      .input(
        z.object({
          address: z.string(),
          weekId: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const result = await ctx.dependencyLayer.deleteResourceReward({
          address: input.address,
          weekId: input.weekId,
        });
        return Exit.match(result, {
          onSuccess: (value) => value,
          onFailure: (error) => {
            console.error(error);
            if (error._tag === 'Fail') {
              switch (error.error._tag) {
                case 'ResourceNotFoundError':
                  throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: error.error.message,
                  });
              }
            }
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
            });
          },
        });
      }),
  },
  seasonReward: {
    listUserSeasonRewards: publicProcedure
      .input(effectSchemaParser(ListUserSeasonRewardsInputSchema))
      .query(({ input }) =>
        resolveEffect(
          Effect.gen(function* () {
            const service = yield* SeasonRewardService;
            return yield* service.listUserSeasonRewards(input);
          }),
        ),
      ),

    getSeasonRewardStats: publicProcedure
      .input(effectSchemaParser(GetSeasonRewardStatsInputSchema))
      .query(({ input }) =>
        resolveEffect(
          Effect.gen(function* () {
            const service = yield* SeasonRewardService;
            return yield* service.getSeasonRewardStats(input);
          }),
        ),
      ),
  },
});
