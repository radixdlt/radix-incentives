import {
  accountActivityPoints,
  accounts,
  activities,
  activityCategories,
  categoryLeaderboardCache,
  seasonPointsMultiplier,
  userSeasonPoints,
} from 'db/incentives';
import { and, eq, sql, sum } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

export class UserService extends Effect.Service<UserService>()('UserService', {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;

    const getMultiplierByUserId = Effect.fn(function* (input: {
      userId: string;
      weekId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db.query.seasonPointsMultiplier.findFirst({
            where: and(
              eq(seasonPointsMultiplier.userId, input.userId),
              eq(seasonPointsMultiplier.weekId, input.weekId),
            ),
            columns: {
              multiplier: true,
            },
          }),
        catch: (error) => new DbError(error),
      });

      return {
        value: result?.multiplier ?? '0',
      };
    });

    const getSeasonPointsRankingByUserId = Effect.fn(function* (input: {
      userId: string;
      weekId: string;
    }) {
      const userSeasonPointsSQL = sql<number>`(
        SELECT SUM(${userSeasonPoints.points})
        FROM ${userSeasonPoints}
        WHERE ${userSeasonPoints.userId} = ${input.userId}
      )`;

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              points: userSeasonPointsSQL,
              rank: sql<number>`(
                SELECT COUNT(*) + 1 
                FROM ${userSeasonPoints} up2 
                WHERE up2.week_id = ${input.weekId} 
                AND up2.points > ${userSeasonPointsSQL}
              )`,
            })
            .from(userSeasonPoints)
            .then((result) => result[0]),
        catch: (error) => new DbError(error),
      });

      if (!result || result?.points === null) {
        return {
          rank: 'n/a',
          points: '0',
        };
      }

      return {
        rank: result.rank,
        points: result.points.toString(),
      };
    });

    const getUserCategoryBreakdown = Effect.fn(function* (input: {
      weekId: string;
      userId: string;
    }) {
      // Get user's category points from leaderboard cache
      const userCategoryPoints = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              categoryId: categoryLeaderboardCache.categoryId,
              categoryName: activityCategories.name,
              totalPoints: categoryLeaderboardCache.totalPoints,
            })
            .from(categoryLeaderboardCache)
            .innerJoin(
              activityCategories,
              eq(categoryLeaderboardCache.categoryId, activityCategories.id),
            )
            .where(
              and(
                eq(categoryLeaderboardCache.weekId, input.weekId),
                eq(categoryLeaderboardCache.userId, input.userId),
              ),
            ),
        catch: (error) => new DbError(error),
      });

      // Transform cache data to expected format
      const categoryBreakdown = userCategoryPoints.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        points: Math.round(Number.parseFloat(category.totalPoints || '0')),
      }));

      return categoryBreakdown;
    });

    const getUserWeekActivityPoints = Effect.fn(function* (input: {
      userId: string;
      weekId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              totalPoints: sum(accountActivityPoints.activityPoints).as(
                'totalPoints',
              ),
            })
            .from(accountActivityPoints)
            .innerJoin(
              accounts,
              eq(accountActivityPoints.accountAddress, accounts.address),
            )
            .innerJoin(
              activities,
              eq(accountActivityPoints.activityId, activities.id),
            )
            .where(
              and(
                eq(accounts.userId, input.userId),
                eq(accountActivityPoints.weekId, input.weekId),
                // Exclude hold_ activities and common like other functions
                sql`${activities.id} NOT LIKE '%hold_%'`,
                sql`${activities.id} != 'common'`,
              ),
            )
            .then((result) => result[0]),
        catch: (error) => new DbError(error),
      });

      return {
        weekId: input.weekId,
        totalPoints: result?.totalPoints
          ? Number.parseFloat(result.totalPoints)
          : 0,
      };
    });

    return {
      getUserStats: Effect.fn(function* (input: {
        userId: string;
        weekId: string;
        seasonId: string;
      }) {
        const activityPoints = yield* getUserWeekActivityPoints(input);
        const currentSeasonPoints =
          yield* getSeasonPointsRankingByUserId(input);
        const multiplier = yield* getMultiplierByUserId(input);

        return {
          activityPoints,
          seasonPoints: currentSeasonPoints,
          multiplier,
        };
      }),
      getUserCategoryBreakdown,
      getUserWeekActivityPoints,
      getAccountsByUserId: Effect.fn(function* (input: { userId: string }) {
        const result = yield* Effect.tryPromise({
          try: () =>
            db.select().from(accounts).where(eq(accounts.userId, input.userId)),
          catch: (error) => new DbError(error),
        });
        return result;
      }),
    };
  }),
}) {}
