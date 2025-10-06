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
import { UserService } from '../user/user';
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
  totalUsersInSystem: number;
  userId?: string;
  additionalUserData?: Record<string, unknown>;
  adjustedTotalPoints?: string;
}

const buildLeaderboardResponse = (params: BuildLeaderboardResponseParams) => {
  const {
    cachedData,
    statsCache,
    totalUsersInSystem,
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
    totalUsersInSystem,
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
    totalUsersInSystem: number;
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
    categoryBreakdown?: Array<{
      categoryId: string;
      categoryName: string;
      points: string;
    }>;
  } | null;
  globalStats: {
    totalUsers: number;
    totalUsersInSystem: number;
    median: string;
    average: string;
  };
  seasonInfo: {
    id: string;
    name: string;
  };
  weekInfo?: {
    id: string;
    startDate: Date;
    endDate: Date;
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
      const userService = yield* UserService;

      const getSeasonLeaderboard = Effect.fn(function* (input: {
        seasonId: string;
        weekId?: string;
        userId?: string;
      }) {
        // Get season info
        const seasonInfo = yield* seasonService.getById(input.seasonId);

        // Determine weekId for cache lookup (null for season totals, or specific week)
        const weekIdForCache =
          input.weekId || '00000000-0000-0000-0000-000000000000';

        // Check cache availability first
        const cacheCount = yield* Effect.tryPromise(() =>
          db
            .select({ count: sql<number>`count(*)` })
            .from(seasonLeaderboardCache)
            .where(
              and(
                eq(seasonLeaderboardCache.seasonId, input.seasonId),
                eq(seasonLeaderboardCache.weekId, weekIdForCache),
              ),
            )
            .then((result) => result[0]?.count || 0),
        ).pipe(Effect.catchAll(() => Effect.succeed(0)));

        if (cacheCount === 0) {
          const cacheType = input.weekId ? 'weekly' : 'season total';
          yield* Effect.log(
            `No ${cacheType} cache available for season ${input.seasonId}, week ${weekIdForCache}`,
          );
          return yield* Effect.fail(
            new CacheNotAvailableError({
              message: `Season leaderboard cache is being built for season ${input.seasonId}. Please check back in a few minutes.`,
            }),
          );
        }

        // Get cached data, which we know exists now
        // Filter out users with 0 points to match stats calculations
        const cachedData = yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                userId: seasonLeaderboardCache.userId,
                label: users.label,
                totalPoints: seasonLeaderboardCache.totalPoints,
                totalReferralPoints: seasonLeaderboardCache.totalReferralPoints,
                categoryBreakdown: seasonLeaderboardCache.categoryBreakdown,
                rank: seasonLeaderboardCache.rank,
              })
              .from(seasonLeaderboardCache)
              .innerJoin(users, eq(seasonLeaderboardCache.userId, users.id))
              .where(
                and(
                  eq(seasonLeaderboardCache.seasonId, input.seasonId),
                  eq(seasonLeaderboardCache.weekId, weekIdForCache),
                  sql`${seasonLeaderboardCache.totalPoints}::numeric > 0`,
                ),
              )
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
              eq(
                leaderboardStatsCache.cacheKey,
                `season_${input.seasonId}_week_${weekIdForCache}`,
              ),
            )
            .limit(1)
            .then((result) => result[0]),
        ).pipe(Effect.catchAll(() => Effect.succeed(null)));

        // Get total users count in the system
        const totalUsersInSystem = yield* userService.getTotalUserCount();

        // Get week info if specific week is requested
        let weekInfo:
          | { id: string; startDate: Date; endDate: Date }
          | undefined;
        if (input.weekId) {
          const week = yield* weekService.getById(input.weekId);
          weekInfo = {
            id: week.id,
            startDate: week.startDate,
            endDate: week.endDate,
          };
        }

        // Get category breakdown for user if needed
        let additionalUserData: Record<string, unknown> = {};
        if (input.userId) {
          const userEntry = cachedData.find(
            (user) => user.userId === input.userId,
          );
          if (userEntry?.categoryBreakdown) {
            // Get all available activity categories for breakdown naming
            const allCategories = yield* activityCategoryService.list();

            const categoryBreakdownData = Object.entries(
              userEntry.categoryBreakdown,
            )
              .filter(([, points]) => points && Number(points) > 0)
              .map(([categoryId, points]) => ({
                categoryId,
                categoryName:
                  allCategories.find((cat) => cat.id === categoryId)?.name ||
                  categoryId,
                points: points.toString(),
              }))
              .sort((a, b) => Number(b.points) - Number(a.points));

            additionalUserData = { categoryBreakdown: categoryBreakdownData };
          }
        }

        // Build common leaderboard response
        const { topUsers, userStats, globalStats } = buildLeaderboardResponse({
          cachedData: cachedData,
          statsCache: statsCache ?? null,
          totalUsersInSystem,
          userId: input.userId,
          additionalUserData,
        });

        return {
          topUsers,
          userStats,
          globalStats,
          seasonInfo,
          weekInfo,
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
        // Filter out users with 0 points to match stats calculations
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
                  sql`${categoryLeaderboardCache.totalPoints}::numeric > 0`,
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

        // Get total users count in the system
        const totalUsersInSystem = yield* userService.getTotalUserCount();

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
          totalUsersInSystem,
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
                    sql`${categoryLeaderboardCache.totalPoints}::numeric > 0`,
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
        weekId?: string;
        page?: number;
        limit?: number;
      }) {
        const page = input.page ?? 0;
        const limit = Math.min(input.limit ?? 100, 100);

        // Determine weekId for cache lookup (null for season totals, or specific week)
        const weekIdForCache =
          input.weekId || '00000000-0000-0000-0000-000000000000';

        const statsCacheResult = yield* Effect.tryPromise(() =>
          db
            .select({
              totalUsers: leaderboardStatsCache.totalUsers,
            })
            .from(leaderboardStatsCache)
            .where(
              eq(
                leaderboardStatsCache.cacheKey,
                `season_${input.seasonId}_week_${weekIdForCache}`,
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
                userId: seasonLeaderboardCache.userId,
                identityAddress: users.identityAddress,
                label: users.label,
                totalPoints: seasonLeaderboardCache.totalPoints,
                rank: seasonLeaderboardCache.rank,
              })
              .from(seasonLeaderboardCache)
              .innerJoin(users, eq(seasonLeaderboardCache.userId, users.id))
              .where(
                and(
                  eq(seasonLeaderboardCache.seasonId, input.seasonId),
                  eq(seasonLeaderboardCache.weekId, weekIdForCache),
                  sql`${seasonLeaderboardCache.totalPoints}::numeric > 0`,
                ),
              )
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
