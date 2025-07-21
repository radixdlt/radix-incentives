import { Effect } from "effect";
import { DbClientService } from "../db/dbClient";
import {
  accountActivityPoints,
  accounts,
  users,
  activities,
  activityCategories,
  weeks,
  seasons,
  userSeasonPoints,
} from "db/incentives";
import { eq, desc, asc, sum, sql, and, not, inArray } from "drizzle-orm";
import { BigNumber } from "bignumber.js";

export interface ActivityCategoryLeaderboardData {
  topUsers: Array<{
    userId: string;
    label: string | null;
    totalPoints: string;
    rank: number;
  }>;
  userStats: {
    rank: number;
    totalPoints: string;
    percentile: number;
    activityBreakdown?: Array<{
      activityId: string;
      activityName: string;
      points: string;
    }>;
  } | null;
  globalStats: {
    totalUsers: number;
    median: string;
    average: string;
  };
  categoryInfo: {
    id: string;
    name: string;
  };
  weekInfo: {
    id: string;
    startDate: Date;
    endDate: Date;
  };
}

export interface SeasonLeaderboardData {
  topUsers: Array<{
    userId: string;
    label: string | null;
    totalPoints: string;
    rank: number;
  }>;
  userStats: {
    rank: number;
    totalPoints: string;
    percentile: number;
    accountContributions?: Array<{
      accountAddress: string;
      accountLabel: string;
      points: string;
    }>;
  } | null;
  globalStats: {
    totalUsers: number;
    median: string;
    average: string;
  };
  seasonInfo: {
    id: string;
    name: string;
  };
}

export class LeaderboardService extends Effect.Service<LeaderboardService>()(
  "LeaderboardService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      const getSeasonLeaderboard = Effect.fn(function* (input: {
        seasonId: string;
        userId?: string;
      }) {
        // Get season info
        const seasonInfo = yield* Effect.tryPromise(() =>
          db
            .select({
              id: seasons.id,
              name: seasons.name,
            })
            .from(seasons)
            .where(eq(seasons.id, input.seasonId))
            .limit(1)
            .then((result) => result[0])
        );

        if (!seasonInfo) {
          return yield* Effect.fail(new Error("Season not found"));
        }

        // Aggregate season points by user
        const userTotals = yield* Effect.tryPromise(() =>
          db
            .select({
              userId: userSeasonPoints.userId,
              label: users.label,
              totalPoints: sum(userSeasonPoints.points).as("totalPoints"),
            })
            .from(userSeasonPoints)
            .innerJoin(users, eq(userSeasonPoints.userId, users.id))
            .where(eq(userSeasonPoints.seasonId, input.seasonId))
            .groupBy(userSeasonPoints.userId, users.label)
            .orderBy(desc(sum(userSeasonPoints.points)))
        );

        // Calculate statistics
        const totalUsers = userTotals.length;
        const pointsArray = userTotals.map(
          (user) => new BigNumber(user.totalPoints || "0")
        );

        const average = pointsArray
          .reduce((acc, points) => acc.plus(points), new BigNumber(0))
          .dividedBy(totalUsers || 1)
          .toFixed(6);

        // Calculate median
        const sortedPoints = pointsArray.sort((a, b) => a.comparedTo(b) || 0);
        let median: string;
        if (totalUsers > 0) {
          if (totalUsers % 2 === 0) {
            const left = sortedPoints[Math.floor(totalUsers / 2) - 1];
            const right = sortedPoints[Math.floor(totalUsers / 2)];
            if (left !== undefined && right !== undefined) {
              median = left.plus(right).dividedBy(2).toFixed(6);
            } else {
              median = "0";
            }
          } else {
            const mid = sortedPoints[Math.floor(totalUsers / 2)];
            median = mid !== undefined ? mid.toFixed(6) : "0";
          }
        } else {
          median = "0";
        }

        // Get top 5 users
        const topUsers = userTotals.slice(0, 5).map((user, index) => ({
          userId: user.userId,
          label: user.label,
          totalPoints: user.totalPoints || "0",
          rank: index + 1,
        }));

        // Get user stats if userId provided
        let userStats = null;
        if (input.userId) {
          const userIndex = userTotals.findIndex(
            (user) => user.userId === input.userId
          );
          if (userIndex !== -1) {
            const userTotal = userTotals[userIndex];
            const rank = userIndex + 1;
            const percentile = Math.round((1 - (rank - 1) / totalUsers) * 100);

            userStats = {
              rank,
              totalPoints: userTotal?.totalPoints || "0",
              percentile,
            };
          }
        }

        return {
          topUsers,
          userStats,
          globalStats: {
            totalUsers,
            median,
            average,
          },
          seasonInfo,
        };
      });

      const getAvailableWeeks = Effect.fn(function* (input: {
        seasonId?: string;
      }) {
        const query = db
          .select({
            id: weeks.id,
            seasonId: weeks.seasonId,
            startDate: weeks.startDate,
            endDate: weeks.endDate,
            seasonName: seasons.name,
          })
          .from(weeks)
          .innerJoin(seasons, eq(weeks.seasonId, seasons.id));

        if (input.seasonId) {
          query.where(eq(weeks.seasonId, input.seasonId));
        }

        return yield* Effect.tryPromise(() =>
          query.orderBy(desc(weeks.startDate))
        );
      });

      const getAvailableActivities = Effect.fn(function* () {
        return yield* Effect.tryPromise(() =>
          db
            .select({
              id: activities.id,
              name: activities.name,
              description: activities.description,
              category: activities.category,
            })
            .from(activities)
            .where(
              and(
                // Exclude hold_ activities (they're for multiplier calculation, not leaderboards)
                sql`${activities.id} NOT LIKE '%hold_%'`,
                // Exclude common activity (not rewarded)
                sql`${activities.id} != 'common'`
              )
            )
            .orderBy(asc(activities.id))
        );
      });

      const getAvailableSeasons = Effect.fn(function* () {
        return yield* Effect.tryPromise(() =>
          db
            .select({
              id: seasons.id,
              name: seasons.name,
              status: seasons.status,
              startDate: sql<Date>`MIN(${weeks.startDate})`.as("startDate"),
              endDate: sql<Date>`MAX(${weeks.endDate})`.as("endDate"),
            })
            .from(seasons)
            .leftJoin(weeks, eq(seasons.id, weeks.seasonId))
            .groupBy(seasons.id, seasons.name, seasons.status)
            .orderBy(desc(sql`MIN(${weeks.startDate})`))
        );
      });

      const getAvailableCategories = Effect.fn(function* () {
        return yield* Effect.tryPromise(() =>
          db
            .select({
              id: activityCategories.id,
              name: activityCategories.name,
              description: activityCategories.description,
            })
            .from(activityCategories)
            .where(
              // Exclude categories that don't have any non-hold, non-common activities
              sql`EXISTS (
                SELECT 1 FROM ${activities}
                WHERE ${activities.category} = ${activityCategories.id}
                AND ${activities.id} NOT LIKE '%hold_%'
                AND ${activities.id} != 'common'
              )`
            )
            .orderBy(asc(activityCategories.name))
        );
      });

      const getActivityCategoryLeaderboard = Effect.fn(function* (input: {
        categoryId: string;
        weekId: string;
        userId?: string;
      }) {
        // Get category info
        const categoryInfo = yield* Effect.tryPromise(() =>
          db
            .select({
              id: activityCategories.id,
              name: activityCategories.name,
            })
            .from(activityCategories)
            .where(eq(activityCategories.id, input.categoryId))
            .limit(1)
            .then((result) => result[0])
        );

        if (!categoryInfo) {
          return yield* Effect.fail(new Error("Activity category not found"));
        }

        // Get week info
        const weekInfo = yield* Effect.tryPromise(() =>
          db
            .select({
              id: weeks.id,
              startDate: weeks.startDate,
              endDate: weeks.endDate,
            })
            .from(weeks)
            .where(eq(weeks.id, input.weekId))
            .limit(1)
            .then((result) => result[0])
        );

        if (!weekInfo) {
          return yield* Effect.fail(new Error("Week not found"));
        }

        // Get all activities in this category
        const categoryActivities = yield* Effect.tryPromise(() =>
          db
            .select({
              id: activities.id,
              name: activities.name,
            })
            .from(activities)
            .where(
              and(
                eq(activities.category, input.categoryId),
                // Exclude hold_ activities (they're for multiplier calculation, not leaderboards)
                sql`${activities.id} NOT LIKE '%hold_%'`,
                // Exclude common activity (not rewarded)
                sql`${activities.id} != 'common'`
              )
            )
        );

        if (categoryActivities.length === 0) {
          return yield* Effect.fail(
            new Error("No activities found for this category")
          );
        }

        const activityIds = categoryActivities.map((a) => a.id);

        // Query account activity points for all activities in this category
        const userTotals = yield* Effect.tryPromise(() =>
          db
            .select({
              userId: accounts.userId,
              label: users.label,
              totalPoints: sum(accountActivityPoints.activityPoints).as(
                "totalPoints"
              ),
            })
            .from(accountActivityPoints)
            .innerJoin(
              accounts,
              eq(accountActivityPoints.accountAddress, accounts.address)
            )
            .innerJoin(users, eq(accounts.userId, users.id))
            .where(
              and(
                inArray(accountActivityPoints.activityId, activityIds),
                eq(accountActivityPoints.weekId, input.weekId)
              )
            )
            .groupBy(accounts.userId, users.label)
            .orderBy(desc(sum(accountActivityPoints.activityPoints)))
        );

        // Calculate statistics
        const totalUsers = userTotals.length;
        const pointsArray = userTotals.map(
          (user) => new BigNumber(user.totalPoints || "0")
        );

        const average = pointsArray
          .reduce((acc, points) => acc.plus(points), new BigNumber(0))
          .dividedBy(totalUsers || 1)
          .toFixed(6);

        // Calculate median
        const sortedPoints = pointsArray.sort((a, b) => a.comparedTo(b) || 0);
        let median: string;

        if (totalUsers > 0) {
          if (totalUsers % 2 === 0) {
            const mid1 =
              sortedPoints[Math.floor(totalUsers / 2) - 1] ?? new BigNumber(0);
            const mid2 =
              sortedPoints[Math.floor(totalUsers / 2)] ?? new BigNumber(0);
            median = mid1.plus(mid2).dividedBy(2).toFixed(6);
          } else {
            const mid =
              sortedPoints[Math.floor(totalUsers / 2)] ?? new BigNumber(0);
            median = mid.toFixed(6);
          }
        } else {
          median = "0";
        }

        // Get top 5 users
        const topUsers = userTotals.slice(0, 5).map((user, index) => ({
          userId: user.userId,
          label: user.label,
          totalPoints: user.totalPoints?.toString() || "0",
          rank: index + 1,
        }));

        // Get user stats if userId provided
        let userStats = null;
        if (input.userId) {
          const userIndex = userTotals.findIndex(
            (user) => user.userId === input.userId
          );
          if (userIndex !== -1) {
            const userTotal = userTotals[userIndex];
            const rank = userIndex + 1;
            const percentile = Math.round((1 - (rank - 1) / totalUsers) * 100);

            // Get activity breakdown for this user
            const activityBreakdown = yield* Effect.tryPromise(() =>
              db
                .select({
                  activityId: accountActivityPoints.activityId,
                  activityName: activities.name,
                  points: sum(accountActivityPoints.activityPoints).as(
                    "points"
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
                    inArray(accountActivityPoints.activityId, activityIds),
                    eq(accountActivityPoints.weekId, input.weekId),
                    eq(accounts.userId, input.userId!)
                  )
                )
                .groupBy(accountActivityPoints.activityId, activities.name)
                .orderBy(desc(sum(accountActivityPoints.activityPoints)))
            );

            userStats = {
              rank,
              totalPoints: userTotal?.totalPoints?.toString() || "0",
              percentile,
              activityBreakdown: activityBreakdown.map((breakdown) => ({
                activityId: breakdown.activityId,
                activityName: breakdown.activityName || breakdown.activityId,
                points: (breakdown.points || 0).toString(),
              })),
            };
          }
        }

        return {
          topUsers,
          userStats,
          globalStats: {
            totalUsers,
            median,
            average,
          },
          categoryInfo: {
            id: input.categoryId,
            name: categoryInfo.name || input.categoryId,
          },
          weekInfo,
        };
      });


      return {
        getSeasonLeaderboard,
        getActivityCategoryLeaderboard,
        getAvailableWeeks,
        getAvailableActivities,
        getAvailableSeasons,
        getAvailableCategories,
      };
    }),
  }
) {}
