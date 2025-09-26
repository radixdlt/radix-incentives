import BigNumber from 'bignumber.js';
import {
  accountActivityPoints,
  accounts,
  activities,
  seasonPointsMultiplier,
} from 'db/incentives';
import { and, asc, eq, gte, inArray, sum } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export class UserActivityPointsService extends Effect.Service<UserActivityPointsService>()(
  'UserActivityPointsService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        getByWeekIdAndActivityId: Effect.fn(function* (input: {
          weekId: string;
          activityId: string;
          minPoints: number;
          minTWABalance: number;
        }) {
          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  userId: accounts.userId,
                  points: sum(accountActivityPoints.activityPoints),
                })
                .from(accountActivityPoints)
                .where(
                  and(
                    eq(accountActivityPoints.weekId, input.weekId),
                    eq(accountActivityPoints.activityId, input.activityId),
                    gte(
                      seasonPointsMultiplier.totalTWABalance,
                      input.minTWABalance.toString(),
                    ),
                  ),
                )
                .innerJoin(
                  accounts,
                  eq(accounts.address, accountActivityPoints.accountAddress),
                )
                .innerJoin(
                  seasonPointsMultiplier,
                  and(
                    eq(seasonPointsMultiplier.userId, accounts.userId),
                    eq(seasonPointsMultiplier.weekId, input.weekId),
                  ),
                )
                .groupBy(accounts.userId)
                .having(
                  gte(
                    sum(accountActivityPoints.activityPoints),
                    input.minPoints,
                  ),
                )
                .orderBy(asc(sum(accountActivityPoints.activityPoints))),
            catch: (error) => new DbError(error),
          });

          return result
            .map((row) => ({
              userId: row.userId,
              points: new BigNumber(row.points ?? 0),
            }))
            .filter((row) => !row.points.isZero());
        }),

        getUserActivityPointsByWeek: Effect.fn(function* (input: {
          userId: string;
          weekId: string;
        }) {
          // First get all accounts for this user
          const userAccountsResult = yield* Effect.tryPromise({
            try: () =>
              db
                .select({ address: accounts.address })
                .from(accounts)
                .where(eq(accounts.userId, input.userId)),
            catch: (error) => new DbError(error),
          });

          if (userAccountsResult.length === 0) {
            return [];
          }

          const addresses = userAccountsResult.map((acc) => acc.address);

          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  accountAddress: accountActivityPoints.accountAddress,
                  weekId: accountActivityPoints.weekId,
                  activityId: accountActivityPoints.activityId,
                  activityPoints: accountActivityPoints.activityPoints,
                  categoryId: activities.category,
                })
                .from(accountActivityPoints)
                .innerJoin(
                  activities,
                  eq(accountActivityPoints.activityId, activities.id),
                )
                .where(
                  and(
                    inArray(accountActivityPoints.accountAddress, addresses),
                    eq(accountActivityPoints.weekId, input.weekId),
                  ),
                ),
            catch: (error) => new DbError(error),
          });

          return result.map((item) => ({
            ...item,
            activityPoints: new BigNumber(item.activityPoints),
          }));
        }),
      };
    }),
  },
) {}
