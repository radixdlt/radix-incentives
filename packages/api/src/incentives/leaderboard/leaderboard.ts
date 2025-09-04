import {
  categoryLeaderboardCache,
  leaderboardStatsCache,
  seasonLeaderboardCache,
  users,
} from 'db/incentives';
import { and, asc, eq, sql } from 'drizzle-orm';
import { Data, Effect } from 'effect';
import { ActivityCategoryService } from '../activity-category/activityCategory';
import { ActivityCategoryWeekService } from '../activity-category-week/activityCategoryWeek';
import { ActivityWeekService } from '../activity-week/activityWeek';
import { DbClientService, DbError } from '../db/dbClient';
import { SeasonService } from '../season/season';
import { WeekService } from '../week/week';
import { ActivityPointsAdjustmentService } from './activityPointsAdjustment';

// Custom error for when cache is being built
export class CacheNotAvailableError extends Data.TaggedError(
  'CacheNotAvailableError',
)<{
  message: string;
}> {}

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
  adjustedTotalPoints?: string;
}

const buildLeaderboardResponse = (params: BuildLeaderboardResponseParams) => {
  const {
    cachedData,
    statsCache,
    userId,
    additionalUserData,
    adjustedTotalPoints,
  } = params;

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
        (1 - (userEntry.rank - 1) / cachedData.length) * 100,
      );
      userStats = {
        rank: userEntry.rank,
        totalPoints: adjustedTotalPoints || userEntry.totalPoints, // Use adjusted points if available
        percentile,
        // Merge any additional user-specific data (like activityBreakdown)
        ...additionalUserData,
      };
    }
  }

  const globalStats = {
    totalUsers: statsCache?.totalUsers || cachedData.length,
    median: statsCache?.median || '0',
    average: statsCache?.average || '0',
  };

  return { topUsers, userStats, globalStats };
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
  'LeaderboardService',
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const weekService = yield* WeekService;
      const seasonService = yield* SeasonService;
      const activityCategoryService = yield* ActivityCategoryService;
      const activityCategoryWeekService = yield* ActivityCategoryWeekService;
      const activityWeekService = yield* ActivityWeekService;
      const activityPointsAdjustmentService =
        yield* ActivityPointsAdjustmentService;

      const getSeasonLeaderboard = Effect.fn(function* (input: {
        seasonId: string;
        userId?: string;
      }) {
        // Get season info
        const seasonInfo = yield* seasonService.getById(input.seasonId);

        // Check cache availability first
        const cacheCount = yield* Effect.tryPromise(() =>
          db
            .select({ count: sql<number>`count(*)` })
            .from(seasonLeaderboardCache)
            .where(eq(seasonLeaderboardCache.seasonId, input.seasonId))
            .then((result) => result[0]?.count || 0),
        ).pipe(Effect.catchAll(() => Effect.succeed(0)));

        if (cacheCount === 0) {
          yield* Effect.log(`No cache available for season ${input.seasonId}`);
          return yield* Effect.fail(
            new CacheNotAvailableError({
              message: `Season leaderboard cache is being built for season ${input.seasonId}. Please check back in a few minutes.`,
            }),
          );
        }

        // Get cached data, which we know exists now
        const cachedData = yield* Effect.tryPromise({
          try: () =>
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
              .orderBy(asc(seasonLeaderboardCache.rank)),
          catch: (error) => new DbError(error),
        });

        // Check if cache is empty (which shouldn't happen in normal operation)
        if (cachedData.length === 0) {
          yield* Effect.log(
            `No cached data found for season ${input.seasonId}`,
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
            new CacheNotAvailableError({
              message: `Season leaderboard cache is being built for season ${input.seasonId}. Please check back in a few minutes.`,
            }),
          );
        }

        yield* Effect.log(
          `Using cached season leaderboard data (${cachedData.length} users)`,
        );

        // Get global stats from cache
        const statsCache = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(
              eq(leaderboardStatsCache.cacheKey, `season_${input.seasonId}`),
            )
            .limit(1)
            .then((result) => result[0]),
        ).pipe(Effect.catchAll(() => Effect.succeed(null)));

        // Build common leaderboard response
        const { topUsers, userStats, globalStats } = buildLeaderboardResponse({
          cachedData: cachedData,
          statsCache: statsCache ?? null,
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
        return yield* weekService.list(input);
      });

      const getAvailableSeasons = Effect.fn(function* () {
        return yield* seasonService.list();
      });

      const getAvailableCategories = Effect.fn(function* (input: {
        weekId: string;
      }) {
        return yield* activityCategoryWeekService.getAvailableForWeek(input);
      });

      const getActivityCategoryLeaderboard = Effect.fn(function* (input: {
        categoryId: string;
        weekId: string;
        userId?: string;
      }) {
        // Get category info
        const categoryInfo = yield* activityCategoryService.getById(
          input.categoryId,
        );

        // Get week info
        const weekInfo = yield* weekService.getById(input.weekId);

        // Get activities that are included in the provided week ID for this category and have points
        const categoryActivities =
          yield* activityWeekService.getActivitiesWithPointsForWeek({
            weekId: input.weekId,
            categoryId: input.categoryId,
          });

        if (categoryActivities.length === 0) {
          return yield* Effect.fail(
            new Error('No activities found for this category'),
          );
        }

        const activityIds = categoryActivities.map((a) => a.id);

        // Check cache availability first
        const cacheCount = yield* Effect.tryPromise(() =>
          db
            .select({ count: sql<number>`count(*)` })
            .from(categoryLeaderboardCache)
            .where(
              and(
                eq(categoryLeaderboardCache.weekId, input.weekId),
                eq(categoryLeaderboardCache.categoryId, input.categoryId),
              ),
            )
            .then((result) => result[0]?.count || 0),
        ).pipe(Effect.catchAll(() => Effect.succeed(0)));

        if (cacheCount === 0) {
          yield* Effect.log(
            `No cache available for week ${input.weekId}, category ${input.categoryId}`,
          );
          return yield* Effect.fail(
            new CacheNotAvailableError({
              message: `Category leaderboard cache is being built for week ${input.weekId}, category ${input.categoryId}. Please check back in a few minutes.`,
            }),
          );
        }

        // Get cached data, which we know exists here
        const cachedData = yield* Effect.tryPromise({
          try: () =>
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
                  eq(categoryLeaderboardCache.categoryId, input.categoryId),
                ),
              )
              .orderBy(asc(categoryLeaderboardCache.rank)),
          catch: (error) => new DbError(error),
        });

        // Check if cache is empty (which shouldn't happen in normal operation)
        if (cachedData.length === 0) {
          yield* Effect.log(
            `No cached data found for week ${input.weekId}, category ${input.categoryId}`,
          );

          // note, we don't do real-time calculation as a fall-back for no cache here
          // we could, but it would be expensive

          return yield* Effect.fail(
            new CacheNotAvailableError({
              message: `Category leaderboard cache is being built for week ${input.weekId}, category ${input.categoryId}. Please check back in a few minutes.`,
            }),
          );
        }

        yield* Effect.log(
          `Using cached category leaderboard data (${cachedData.length} users)`,
        );

        // Get global stats from cache
        const statsCache = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(
              eq(
                leaderboardStatsCache.cacheKey,
                `category_${input.weekId}_${input.categoryId}`,
              ),
            )
            .limit(1)
            .then((result) => result[0]),
        ).pipe(Effect.catchAll(() => Effect.succeed(null)));

        // Get activity breakdown for user if needed
        let additionalUserData: Record<string, unknown> = {};
        let adjustedTotalPoints: string | undefined;
        if (input.userId) {
          const userEntry = cachedData.find(
            (user) => user.userId === input.userId,
          );
          if (userEntry) {
            const { activityBreakdownData, zeroMultiplierPointsToSubtract } =
              yield* activityPointsAdjustmentService.calculateActivityBreakdown(
                {
                  userEntry: { activityBreakdown: userEntry.activityBreakdown },
                  activityIds,
                  weekId: input.weekId,
                  userId: input.userId,
                },
              );

            // Calculate adjusted total points by subtracting zero-multiplier points
            adjustedTotalPoints =
              yield* activityPointsAdjustmentService.calculateAdjustedTotalPoints(
                {
                  originalTotal: userEntry.totalPoints,
                  zeroMultiplierPointsToSubtract,
                },
              );

            additionalUserData = { activityBreakdown: activityBreakdownData };
          }
        }

        // Build common leaderboard response
        const { topUsers, userStats, globalStats } = buildLeaderboardResponse({
          cachedData: cachedData,
          statsCache: statsCache ?? null,
          userId: input.userId,
          additionalUserData,
          adjustedTotalPoints,
        });

        return {
          topUsers,
          userStats,
          globalStats,
          categoryInfo: {
            id: input.categoryId,
            name: categoryInfo.name || input.categoryId,
          },
          weekInfo: {
            id: weekInfo.id,
            startDate: weekInfo.startDate,
            endDate: weekInfo.endDate,
          },
        };
      });

      const getActivityCategoryLeaderboardPaginated = Effect.fn(
        function* (input: {
          categoryId: string;
          weekId: string;
          page?: number;
          limit?: number;
        }) {
          const page = input.page ?? 0;
          const limit = Math.min(input.limit ?? 100, 100);

          const statsCacheResult = yield* Effect.tryPromise(() =>
            db
              .select({
                totalUsers: leaderboardStatsCache.totalUsers,
              })
              .from(leaderboardStatsCache)
              .where(
                eq(
                  leaderboardStatsCache.cacheKey,
                  `category_${input.weekId}_${input.categoryId}`,
                ),
              )
              .limit(1)
              .then((result) => result[0]),
          ).pipe(Effect.catchAll(() => Effect.succeed(null)));

          const totalUsers = statsCacheResult?.totalUsers ?? 0;

          const cachedData = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  userId: categoryLeaderboardCache.userId,
                  identityAddress: users.identityAddress,
                  label: users.label,
                  totalPoints: categoryLeaderboardCache.totalPoints,
                  rank: categoryLeaderboardCache.rank,
                })
                .from(categoryLeaderboardCache)
                .innerJoin(users, eq(categoryLeaderboardCache.userId, users.id))
                .where(
                  and(
                    eq(categoryLeaderboardCache.weekId, input.weekId),
                    eq(categoryLeaderboardCache.categoryId, input.categoryId),
                  ),
                )
                .orderBy(asc(categoryLeaderboardCache.rank))
                .limit(limit)
                .offset(page * limit),
            catch: (error) => new DbError(error),
          });

          return {
            totalUsers,
            page,
            limit,
            data: cachedData,
          };
        },
      );

      const getSeasonLeaderboardPaginated = Effect.fn(function* (input: {
        seasonId: string;
        page?: number;
        limit?: number;
      }) {
        const page = input.page ?? 0;
        const limit = Math.min(input.limit ?? 100, 100);

        const statsCacheResult = yield* Effect.tryPromise(() =>
          db
            .select({
              totalUsers: leaderboardStatsCache.totalUsers,
            })
            .from(leaderboardStatsCache)
            .where(
              eq(leaderboardStatsCache.cacheKey, `season_${input.seasonId}`),
            )
            .limit(1)
            .then((result) => result[0]),
        ).pipe(Effect.catchAll(() => Effect.succeed(null)));

        const totalUsers = statsCacheResult?.totalUsers ?? 0;

        const cachedData = yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                userId: seasonLeaderboardCache.userId,
                identityAddress: users.identityAddress,
                label: users.label,
                totalPoints: seasonLeaderboardCache.totalPoints,
                rank: seasonLeaderboardCache.rank,
              })
              .from(seasonLeaderboardCache)
              .innerJoin(users, eq(seasonLeaderboardCache.userId, users.id))
              .where(eq(seasonLeaderboardCache.seasonId, input.seasonId))
              .orderBy(asc(seasonLeaderboardCache.rank))
              .limit(limit)
              .offset(page * limit),
          catch: (error) => new DbError(error),
        });

        return {
          totalUsers,
          page,
          limit,
          data: cachedData,
        };
      });

      return {
        getSeasonLeaderboard,
        getSeasonLeaderboardPaginated,
        getActivityCategoryLeaderboard,
        getActivityCategoryLeaderboardPaginated,
        getAvailableWeeks,
        getAvailableSeasons,
        getAvailableCategories,
      };
    }),
  },
) {}
