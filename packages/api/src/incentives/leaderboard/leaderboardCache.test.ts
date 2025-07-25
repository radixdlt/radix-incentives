import { describe, inject } from "vitest";
import { Effect, Layer, Logger, LogLevel } from "effect";
import { it } from "@effect/vitest";
import { createDbClientLive } from "../db/dbClient";
import { LeaderboardCacheService } from "./leaderboardCache";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and } from "drizzle-orm";

import {
  schema,
  seasons,
  weeks,
  users,
  accounts,
  userSeasonPoints,
  accountActivityPoints,
  seasonLeaderboardCache,
  categoryLeaderboardCache,
  leaderboardStatsCache,
} from "db/incentives";

import postgres from "postgres";

describe(
  "LeaderboardCacheService",
  {
    timeout: 60_000,
  },
  () => {
    const dbUrl = inject("testDbUrl");
    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });

    const dbLive = createDbClientLive(db);
    const leaderboardCacheServiceLive = LeaderboardCacheService.Default.pipe(
      Layer.provide(dbLive),
      Layer.provide(Logger.minimumLogLevel(LogLevel.None))
    );

    // Test data constants
    const SEASON_ID_1 = "11111111-1111-1111-1111-111111111111";
    const SEASON_ID_2 = "22222222-2222-2222-2222-222222222222";
    const WEEK_ID_1 = "33333333-3333-3333-3333-333333333333";
    const WEEK_ID_2 = "44444444-4444-4444-4444-444444444444";
    const USER_ID_1 = "55555555-5555-5555-5555-555555555555";
    const USER_ID_2 = "66666666-6666-6666-6666-666666666666";
    const USER_ID_3 = "77777777-7777-7777-7777-777777777777";

    const setupTestData = Effect.gen(function* () {
      // Clean up cache tables
      yield* Effect.promise(() => db.delete(seasonLeaderboardCache));
      yield* Effect.promise(() => db.delete(categoryLeaderboardCache));
      yield* Effect.promise(() => db.delete(leaderboardStatsCache));

      // Clean up data tables
      yield* Effect.promise(() => db.delete(accountActivityPoints));
      yield* Effect.promise(() => db.delete(userSeasonPoints));
      yield* Effect.promise(() => db.delete(accounts));
      yield* Effect.promise(() => db.delete(users));
      yield* Effect.promise(() => db.delete(weeks));
      yield* Effect.promise(() => db.delete(seasons));

      // Insert test seasons
      yield* Effect.promise(() =>
        db.insert(seasons).values([
          { id: SEASON_ID_1, name: "Test Season 1", status: "active" },
          { id: SEASON_ID_2, name: "Test Season 2", status: "completed" },
        ])
      );

      // Insert test weeks
      yield* Effect.promise(() =>
        db.insert(weeks).values([
          {
            id: WEEK_ID_1,
            seasonId: SEASON_ID_1,
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-01-07"),
          },
          {
            id: WEEK_ID_2,
            seasonId: SEASON_ID_1,
            startDate: new Date("2025-01-08"),
            endDate: new Date("2025-01-14"),
          },
        ])
      );

      // Insert test users
      yield* Effect.promise(() =>
        db.insert(users).values([
          {
            id: USER_ID_1,
            identityAddress: `identity_${USER_ID_1}`,
            label: "TestUser1",
          },
          {
            id: USER_ID_2,
            identityAddress: `identity_${USER_ID_2}`,
            label: "TestUser2",
          },
          {
            id: USER_ID_3,
            identityAddress: `identity_${USER_ID_3}`,
            label: "TestUser3",
          },
        ])
      );

      // Insert test accounts
      yield* Effect.promise(() =>
        db.insert(accounts).values([
          { userId: USER_ID_1, address: "account_rdx1111", label: "Account 1" },
          { userId: USER_ID_2, address: "account_rdx2222", label: "Account 2" },
          { userId: USER_ID_3, address: "account_rdx3333", label: "Account 3" },
        ])
      );
    });

    it.effect("should populate season leaderboard cache correctly", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        // Insert test season points data
        yield* Effect.promise(() =>
          db.insert(userSeasonPoints).values([
            {
              userId: USER_ID_1,
              seasonId: SEASON_ID_1,
              weekId: WEEK_ID_1,
              points: "100.5",
            },
            {
              userId: USER_ID_1,
              seasonId: SEASON_ID_1,
              weekId: WEEK_ID_2,
              points: "50.25",
            },
            {
              userId: USER_ID_2,
              seasonId: SEASON_ID_1,
              weekId: WEEK_ID_1,
              points: "200.75",
            },
            {
              userId: USER_ID_2,
              seasonId: SEASON_ID_1,
              weekId: WEEK_ID_2,
              points: "25.0",
            },
            {
              userId: USER_ID_3,
              seasonId: SEASON_ID_1,
              weekId: WEEK_ID_1,
              points: "75.0",
            },
          ])
        );

        const leaderboardCacheService = yield* LeaderboardCacheService;

        // Populate cache for specific season
        yield* leaderboardCacheService.populateAll({ seasonId: SEASON_ID_1 });

        // Verify season cache was populated
        const seasonCache = yield* Effect.promise(() =>
          db
            .select()
            .from(seasonLeaderboardCache)
            .where(eq(seasonLeaderboardCache.seasonId, SEASON_ID_1))
            .orderBy(seasonLeaderboardCache.rank)
        );

        // Expected totals: User2=225.75, User1=150.75, User3=75.0
        expect(seasonCache).toHaveLength(3);
        expect(seasonCache[0].userId).toBe(USER_ID_2);
        expect(seasonCache[0].totalPoints).toBe("225.750000");
        expect(seasonCache[0].rank).toBe(1);

        expect(seasonCache[1].userId).toBe(USER_ID_1);
        expect(seasonCache[1].totalPoints).toBe("150.750000");
        expect(seasonCache[1].rank).toBe(2);

        expect(seasonCache[2].userId).toBe(USER_ID_3);
        expect(seasonCache[2].totalPoints).toBe("75.000000");
        expect(seasonCache[2].rank).toBe(3);

        // Verify stats cache was populated
        const statsCache = yield* Effect.promise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(eq(leaderboardStatsCache.cacheKey, `season_${SEASON_ID_1}`))
        );

        expect(statsCache).toHaveLength(1);
        expect(statsCache[0].totalUsers).toBe(3);
        expect(Number.parseFloat(statsCache[0].median!)).toBeCloseTo(150.75); // Middle value
        expect(Number.parseFloat(statsCache[0].average!)).toBeCloseTo(150.5); // (225.75 + 150.75 + 75) / 3
      }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );

    it.effect("should populate category leaderboard cache correctly", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        // Insert test activity points data
        yield* Effect.promise(() =>
          db.insert(accountActivityPoints).values([
            {
              accountAddress: "account_rdx1111",
              weekId: WEEK_ID_1,
              activityId: "c9_trade_xrd-xusdc",
              activityPoints: "100.0",
            },
            {
              accountAddress: "account_rdx1111",
              weekId: WEEK_ID_1,
              activityId: "c9_trade_xrd-xusdt",
              activityPoints: "50.0",
            },
            {
              accountAddress: "account_rdx2222",
              weekId: WEEK_ID_1,
              activityId: "c9_trade_xrd-xusdc",
              activityPoints: "200.0",
            },
            {
              accountAddress: "account_rdx3333",
              weekId: WEEK_ID_1,
              activityId: "c9_trade_xeth-xrd",
              activityPoints: "75.0",
            },
          ])
        );

        const leaderboardCacheService = yield* LeaderboardCacheService;

        // Populate cache for specific week
        yield* leaderboardCacheService.populateAll({ weekId: WEEK_ID_1 });

        // Verify caviarnine category cache (includes both swap and lp activities)
        const categoryCache = yield* Effect.promise(() =>
          db
            .select()
            .from(categoryLeaderboardCache)
            .where(
              and(
                eq(categoryLeaderboardCache.weekId, WEEK_ID_1),
                eq(categoryLeaderboardCache.categoryId, "tradingVolume")
              )
            )
            .orderBy(categoryLeaderboardCache.rank)
        );

        // Expected totals: User1=150 (swap100 + lp50), User2=200 (swap200), User3=75 (lp75)
        expect(categoryCache).toHaveLength(3);
        expect(categoryCache[0].userId).toBe(USER_ID_2);
        expect(categoryCache[0].totalPoints).toBe("200.000000");
        expect(categoryCache[0].rank).toBe(1);

        expect(categoryCache[1].userId).toBe(USER_ID_1);
        expect(categoryCache[1].totalPoints).toBe("150.000000");
        expect(categoryCache[1].rank).toBe(2);

        expect(categoryCache[2].userId).toBe(USER_ID_3);
        expect(categoryCache[2].totalPoints).toBe("75.000000");
        expect(categoryCache[2].rank).toBe(3);

        // Verify activity breakdown is stored correctly
        expect(categoryCache[1].activityBreakdown).toEqual({
          "c9_trade_xrd-xusdc": 100,
          "c9_trade_xrd-xusdt": 50,
        });

        // Verify stats cache for category
        const statsCache = yield* Effect.promise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(
              eq(
                leaderboardStatsCache.cacheKey,
                `category_${WEEK_ID_1}_tradingVolume`
              )
            )
        );

        expect(statsCache).toHaveLength(1);
        expect(statsCache[0].totalUsers).toBe(3);
        expect(Number.parseFloat(statsCache[0].median!)).toBeCloseTo(150); // Middle value
      }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );

    it.effect("should handle empty data gracefully", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        const leaderboardCacheService = yield* LeaderboardCacheService;

        // Try to populate cache for season with no data
        yield* leaderboardCacheService.populateAll({ seasonId: SEASON_ID_2 });

        // Verify no cache entries were created
        const seasonCache = yield* Effect.promise(() =>
          db
            .select()
            .from(seasonLeaderboardCache)
            .where(eq(seasonLeaderboardCache.seasonId, SEASON_ID_2))
        );

        expect(seasonCache).toHaveLength(0);

        // Stats cache should still be populated but with empty stats
        const statsCache = yield* Effect.promise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(eq(leaderboardStatsCache.cacheKey, `season_${SEASON_ID_2}`))
        );

        expect(statsCache).toHaveLength(0); // No stats for empty dataset
      }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );

    it.effect(
      "should rebuild cache when called multiple times (idempotent)",
      () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Insert initial data
          yield* Effect.promise(() =>
            db.insert(userSeasonPoints).values([
              {
                userId: USER_ID_1,
                seasonId: SEASON_ID_1,
                weekId: WEEK_ID_1,
                points: "100.0",
              },
            ])
          );

          const leaderboardCacheService = yield* LeaderboardCacheService;

          // First cache population
          yield* leaderboardCacheService.populateAll({ seasonId: SEASON_ID_1 });

          let seasonCache = yield* Effect.promise(() =>
            db
              .select()
              .from(seasonLeaderboardCache)
              .where(eq(seasonLeaderboardCache.seasonId, SEASON_ID_1))
          );

          expect(seasonCache).toHaveLength(1);
          expect(seasonCache[0].totalPoints).toBe("100.000000");

          // Add more data
          yield* Effect.promise(() =>
            db.insert(userSeasonPoints).values([
              {
                userId: USER_ID_2,
                seasonId: SEASON_ID_1,
                weekId: WEEK_ID_1,
                points: "200.0",
              },
            ])
          );

          // Second cache population should rebuild completely
          yield* leaderboardCacheService.populateAll({ seasonId: SEASON_ID_1 });

          seasonCache = yield* Effect.promise(() =>
            db
              .select()
              .from(seasonLeaderboardCache)
              .where(eq(seasonLeaderboardCache.seasonId, SEASON_ID_1))
              .orderBy(seasonLeaderboardCache.rank)
          );

          expect(seasonCache).toHaveLength(2);
          expect(seasonCache[0].userId).toBe(USER_ID_2); // Higher points, rank 1
          expect(seasonCache[1].userId).toBe(USER_ID_1); // Lower points, rank 2
        }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );

    it.effect(
      "should populate all seasons and weeks when no specific ID provided",
      () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Insert data for multiple seasons/weeks
          yield* Effect.promise(() =>
            db.insert(userSeasonPoints).values([
              {
                userId: USER_ID_1,
                seasonId: SEASON_ID_1,
                weekId: WEEK_ID_1,
                points: "100.0",
              },
              {
                userId: USER_ID_1,
                seasonId: SEASON_ID_2,
                weekId: WEEK_ID_1,
                points: "200.0",
              },
            ])
          );

          yield* Effect.promise(() =>
            db.insert(accountActivityPoints).values([
              {
                accountAddress: "account_rdx1111",
                weekId: WEEK_ID_1,
                activityId: "c9_trade_xrd-xusdc",
                activityPoints: "50.0",
              },
              {
                accountAddress: "account_rdx1111",
                weekId: WEEK_ID_2,
                activityId: "c9_trade_xrd-xusdc",
                activityPoints: "75.0",
              },
            ])
          );

          const leaderboardCacheService = yield* LeaderboardCacheService;

          // Populate all caches
          yield* leaderboardCacheService.populateAll({});

          // Verify season caches for both seasons
          const season1Cache = yield* Effect.promise(() =>
            db
              .select()
              .from(seasonLeaderboardCache)
              .where(eq(seasonLeaderboardCache.seasonId, SEASON_ID_1))
          );
          expect(season1Cache).toHaveLength(1);

          const season2Cache = yield* Effect.promise(() =>
            db
              .select()
              .from(seasonLeaderboardCache)
              .where(eq(seasonLeaderboardCache.seasonId, SEASON_ID_2))
          );
          expect(season2Cache).toHaveLength(1);

          // Verify category caches for both weeks
          const week1Cache = yield* Effect.promise(() =>
            db
              .select()
              .from(categoryLeaderboardCache)
              .where(eq(categoryLeaderboardCache.weekId, WEEK_ID_1))
          );
          expect(week1Cache).toHaveLength(1);

          const week2Cache = yield* Effect.promise(() =>
            db
              .select()
              .from(categoryLeaderboardCache)
              .where(eq(categoryLeaderboardCache.weekId, WEEK_ID_2))
          );
          expect(week2Cache).toHaveLength(1);

          // Verify stats cache was populated
          const allStatsCache = yield* Effect.promise(() =>
            db.select().from(leaderboardStatsCache)
          );
          expect(allStatsCache.length).toBeGreaterThan(0);
        }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );

    it.effect(
      "should handle large dataset efficiently (performance test)",
      () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Create larger dataset to test performance
          const largeUserData: Array<{
            id: string;
            identityAddress: string;
            label: string;
          }> = [];
          const largePointsData: Array<{
            userId: string;
            seasonId: string;
            weekId: string;
            points: string;
          }> = [];

          // Create 100 test users
          for (let i = 0; i < 100; i++) {
            const userId = `${i.toString().padStart(8, "0")}-${i.toString().padStart(4, "0")}-${i.toString().padStart(4, "0")}-${i.toString().padStart(4, "0")}-${i.toString().padStart(12, "0")}`;
            largeUserData.push({
              id: userId,
              identityAddress: `identity_${userId}`,
              label: `TestUser${i}`,
            });

            // Add season points for each user
            largePointsData.push({
              userId: userId,
              seasonId: SEASON_ID_1,
              weekId: WEEK_ID_1,
              points: (Math.random() * 1000).toFixed(2),
            });
          }

          // Insert large dataset
          yield* Effect.promise(() => db.insert(users).values(largeUserData));
          yield* Effect.promise(() =>
            db.insert(userSeasonPoints).values(largePointsData)
          );

          const leaderboardCacheService = yield* LeaderboardCacheService;

          const startTime = Date.now();

          // Populate cache for large dataset
          yield* leaderboardCacheService.populateAll({ seasonId: SEASON_ID_1 });

          const endTime = Date.now();
          const duration = endTime - startTime;

          // Verify cache was populated correctly
          const seasonCache = yield* Effect.promise(() =>
            db
              .select()
              .from(seasonLeaderboardCache)
              .where(eq(seasonLeaderboardCache.seasonId, SEASON_ID_1))
          );

          expect(seasonCache).toHaveLength(100);

          // Verify rankings are correct (should be ordered by points desc)
          for (let i = 0; i < seasonCache.length - 1; i++) {
            const currentPoints = Number.parseFloat(seasonCache[i].totalPoints);
            const nextPoints = Number.parseFloat(
              seasonCache[i + 1].totalPoints
            );
            expect(currentPoints).toBeGreaterThanOrEqual(nextPoints);
            expect(seasonCache[i].rank).toBe(i + 1);
          }

          // Performance assertion - should complete within reasonable time
          expect(duration).toBeLessThan(10000); // 10 seconds max for 100 users

          console.log(`Cache population for 100 users took ${duration}ms`);
        }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );
  }
);
