import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { SeasonService } from "../season/season";
import { WeekService } from "../week/week";
import { ActivityCategoryWeekService } from "../activity-category-week/activityCategoryWeek";
import { ActivityWeekService } from "../activity-week/activityWeek";
import {
  seasonLeaderboardCache,
  categoryLeaderboardCache,
  leaderboardStatsCache,
  userSeasonPoints,
  accountActivityPoints,
  accounts,
} from "db/incentives";
import { eq, and, sql, desc, inArray } from "drizzle-orm";

export type PopulateLeaderboardCacheInput = {
  weekId?: string;
};

export class LeaderboardCacheService extends Effect.Service<LeaderboardCacheService>()(
  "LeaderboardCacheService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const seasonService = yield* SeasonService;
      const weekService = yield* WeekService;
      const activityCategoryWeekService = yield* ActivityCategoryWeekService;
      const activityWeekService = yield* ActivityWeekService;

      return {
        populateAll: Effect.fn(function* (
          input: PopulateLeaderboardCacheInput
        ) {
          yield* Effect.log("Starting leaderboard cache population");

          // Handle specific week
          if (input.weekId) {
            yield* Effect.log(
              `Populating cache for specific week: ${input.weekId}`
            );

            const season = yield* seasonService.getByWeekId(input.weekId!);
            yield* populateSeasonLeaderboard({ seasonId: season.id });

            yield* populateCategoryLeaderboards({ weekId: input.weekId });
            yield* populateGlobalStats();
            yield* Effect.log("Week leaderboard cache population completed");
            return;
          }

          // Handle all seasons and weeks (default behavior)
          yield* Effect.log("Populating cache for ALL seasons and weeks");

          const seasonsToProcess = yield* seasonService.list();
          const weeksToProcess = yield* weekService.list({});

          yield* Effect.log(
            `Processing ${seasonsToProcess.length} seasons and ${weeksToProcess.length} weeks`
          );

          // Populate season leaderboard cache
          // Sequential processing to avoid overwhelming database connections
          // Could be optimized with parallel processing if rebuild times become too long
          // But we should really never populate the entire cache anyways... maybe it's redudant
          for (const season of seasonsToProcess) {
            yield* populateSeasonLeaderboard({ seasonId: season.id });
          }

          // Populate category leaderboard cache
          // Sequential processing to avoid overwhelming database connections
          // Could be optimized with parallel processing if rebuild times become too long
          // But we should really never populate the entire cache anyways... maybe it's redudant
          for (const week of weeksToProcess) {
            yield* populateCategoryLeaderboards({ weekId: week.id });
          }

          yield* populateGlobalStats();

          yield* Effect.log("All leaderboard cache population completed");
        }),
      };

      function* populateSeasonLeaderboard(input: { seasonId: string }) {
        yield* Effect.log(
          `Populating season leaderboard cache for season ${input.seasonId}`
        );

        // Clear existing cache for this season
        yield* Effect.tryPromise({
          try: () =>
            db
              .delete(seasonLeaderboardCache)
              .where(eq(seasonLeaderboardCache.seasonId, input.seasonId)),
          catch: (error) => new DbError(error),
        });

        // Calculate season totals and rankings
        const seasonTotals = yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                userId: userSeasonPoints.userId,
                totalPoints: sql<number>`SUM(${userSeasonPoints.points})`,
              })
              .from(userSeasonPoints)
              .where(eq(userSeasonPoints.seasonId, input.seasonId))
              .groupBy(userSeasonPoints.userId)
              .orderBy(desc(sql`SUM(${userSeasonPoints.points})`)),
          catch: (error) => new DbError(error),
        });

        // Insert with rankings
        const cacheEntries = seasonTotals.map((entry, index) => ({
          seasonId: input.seasonId,
          userId: entry.userId,
          totalPoints: entry.totalPoints.toString(),
          rank: index + 1,
        }));

        if (cacheEntries.length > 0) {
          // Insert in batches
          const batchSize = 1000;
          for (let i = 0; i < cacheEntries.length; i += batchSize) {
            const batch = cacheEntries.slice(i, i + batchSize);
            yield* Effect.tryPromise({
              try: () => db.insert(seasonLeaderboardCache).values(batch),
              catch: (error) => new DbError(error),
            });
          }
        }

        yield* Effect.log(
          `Populated season leaderboard cache with ${cacheEntries.length} entries`
        );
      }

      function* populateCategoryLeaderboards(input: { weekId: string }) {
        yield* Effect.log(
          `Populating category leaderboard cache for week ${input.weekId}`
        );

        // Clear existing cache for this week
        yield* Effect.tryPromise({
          try: () =>
            db
              .delete(categoryLeaderboardCache)
              .where(eq(categoryLeaderboardCache.weekId, input.weekId)),
          catch: (error) => new DbError(error),
        });

        // Get all activity categories that have activities with points for this week
        const categories =
          yield* activityCategoryWeekService.getAvailableForWeek({
            weekId: input.weekId,
          });

        for (const category of categories) {
          // Get activities that are included in the provided week ID for this category and have points
          const categoryActivities =
            yield* activityWeekService.getActivitiesWithPointsForWeek({
              weekId: input.weekId,
              categoryId: category.id,
            });

          if (categoryActivities.length === 0) continue;

          const activityIds = categoryActivities.map((a) => a.id);

          // Calculate category totals and rankings
          const categoryTotals = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  userId: accounts.userId,
                  totalPoints: sql<number>`SUM(${accountActivityPoints.activityPoints})`,
                  activityBreakdown: sql<Record<string, number>>`
                    jsonb_object_agg(
                      ${accountActivityPoints.activityId},
                      ${accountActivityPoints.activityPoints}
                    )
                  `,
                })
                .from(accountActivityPoints)
                .innerJoin(
                  accounts,
                  eq(accountActivityPoints.accountAddress, accounts.address)
                )
                .where(
                  and(
                    eq(accountActivityPoints.weekId, input.weekId),
                    inArray(accountActivityPoints.activityId, activityIds)
                  )
                )
                .groupBy(accounts.userId)
                .orderBy(
                  desc(sql`SUM(${accountActivityPoints.activityPoints})`)
                ),
            catch: (error) => new DbError(error),
          });

          // Insert category cache entries
          const cacheEntries = categoryTotals.map((entry, index) => ({
            weekId: input.weekId,
            categoryId: category.id,
            userId: entry.userId,
            totalPoints: entry.totalPoints.toString(),
            rank: index + 1,
            activityBreakdown: entry.activityBreakdown,
          }));

          if (cacheEntries.length > 0) {
            yield* Effect.tryPromise({
              try: () =>
                db.insert(categoryLeaderboardCache).values(cacheEntries),
              catch: (error) => new DbError(error),
            });
          }

          yield* Effect.log(
            `Populated category ${category.id} cache with ${cacheEntries.length} entries`
          );
        }
      }

      function* populateGlobalStats() {
        yield* Effect.log("Populating global statistics cache");

        // Clear existing stats
        yield* Effect.tryPromise({
          try: () => db.delete(leaderboardStatsCache),
          catch: (error) => new DbError(error),
        });

        // Calculate season stats using SQL aggregation - no memory loading
        const seasonStats = yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                cacheKey:
                  sql<string>`'season_' || ${seasonLeaderboardCache.seasonId}`.as(
                    "cache_key"
                  ),
                totalUsers: sql<number>`COUNT(*)`.as("total_users"),
                median:
                  sql<string>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${seasonLeaderboardCache.totalPoints}::numeric)`.as(
                    "median"
                  ),
                average:
                  sql<string>`AVG(${seasonLeaderboardCache.totalPoints}::numeric)`.as(
                    "average"
                  ),
              })
              .from(seasonLeaderboardCache)
              .groupBy(seasonLeaderboardCache.seasonId),
          catch: (error) => new DbError(error),
        });

        // Calculate category stats using SQL aggregation, no memory loading to avoid out of memory issues
        const categoryStats = yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                cacheKey:
                  sql<string>`'category_' || ${categoryLeaderboardCache.weekId} || '_' || ${categoryLeaderboardCache.categoryId}`.as(
                    "cache_key"
                  ),
                totalUsers: sql<number>`COUNT(*)`.as("total_users"),
                median:
                  sql<string>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${categoryLeaderboardCache.totalPoints}::numeric)`.as(
                    "median"
                  ),
                average:
                  sql<string>`AVG(${categoryLeaderboardCache.totalPoints}::numeric)`.as(
                    "average"
                  ),
              })
              .from(categoryLeaderboardCache)
              .groupBy(
                categoryLeaderboardCache.weekId,
                categoryLeaderboardCache.categoryId
              ),
          catch: (error) => new DbError(error),
        });

        // Combine and format stats entries
        const allStatsEntries = [
          ...seasonStats.map((stat) => ({
            cacheKey: stat.cacheKey,
            totalUsers: stat.totalUsers,
            median: stat.median,
            average: stat.average,
          })),
          ...categoryStats.map((stat) => ({
            cacheKey: stat.cacheKey,
            totalUsers: stat.totalUsers,
            median: stat.median,
            average: stat.average,
          })),
        ];

        if (allStatsEntries.length > 0) {
          yield* Effect.tryPromise({
            try: () => db.insert(leaderboardStatsCache).values(allStatsEntries),
            catch: (error) => new DbError(error),
          });
        }

        yield* Effect.log(
          `Populated ${allStatsEntries.length} global statistics entries using SQL aggregation`
        );
      }
    }),
  }
) {}
