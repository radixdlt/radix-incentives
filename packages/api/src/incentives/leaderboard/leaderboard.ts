import { Effect } from "effect";
import { DbClientService } from "../db/dbClient";
import type { Db } from "db/incentives";
import {
  users,
  activities,
  activityCategories,
  weeks,
  seasons,
  seasonLeaderboardCache,
  categoryLeaderboardCache,
  leaderboardStatsCache,
} from "db/incentives";
import { eq, desc, asc, sql, and, inArray, lte } from "drizzle-orm";

// Custom error for when cache is being built
export class CacheNotAvailableError extends Error {
  readonly _tag = "CacheNotAvailableError";
  constructor(message: string) {
    super(message);
    this.name = "CacheNotAvailableError";
  }
}

// Type for cached season leaderboard data from database query
type CachedSeasonLeaderboardEntry = {
  userId: string;
  label: string | null;
  totalPoints: string;
  rank: number;
};

// Type for cached category leaderboard data from database query
type CachedCategoryLeaderboardEntry = {
  userId: string;
  label: string | null;
  totalPoints: string;
  rank: number;
  activityBreakdown: Record<string, number> | unknown;
};

// Common leaderboard response builder to avoid duplication
interface LeaderboardUser {
  userId: string;
  label: string | null;
  totalPoints: string;
  rank: number;
}

interface BuildLeaderboardResponseParams {
  cachedData: LeaderboardUser[];
  statsCache: {
    totalUsers?: number;
    median?: string | null;
    average?: string | null;
  } | null;
  userId?: string;
  additionalUserData?: Record<string, unknown>;
}

const buildLeaderboardResponse = (params: BuildLeaderboardResponseParams) => {
  const { cachedData, statsCache, userId, additionalUserData } = params;

  // Get top 5 users
  const topUsers = cachedData.slice(0, 5).map((user) => ({
    userId: user.userId,
    label: user.label,
    totalPoints: user.totalPoints,
    rank: user.rank,
  }));

  // Get user stats if userId provided
  let userStats = null;
  if (userId) {
    const userEntry = cachedData.find((user) => user.userId === userId);
    if (userEntry) {
      const percentile = Math.round(
        (1 - (userEntry.rank - 1) / cachedData.length) * 100
      );
      userStats = {
        rank: userEntry.rank,
        totalPoints: userEntry.totalPoints,
        percentile,
        // Merge any additional user-specific data (like activityBreakdown)
        ...additionalUserData,
      };
    }
  }

  const globalStats = {
    totalUsers: statsCache?.totalUsers || cachedData.length,
    median: statsCache?.median || "0",
    average: statsCache?.average || "0",
  };

  return { topUsers, userStats, globalStats };
};

// Helper to get activity breakdown for category leaderboards
const getActivityBreakdown = function* (params: {
  db: Db;
  userEntry: { activityBreakdown: Record<string, number> | unknown };
  activityIds: string[];
  weekId: string;
  userId: string;
}) {
  const { db, userEntry } = params;

  // Parse activity breakdown from cached JSONB - should be Record<string, number>
  const activityBreakdown =
    userEntry.activityBreakdown &&
    typeof userEntry.activityBreakdown === "object" &&
    userEntry.activityBreakdown !== null &&
    !Array.isArray(userEntry.activityBreakdown)
      ? (userEntry.activityBreakdown as Record<string, number>)
      : {};

  let activityBreakdownData: Array<{
    activityId: string;
    activityName: string;
    points: string;
  }> = [];

  // If we have cached breakdown data, use it
  if (Object.keys(activityBreakdown).length > 0) {
    const breakdown = yield* Effect.tryPromise(() =>
      db
        .select({
          activityId: activities.id,
          activityName: activities.name,
        })
        .from(activities)
        .where(inArray(activities.id, Object.keys(activityBreakdown)))
    ).pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          yield* Effect.logError(
            "Failed to fetch activity breakdown for activity names",
            error
          );
          return [];
        })
      )
    );

    // Create a map of activity ID to name for quick lookup
    const activityNameMap = breakdown.reduce(
      (
        acc: Record<string, string>,
        activity: { activityId: string; activityName: string | null }
      ) => {
        acc[activity.activityId] = activity.activityName || activity.activityId;
        return acc;
      },
      {} as Record<string, string>
    );

    // Map the breakdown data, using activity ID as fallback if name not found
    activityBreakdownData = Object.entries(activityBreakdown)
      .filter(([_, points]) => points > 0) // Only show activities with points
      .map(([activityId, points]) => ({
        activityId,
        activityName: activityNameMap[activityId] || activityId,
        points: points.toString(),
      }));
  } else {
    // No cached breakdown data available - return empty array for MVP
    // Real-time calculations are intentionally disabled for performance reasons
    activityBreakdownData = [];
  }

  return activityBreakdownData;
};

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

        // Check cache availability first - this eliminates the frontend waterfall request
        const cacheCount = yield* Effect.tryPromise(() =>
          db
            .select({ count: sql<number>`count(*)` })
            .from(seasonLeaderboardCache)
            .where(eq(seasonLeaderboardCache.seasonId, input.seasonId))
            .then((result) => result[0]?.count || 0)
        ).pipe(Effect.catchAll(() => Effect.succeed(0)));

        if (cacheCount === 0) {
          yield* Effect.log(`No cache available for season ${input.seasonId}`);
          return yield* Effect.fail(
            new CacheNotAvailableError(
              `Season leaderboard cache is being built for season ${input.seasonId}. Please check back in a few minutes.`
            )
          );
        }

        // Get cached data - we know it exists at this point
        const cachedData = yield* Effect.tryPromise(() =>
          db
            .select({
              userId: seasonLeaderboardCache.userId,
              label: users.label,
              totalPoints: seasonLeaderboardCache.totalPoints,
              rank: seasonLeaderboardCache.rank,
            })
            .from(seasonLeaderboardCache)
            .innerJoin(users, eq(seasonLeaderboardCache.userId, users.id))
            .where(eq(seasonLeaderboardCache.seasonId, input.seasonId))
            .orderBy(asc(seasonLeaderboardCache.rank))
        );

        // Check if cache is empty (which shouldn't happen in normal operation)
        if (cachedData.length === 0) {
          yield* Effect.log(
            `No cached data found for season ${input.seasonId}`
          );

          // real-time calculation would go here as a fallback, e.g.:
          //
          // const realTimeData = yield* calculateSeasonLeaderboardRealTime({
          //   seasonId: input.seasonId,
          //   userId: input.userId
          // });
          //
          // this would involve complex aggregations across userSeasonPoints table
          // very expensive for large datasets I assume

          return yield* Effect.fail(
            new CacheNotAvailableError(
              `Season leaderboard cache is being built for season ${input.seasonId}. Please check back in a few minutes.`
            )
          );
        }

        yield* Effect.log(
          `Using cached season leaderboard data (${cachedData.length} users)`
        );

        // Get global stats from cache
        const statsCache = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(
              eq(leaderboardStatsCache.cacheKey, `season_${input.seasonId}`)
            )
            .limit(1)
            .then((result) => result[0])
        ).pipe(Effect.catchAll(() => Effect.succeed(null)));

        // Build common leaderboard response
        const { topUsers, userStats, globalStats } = buildLeaderboardResponse({
          cachedData: cachedData as CachedSeasonLeaderboardEntry[],
          statsCache,
          userId: input.userId,
        });

        return {
          topUsers,
          userStats,
          globalStats,
          seasonInfo,
        };
      });

      const getAvailableWeeks = Effect.fn(function* (input: {
        seasonId?: string;
      }) {
        const now = new Date();
        const query = db
          .select({
            id: weeks.id,
            seasonId: weeks.seasonId,
            startDate: weeks.startDate,
            endDate: weeks.endDate,
            seasonName: seasons.name,
          })
          .from(weeks)
          .innerJoin(seasons, eq(weeks.seasonId, seasons.id))
          .where(
            and(
              // Only show weeks that have started (using UTC time)
              lte(weeks.startDate, now),
              // Add seasonId filter if provided
              input.seasonId ? eq(weeks.seasonId, input.seasonId) : undefined
            )
          );

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

        // Check cache availability first - this eliminates the frontend waterfall request
        const cacheCount = yield* Effect.tryPromise(() =>
          db
            .select({ count: sql<number>`count(*)` })
            .from(categoryLeaderboardCache)
            .where(
              and(
                eq(categoryLeaderboardCache.weekId, input.weekId),
                eq(categoryLeaderboardCache.categoryId, input.categoryId)
              )
            )
            .then((result) => result[0]?.count || 0)
        ).pipe(Effect.catchAll(() => Effect.succeed(0)));

        if (cacheCount === 0) {
          yield* Effect.log(
            `No cache available for week ${input.weekId}, category ${input.categoryId}`
          );
          return yield* Effect.fail(
            new CacheNotAvailableError(
              `Category leaderboard cache is being built for week ${input.weekId}, category ${input.categoryId}. Please check back in a few minutes.`
            )
          );
        }

        // Get cached data - we know it exists at this point
        const cachedData = yield* Effect.tryPromise(() =>
          db
            .select({
              userId: categoryLeaderboardCache.userId,
              label: users.label,
              totalPoints: categoryLeaderboardCache.totalPoints,
              rank: categoryLeaderboardCache.rank,
              activityBreakdown: categoryLeaderboardCache.activityBreakdown,
            })
            .from(categoryLeaderboardCache)
            .innerJoin(users, eq(categoryLeaderboardCache.userId, users.id))
            .where(
              and(
                eq(categoryLeaderboardCache.weekId, input.weekId),
                eq(categoryLeaderboardCache.categoryId, input.categoryId)
              )
            )
            .orderBy(asc(categoryLeaderboardCache.rank))
        );

        // Check if cache is empty (which shouldn't happen in normal operation)
        if (cachedData.length === 0) {
          yield* Effect.log(
            `No cached data found for week ${input.weekId}, category ${input.categoryId}`
          );

          // NOTE: Real-time calculation would go here as a fallback, but it's disabled for MVP
          // to avoid expensive queries that could impact performance. In a future version,
          // we could implement:
          //
          // const realTimeData = yield* calculateCategoryLeaderboardRealTime({
          //   weekId: input.weekId,
          //   categoryId: input.categoryId,
          //   userId: input.userId,
          //   activityIds
          // });
          //
          // This would involve complex aggregations across accountActivityPoints table
          // with grouping by userId and activity breakdown calculations, which could be
          // very expensive for large datasets and many activities.

          return yield* Effect.fail(
            new CacheNotAvailableError(
              `Category leaderboard cache is being built for week ${input.weekId}, category ${input.categoryId}. Please check back in a few minutes.`
            )
          );
        }

        yield* Effect.log(
          `Using cached category leaderboard data (${cachedData.length} users)`
        );

        // Get global stats from cache
        const statsCache = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(
              eq(
                leaderboardStatsCache.cacheKey,
                `category_${input.weekId}_${input.categoryId}`
              )
            )
            .limit(1)
            .then((result) => result[0])
        ).pipe(Effect.catchAll(() => Effect.succeed(null)));

        // Get activity breakdown for user if needed
        let additionalUserData: Record<string, unknown> = {};
        if (input.userId) {
          const userEntry = (
            cachedData as CachedCategoryLeaderboardEntry[]
          ).find((user) => user.userId === input.userId);
          if (userEntry) {
            const activityBreakdownData = yield* getActivityBreakdown({
              db,
              userEntry: { activityBreakdown: userEntry.activityBreakdown },
              activityIds,
              weekId: input.weekId,
              userId: input.userId,
            });
            additionalUserData = { activityBreakdown: activityBreakdownData };
          }
        }

        // Build common leaderboard response
        const { topUsers, userStats, globalStats } = buildLeaderboardResponse({
          cachedData: cachedData as CachedCategoryLeaderboardEntry[],
          statsCache,
          userId: input.userId,
          additionalUserData,
        });

        return {
          topUsers,
          userStats,
          globalStats,
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
