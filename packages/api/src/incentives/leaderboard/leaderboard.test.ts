import { describe, inject } from "vitest";
import { Effect, Layer, Logger, LogLevel } from "effect";
import { it } from "@effect/vitest";
import { createDbClientLive } from "../db/dbClient";
import { LeaderboardService, CacheNotAvailableError } from "./leaderboard";
import { drizzle } from "drizzle-orm/postgres-js";

import {
  schema,
  seasons,
  weeks,
  users,
  accounts,
  seasonLeaderboardCache,
  categoryLeaderboardCache,
  leaderboardStatsCache,
} from "db/incentives";

import postgres from "postgres";

describe(
  "LeaderboardService",
  {
    timeout: 60_000,
  },
  () => {
    const dbUrl = inject("testDbUrl");
    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });

    const dbLive = createDbClientLive(db);
    const leaderboardServiceLive = LeaderboardService.Default.pipe(
      Layer.provide(dbLive),
      Layer.provide(Logger.minimumLogLevel(LogLevel.None))
    );

    // Test data constants
    const SEASON_ID = "11111111-1111-1111-1111-111111111111";
    const WEEK_ID = "33333333-3333-3333-3333-333333333333";
    const USER_ID_1 = "55555555-5555-5555-5555-555555555555";
    const USER_ID_2 = "66666666-6666-6666-6666-666666666666";
    const USER_ID_3 = "77777777-7777-7777-7777-777777777777";

    const setupTestData = Effect.gen(function* () {
      // Clean up cache tables
      yield* Effect.promise(() => db.delete(seasonLeaderboardCache));
      yield* Effect.promise(() => db.delete(categoryLeaderboardCache));
      yield* Effect.promise(() => db.delete(leaderboardStatsCache));

      // Clean up data tables
      yield* Effect.promise(() => db.delete(accounts));
      yield* Effect.promise(() => db.delete(users));
      yield* Effect.promise(() => db.delete(weeks));
      yield* Effect.promise(() => db.delete(seasons));

      // Insert test data
      yield* Effect.promise(() =>
        db
          .insert(seasons)
          .values([{ id: SEASON_ID, name: "Test Season", status: "active" }])
      );

      yield* Effect.promise(() =>
        db.insert(weeks).values([
          {
            id: WEEK_ID,
            seasonId: SEASON_ID,
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-01-07"),
          },
        ])
      );

      yield* Effect.promise(() =>
        db.insert(users).values([
          {
            id: USER_ID_1,
            identityAddress: `identity_${USER_ID_1}`,
            label: "TopPlayer",
          },
          {
            id: USER_ID_2,
            identityAddress: `identity_${USER_ID_2}`,
            label: "MiddlePlayer",
          },
          {
            id: USER_ID_3,
            identityAddress: `identity_${USER_ID_3}`,
            label: "NewPlayer",
          },
        ])
      );
    });

    describe("getSeasonLeaderboard", () => {
      it.effect(
        "should return season leaderboard when cache is available",
        () =>
          Effect.gen(function* () {
            yield* setupTestData;

            // Insert mock cache data
            yield* Effect.promise(() =>
              db.insert(seasonLeaderboardCache).values([
                {
                  seasonId: SEASON_ID,
                  userId: USER_ID_1,
                  totalPoints: "1000.50",
                  rank: 1,
                },
                {
                  seasonId: SEASON_ID,
                  userId: USER_ID_2,
                  totalPoints: "750.25",
                  rank: 2,
                },
                {
                  seasonId: SEASON_ID,
                  userId: USER_ID_3,
                  totalPoints: "250.75",
                  rank: 3,
                },
              ])
            );

            // Insert stats cache
            yield* Effect.promise(() =>
              db.insert(leaderboardStatsCache).values([
                {
                  cacheKey: `season_${SEASON_ID}`,
                  totalUsers: 3,
                  median: "750.250000",
                  average: "667.170000",
                },
              ])
            );

            const leaderboardService = yield* LeaderboardService;
            const result = yield* leaderboardService.getSeasonLeaderboard({
              seasonId: SEASON_ID,
            });

            // Verify response structure
            expect(result.topUsers).toHaveLength(3);
            expect(result.topUsers[0]).toEqual({
              userId: USER_ID_1,
              label: "TopPlayer",
              totalPoints: "1000.500000",
              rank: 1,
            });

            expect(result.globalStats).toEqual({
              totalUsers: 3,
              median: "750.250000",
              average: "667.170000",
            });

            expect(result.seasonInfo).toEqual({
              id: SEASON_ID,
              name: "Test Season",
            });

            expect(result.userStats).toBeNull(); // No userId provided
          }).pipe(Effect.provide(leaderboardServiceLive))
      );

      it.effect("should return user stats when userId is provided", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Insert additional test users for percentile calculation
          yield* Effect.promise(() =>
            db.insert(users).values([
              {
                id: "44444444-4444-4444-4444-444444444444",
                identityAddress: "identity_44444444-4444-4444-4444-444444444444",
                label: "TestUser4",
              },
              {
                id: "99999999-9999-9999-9999-999999999999",
                identityAddress: "identity_99999999-9999-9999-9999-999999999999",
                label: "TestUser5",
              },
            ])
          );

          // Insert mock cache data
          yield* Effect.promise(() =>
            db.insert(seasonLeaderboardCache).values([
              {
                seasonId: SEASON_ID,
                userId: USER_ID_1,
                totalPoints: "1000.000000",
                rank: 1,
              },
              {
                seasonId: SEASON_ID,
                userId: USER_ID_2,
                totalPoints: "750.000000",
                rank: 2,
              },
              {
                seasonId: SEASON_ID,
                userId: USER_ID_3,
                totalPoints: "250.000000",
                rank: 3,
              },
              // Add more users to test percentile calculation
              {
                seasonId: SEASON_ID,
                userId: "44444444-4444-4444-4444-444444444444",
                totalPoints: "100.000000",
                rank: 4,
              },
              {
                seasonId: SEASON_ID,
                userId: "99999999-9999-9999-9999-999999999999",
                totalPoints: "50.000000",
                rank: 5,
              },
            ])
          );

          const leaderboardService = yield* LeaderboardService;
          const result = yield* leaderboardService.getSeasonLeaderboard({
            seasonId: SEASON_ID,
            userId: USER_ID_2, // Middle ranked user
          });

          expect(result.userStats).toEqual({
            rank: 2,
            totalPoints: "750.000000",
            percentile: 80, // (1 - (2-1)/5) * 100 = 80th percentile
          });

          // Top 5 should be limited to actual top 5
          expect(result.topUsers).toHaveLength(5);
        }).pipe(Effect.provide(leaderboardServiceLive))
      );

      it.effect(
        "should fail with CacheNotAvailableError when cache is empty",
        () =>
          Effect.gen(function* () {
            yield* setupTestData;

            const leaderboardService = yield* LeaderboardService;

            const result = yield* Effect.either(
              leaderboardService.getSeasonLeaderboard({
                seasonId: SEASON_ID,
              })
            );

            expect(result._tag).toBe("Left");
            if (result._tag === "Left") {
              expect(result.left).toBeInstanceOf(CacheNotAvailableError);
              expect(result.left.message).toContain("cache is being built");
            }
          }).pipe(Effect.provide(leaderboardServiceLive))
      );

      it.effect("should fail when season does not exist", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;
          const nonExistentSeasonId = "99999999-9999-9999-9999-999999999999";

          const result = yield* Effect.either(
            leaderboardService.getSeasonLeaderboard({
              seasonId: nonExistentSeasonId,
            })
          );

          expect(result._tag).toBe("Left");
          if (result._tag === "Left") {
            expect(result.left.message).toBe("Season not found");
          }
        }).pipe(Effect.provide(leaderboardServiceLive))
      );
    });

    describe("getActivityCategoryLeaderboard", () => {
      it.effect(
        "should return category leaderboard with activity breakdown",
        () =>
          Effect.gen(function* () {
            yield* setupTestData;

            // Insert mock cache data with activity breakdown
            yield* Effect.promise(() =>
              db.insert(categoryLeaderboardCache).values([
                {
                  weekId: WEEK_ID,
                  categoryId: "tradingVolume",
                  userId: USER_ID_1,
                  totalPoints: "500.000000",
                  rank: 1,
                  activityBreakdown: {
                    "c9_trade_xrd-xusdc": 300,
                    "c9_trade_xrd-xusdt": 200,
                  },
                },
                {
                  weekId: WEEK_ID,
                  categoryId: "tradingVolume",
                  userId: USER_ID_2,
                  totalPoints: "300.000000",
                  rank: 2,
                  activityBreakdown: { "c9_trade_xrd-xusdc": 300 },
                },
              ])
            );

            // Insert stats cache
            yield* Effect.promise(() =>
              db.insert(leaderboardStatsCache).values([
                {
                  cacheKey: `category_${WEEK_ID}_tradingVolume`,
                  totalUsers: 2,
                  median: "400.000000",
                  average: "400.000000",
                },
              ])
            );

            const leaderboardService = yield* LeaderboardService;
            const result =
              yield* leaderboardService.getActivityCategoryLeaderboard({
                categoryId: "tradingVolume",
                weekId: WEEK_ID,
                userId: USER_ID_1,
              });

            expect(result.topUsers).toHaveLength(2);
            expect(result.topUsers[0]).toEqual({
              userId: USER_ID_1,
              label: "TopPlayer",
              totalPoints: "500.000000",
              rank: 1,
            });

            expect(result.userStats).toEqual({
              rank: 1,
              totalPoints: "500.000000",
              percentile: 100, // Top user = 100th percentile
              activityBreakdown: [
                {
                  activityId: "c9_trade_xrd-xusdc",
                  activityName: "c9_trade_xrd-xusdc",
                  points: "300",
                },
                {
                  activityId: "c9_trade_xrd-xusdt",
                  activityName: "c9_trade_xrd-xusdt",
                  points: "200",
                },
              ],
            });

            expect(result.categoryInfo).toEqual({
              id: "tradingVolume",
              name: "Trading volume",
            });

            expect(result.weekInfo).toEqual({
              id: WEEK_ID,
              startDate: new Date("2025-01-01"),
              endDate: new Date("2025-01-07"),
            });
          }).pipe(Effect.provide(leaderboardServiceLive))
      );

      it.effect("should handle missing activity breakdown gracefully", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Insert cache data without breakdown
          yield* Effect.promise(() =>
            db.insert(categoryLeaderboardCache).values([
              {
                weekId: WEEK_ID,
                categoryId: "tradingVolume",
                userId: USER_ID_1,
                totalPoints: "500.000000",
                rank: 1,
                activityBreakdown: {}, // Empty breakdown
              },
            ])
          );

          const leaderboardService = yield* LeaderboardService;
          const result =
            yield* leaderboardService.getActivityCategoryLeaderboard({
              categoryId: "tradingVolume",
              weekId: WEEK_ID,
              userId: USER_ID_1,
            });

          expect(
            result.userStats && "activityBreakdown" in result.userStats
              ? result.userStats.activityBreakdown
              : undefined
          ).toEqual([]);
        }).pipe(Effect.provide(leaderboardServiceLive))
      );

      it.effect("should fail when category or week does not exist", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;

          // Test non-existent category
          const categoryResult = yield* Effect.either(
            leaderboardService.getActivityCategoryLeaderboard({
              categoryId: "non-existent",
              weekId: WEEK_ID,
            })
          );

          expect(categoryResult._tag).toBe("Left");
          if (categoryResult._tag === "Left") {
            expect(categoryResult.left.message).toBe(
              "Activity category not found"
            );
          }

          // Test non-existent week
          const weekResult = yield* Effect.either(
            leaderboardService.getActivityCategoryLeaderboard({
              categoryId: "tradingVolume",
              weekId: "99999999-9999-9999-9999-999999999999",
            })
          );

          expect(weekResult._tag).toBe("Left");
          if (weekResult._tag === "Left") {
            expect(weekResult.left.message).toBe("Week not found");
          }
        }).pipe(Effect.provide(leaderboardServiceLive))
      );
    });

    describe("getAvailable* methods", () => {
      it.effect("should return available seasons", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;
          const seasons = yield* leaderboardService.getAvailableSeasons();

          expect(seasons).toHaveLength(1);
          expect(seasons[0]).toEqual({
            id: SEASON_ID,
            name: "Test Season",
            status: "active",
            startDate: "2025-01-01 00:00:00+00",
            endDate: "2025-01-07 00:00:00+00",
          });
        }).pipe(Effect.provide(leaderboardServiceLive))
      );

      it.effect("should return available weeks", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;
          const weeks = yield* leaderboardService.getAvailableWeeks({});

          expect(weeks).toHaveLength(1);
          expect(weeks[0]).toEqual({
            id: WEEK_ID,
            seasonId: SEASON_ID,
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-01-07"),
            seasonName: "Test Season",
          });
        }).pipe(Effect.provide(leaderboardServiceLive))
      );

      it.effect("should return available categories", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;
          const categories = yield* leaderboardService.getAvailableCategories();

          // Should return categories that have non-hold, non-common activities
          expect(categories.length).toBeGreaterThan(0);
          expect(categories[0]).toHaveProperty("id");
          expect(categories[0]).toHaveProperty("name");
          expect(categories[0]).toHaveProperty("description");
        }).pipe(Effect.provide(leaderboardServiceLive))
      );

      it.effect("should return available activities", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;
          const activities = yield* leaderboardService.getAvailableActivities();

          // Should exclude hold_ activities and common activity
          const holdActivities = activities.filter((a) =>
            a.id.includes("hold_")
          );
          const commonActivities = activities.filter((a) => a.id === "common");

          expect(holdActivities).toHaveLength(0);
          expect(commonActivities).toHaveLength(0);
          expect(activities.length).toBeGreaterThan(0);
        }).pipe(Effect.provide(leaderboardServiceLive))
      );
    });
  }
);
