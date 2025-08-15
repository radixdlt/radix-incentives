import { TRPCError } from '@trpc/server';
import {
  accountActivityPoints,
  accountBalances,
  accounts,
  db,
  seasonPointsMultiplier,
  user,
  userSeasonPoints,
} from 'db/incentives';
import { and, count, eq } from 'drizzle-orm';
import { Exit } from 'effect';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const adminRouter = createTRPCRouter({
  user: {
    getUser: publicProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return Promise.all([
          db.query.user.findFirst({
            where: eq(user.id, input.id),
          }),
          db.query.accounts.findMany({
            where: eq(accounts.userId, input.id),
          }),
        ]).then(([user, accounts]) => ({
          ...user,
          accounts,
        }));
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
        return db.query.userSeasonPoints.findMany({
          where: eq(userSeasonPoints.weekId, input.weekId),
        });
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

    simulateCalculateSeasonPoints: publicProcedure
      .input(
        z.object({
          weekId: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const result = await ctx.dependencyLayer.calculateSeasonPoints({
          ...input,
          markAsProcessed: false,
          dryRun: true,
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
});
