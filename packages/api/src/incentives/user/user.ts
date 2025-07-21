import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import {
  accountActivityPoints,
  accounts,
  userSeasonPoints,
  seasonPointsMultiplier,
  activities,
  activityCategories,
} from "db/incentives";
import { eq, sql, and, sum } from "drizzle-orm";

export class UserService extends Effect.Service<UserService>()("UserService", {
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
              eq(seasonPointsMultiplier.weekId, input.weekId)
            ),
            columns: {
              multiplier: true,
            },
          }),
        catch: (error) => new DbError(error),
      });

      return {
        value: result?.multiplier ?? "0",
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
          rank: "n/a",
          points: "0",
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
      // Get all available categories with activities
      const categoriesWithActivities = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              categoryId: activities.category,
              categoryName: activityCategories.name,
            })
            .from(activities)
            .innerJoin(
              activityCategories,
              eq(activities.category, activityCategories.id)
            )
            .where(
              and(
                // Exclude hold_ activities (they're for multiplier calculation, not leaderboards)
                sql`${activities.id} NOT LIKE '%hold_%'`,
                // Exclude common activity (not rewarded)
                sql`${activities.id} != 'common'`
              )
            )
            .groupBy(activities.category, activityCategories.name),
        catch: (error) => new DbError(error),
      });

      // Get user's points for all categories in this week
      const userCategoryPoints = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              categoryId: activities.category,
              totalPoints: sum(accountActivityPoints.activityPoints).as(
                "totalPoints"
              ),
            })
            .from(accountActivityPoints)
            .innerJoin(
              accounts,
              eq(accountActivityPoints.accountAddress, accounts.address)
            )
            .innerJoin(
              activities,
              eq(accountActivityPoints.activityId, activities.id)
            )
            .where(
              and(
                eq(accounts.userId, input.userId),
                eq(accountActivityPoints.weekId, input.weekId),
                // Same exclusions as above
                sql`${activities.id} NOT LIKE '%hold_%'`,
                sql`${activities.id} != 'common'`
              )
            )
            .groupBy(activities.category),
        catch: (error) => new DbError(error),
      });

      // Combine category info with user points
      const categoryBreakdown = categoriesWithActivities
        .map((category) => {
          const userPoints = userCategoryPoints.find(
            (up) => up.categoryId === category.categoryId
          );
          return {
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            points: userPoints
              ? Number.parseFloat(userPoints.totalPoints || "0")
              : 0,
          };
        })
        .filter((category) => category.points > 0); // Only return categories with points

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
                "totalPoints"
              ),
            })
            .from(accountActivityPoints)
            .innerJoin(
              accounts,
              eq(accountActivityPoints.accountAddress, accounts.address)
            )
            .innerJoin(
              activities,
              eq(accountActivityPoints.activityId, activities.id)
            )
            .where(
              and(
                eq(accounts.userId, input.userId),
                eq(accountActivityPoints.weekId, input.weekId),
                // Exclude hold_ activities and common like other functions
                sql`${activities.id} NOT LIKE '%hold_%'`,
                sql`${activities.id} != 'common'`
              )
            )
            .then((result) => result[0]),
        catch: (error) => new DbError(error),
      });

      return {
        weekId: input.weekId,
        totalPoints: result?.totalPoints ? Number.parseFloat(result.totalPoints) : 0,
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
