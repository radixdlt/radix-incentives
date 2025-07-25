import { describe, inject } from "vitest";
import { Effect, Layer, Logger, LogLevel } from "effect";
import { it } from "@effect/vitest";
import { createDbClientLive } from "../db/dbClient";
import { LeaderboardCacheService } from "./leaderboardCache";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";

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
  "Leaderboard Statistics SQL Aggregation",
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
    const SEASON_ID = "11111111-1111-1111-1111-111111111111";
    const WEEK_ID = "33333333-3333-3333-3333-333333333333";

    const setupTestData = Effect.gen(function* () {
      // Clean up all tables
      yield* Effect.promise(() => db.delete(seasonLeaderboardCache));
      yield* Effect.promise(() => db.delete(categoryLeaderboardCache));
      yield* Effect.promise(() => db.delete(leaderboardStatsCache));
      yield* Effect.promise(() => db.delete(accountActivityPoints));
      yield* Effect.promise(() => db.delete(userSeasonPoints));
      yield* Effect.promise(() => db.delete(accounts));
      yield* Effect.promise(() => db.delete(users));
      yield* Effect.promise(() => db.delete(weeks));
      yield* Effect.promise(() => db.delete(seasons));

      // Insert test data
      yield* Effect.promise(() =>
        db
          .insert(seasons)
          .values([
            { id: SEASON_ID, name: "Stats Test Season", status: "active" },
          ])
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
    });

    it.effect(
      "should calculate statistics correctly with SQL aggregation",
      () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Create test data with known statistical properties
          const testUsers: Array<{
            id: string;
            identityAddress: string;
            label: string;
          }> = [];
          const testAccounts: Array<{
            userId: string;
            address: string;
            label: string;
          }> = [];
          const testSeasonPoints: Array<{
            userId: string;
            seasonId: string;
            weekId: string;
            points: string;
          }> = [];

          // Create 5 users with points: 100, 200, 300, 400, 500
          // Expected median: 300, Expected average: 300
          for (let i = 1; i <= 5; i++) {
            const userId = `${i.toString().padStart(8, "0")}-${i.toString().padStart(4, "0")}-${i.toString().padStart(4, "0")}-${i.toString().padStart(4, "0")}-${i.toString().padStart(12, "0")}`;
            testUsers.push({
              id: userId,
              identityAddress: `identity_${userId}`,
              label: `TestUser${i}`,
            });
            testAccounts.push({
              userId,
              address: `account_rdx${i}`,
              label: `Account ${i}`,
            });
            testSeasonPoints.push({
              userId,
              seasonId: SEASON_ID,
              weekId: WEEK_ID,
              points: (i * 100).toString(),
            });
          }

          yield* Effect.promise(() => db.insert(users).values(testUsers));
          yield* Effect.promise(() => db.insert(accounts).values(testAccounts));
          yield* Effect.promise(() =>
            db.insert(userSeasonPoints).values(testSeasonPoints)
          );

          const leaderboardCacheService = yield* LeaderboardCacheService;

          // Populate cache (this will use SQL aggregation for stats)
          yield* leaderboardCacheService.populateAll({ seasonId: SEASON_ID });

          // Verify stats were calculated correctly with SQL
          const statsCache = yield* Effect.promise(() =>
            db
              .select()
              .from(leaderboardStatsCache)
              .where(eq(leaderboardStatsCache.cacheKey, `season_${SEASON_ID}`))
          );

          expect(statsCache).toHaveLength(1);

          const stats = statsCache[0];
          expect(stats.totalUsers).toBe(5);

          // Verify SQL calculated median (middle value of sorted list: 100,200,300,400,500)
          expect(Number.parseFloat(stats.median!)).toBe(300);

          // Verify SQL calculated average
          expect(Number.parseFloat(stats.average!)).toBe(300);
        }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );

    it.effect("should handle edge cases in statistics calculation", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        // Test with single user
        const singleUserId = "00000000-0000-0000-0000-000000000001";
        yield* Effect.promise(() =>
          db.insert(users).values([
            {
              id: singleUserId,
              identityAddress: `identity_${singleUserId}`,
              label: "SingleUser",
            },
          ])
        );
        yield* Effect.promise(() =>
          db.insert(accounts).values([
            {
              userId: singleUserId,
              address: "account_single",
              label: "Single Account",
            },
          ])
        );
        yield* Effect.promise(() =>
          db.insert(userSeasonPoints).values([
            {
              userId: singleUserId,
              seasonId: SEASON_ID,
              weekId: WEEK_ID,
              points: "150.5",
            },
          ])
        );

        const leaderboardCacheService = yield* LeaderboardCacheService;
        yield* leaderboardCacheService.populateAll({ seasonId: SEASON_ID });

        const statsCache = yield* Effect.promise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(eq(leaderboardStatsCache.cacheKey, `season_${SEASON_ID}`))
        );

        expect(statsCache).toHaveLength(1);
        const stats = statsCache[0];

        // With single user, median and average should be the same
        expect(stats.totalUsers).toBe(1);
        expect(Number.parseFloat(stats.median!)).toBe(150.5);
        expect(Number.parseFloat(stats.average!)).toBe(150.5);
      }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );

    it.effect("should handle decimal precision correctly", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        // Test with decimal values that might cause floating point issues
        const testUsers: Array<{
          id: string;
          identityAddress: string;
          label: string;
        }> = [];
        const testAccounts: Array<{
          userId: string;
          address: string;
          label: string;
        }> = [];
        const testSeasonPoints: Array<{
          userId: string;
          seasonId: string;
          weekId: string;
          points: string;
        }> = [];

        const decimalValues = ["123.456", "789.012", "456.789"];
        for (let i = 0; i < decimalValues.length; i++) {
          const userId = `0000000${i}-0000-0000-0000-000000000001`;
          testUsers.push({
            id: userId,
            identityAddress: `identity_${userId}`,
            label: `DecimalUser${i}`,
          });
          testAccounts.push({
            userId,
            address: `account_decimal${i}`,
            label: `Decimal Account ${i}`,
          });
          testSeasonPoints.push({
            userId,
            seasonId: SEASON_ID,
            weekId: WEEK_ID,
            points: decimalValues[i],
          });
        }

        yield* Effect.promise(() => db.insert(users).values(testUsers));
        yield* Effect.promise(() => db.insert(accounts).values(testAccounts));
        yield* Effect.promise(() =>
          db.insert(userSeasonPoints).values(testSeasonPoints)
        );

        const leaderboardCacheService = yield* LeaderboardCacheService;
        yield* leaderboardCacheService.populateAll({ seasonId: SEASON_ID });

        const statsCache = yield* Effect.promise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(eq(leaderboardStatsCache.cacheKey, `season_${SEASON_ID}`))
        );

        expect(statsCache).toHaveLength(1);
        const stats = statsCache[0];

        expect(stats.totalUsers).toBe(3);

        // Verify precision is maintained (sorted: 123.456, 456.789, 789.012)
        expect(Number.parseFloat(stats.median!)).toBe(456.789); // Middle value

        // Expected average: (123.456 + 456.789 + 789.012) / 3 = 456.419
        expect(Number.parseFloat(stats.average!)).toBeCloseTo(456.419, 3);
      }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );

    it.effect("should calculate category statistics correctly", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        // Test category statistics calculation
        const testUsers: Array<{
          id: string;
          identityAddress: string;
          label: string;
        }> = [];
        const testAccounts: Array<{
          userId: string;
          address: string;
          label: string;
        }> = [];
        const testActivityPoints: Array<{
          accountAddress: string;
          weekId: string;
          activityId: string;
          activityPoints: string;
        }> = [];

        // Create users with category points: 50, 100, 150
        for (let i = 1; i <= 3; i++) {
          const userId = `0000000${i}-0000-0000-0000-000000000001`;
          const address = `account_cat${i}`;

          testUsers.push({
            id: userId,
            identityAddress: `identity_${userId}`,
            label: `CategoryUser${i}`,
          });
          testAccounts.push({
            userId,
            address,
            label: `Category Account ${i}`,
          });
          testActivityPoints.push({
            accountAddress: address,
            weekId: WEEK_ID,
            activityId: "c9_trade_xrd-xusdc",
            activityPoints: (i * 50).toString(),
          });
        }

        yield* Effect.promise(() => db.insert(users).values(testUsers));
        yield* Effect.promise(() => db.insert(accounts).values(testAccounts));
        yield* Effect.promise(() =>
          db.insert(accountActivityPoints).values(testActivityPoints)
        );

        const leaderboardCacheService = yield* LeaderboardCacheService;
        yield* leaderboardCacheService.populateAll({ weekId: WEEK_ID });

        // Verify category stats
        const categoryStatsCache = yield* Effect.promise(() =>
          db
            .select()
            .from(leaderboardStatsCache)
            .where(
              eq(
                leaderboardStatsCache.cacheKey,
                `category_${WEEK_ID}_tradingVolume`
              )
            )
        );

        expect(categoryStatsCache).toHaveLength(1);
        const categoryStats = categoryStatsCache[0];

        expect(categoryStats.totalUsers).toBe(3);
        expect(Number.parseFloat(categoryStats.median!)).toBe(100); // Middle of 50, 100, 150
        expect(Number.parseFloat(categoryStats.average!)).toBe(100); // (50 + 100 + 150) / 3
      }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );

    it.effect("should not create stats for empty datasets", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        const leaderboardCacheService = yield* LeaderboardCacheService;

        // Populate cache with no data
        yield* leaderboardCacheService.populateAll({ seasonId: SEASON_ID });

        // Should not create stats entries for empty datasets
        const statsCache = yield* Effect.promise(() =>
          db.select().from(leaderboardStatsCache)
        );
        expect(statsCache).toHaveLength(0);
      }).pipe(Effect.provide(leaderboardCacheServiceLive))
    );
  }
);
