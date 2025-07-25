import { describe, inject } from "vitest";
import { Effect, Layer, Logger, LogLevel } from "effect";
import { it } from "@effect/vitest";
import { createDbClientLive } from "../db/dbClient";
import { LeaderboardCacheService } from "./leaderboardCache";
import { LeaderboardService } from "./leaderboard";
import { drizzle } from "drizzle-orm/postgres-js";

import {
  schema,
  seasons,
  weeks,
  users,
  accounts,
  userSeasonPoints,
  accountActivityPoints,
} from "db/incentives";

import postgres from "postgres";

describe(
  "Leaderboard Integration Tests",
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
    const leaderboardServiceLive = LeaderboardService.Default.pipe(
      Layer.provide(dbLive),
      Layer.provide(Logger.minimumLogLevel(LogLevel.None))
    );

    // Test data constants
    const SEASON_ID = "11111111-1111-1111-1111-111111111111";
    const WEEK_ID = "33333333-3333-3333-3333-333333333333";
    const USER_ID_1 = "55555555-5555-5555-5555-555555555555";
    const USER_ID_2 = "66666666-6666-6666-6666-666666666666";

    const setupTestData = Effect.gen(function* () {
      // Clean up all tables
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
            {
              id: SEASON_ID,
              name: "Integration Test Season",
              status: "active",
            },
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

      yield* Effect.promise(() =>
        db.insert(users).values([
          {
            id: USER_ID_1,
            identityAddress: `identity_${USER_ID_1}`,
            label: "Player1",
          },
          {
            id: USER_ID_2,
            identityAddress: `identity_${USER_ID_2}`,
            label: "Player2",
          },
        ])
      );

      yield* Effect.promise(() =>
        db.insert(accounts).values([
          { userId: USER_ID_1, address: "account_rdx1111", label: "Account 1" },
          { userId: USER_ID_2, address: "account_rdx2222", label: "Account 2" },
        ])
      );
    });

    it.effect("should complete full cache-to-read workflow", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        // Step 1: Insert raw data
        yield* Effect.promise(() =>
          db.insert(userSeasonPoints).values([
            {
              userId: USER_ID_1,
              seasonId: SEASON_ID,
              weekId: WEEK_ID,
              points: "500.25",
            },
            {
              userId: USER_ID_2,
              seasonId: SEASON_ID,
              weekId: WEEK_ID,
              points: "750.75",
            },
          ])
        );

        yield* Effect.promise(() =>
          db.insert(accountActivityPoints).values([
            {
              accountAddress: "account_rdx1111",
              weekId: WEEK_ID,
              activityId: "c9_trade_xrd-xusdc",
              activityPoints: "200.0",
            },
            {
              accountAddress: "account_rdx2222",
              weekId: WEEK_ID,
              activityId: "c9_trade_xrd-xusdc",
              activityPoints: "300.0",
            },
          ])
        );

        // Step 2: Populate cache
        const cacheService = yield* LeaderboardCacheService;
        yield* cacheService.populateAll({
          seasonId: SEASON_ID,
          weekId: WEEK_ID,
        });

        // Step 3: Read from cache via service
        const leaderboardService = yield* LeaderboardService;

        // Test season leaderboard
        const seasonResult = yield* leaderboardService.getSeasonLeaderboard({
          seasonId: SEASON_ID,
          userId: USER_ID_1,
        });

        expect(seasonResult.topUsers).toHaveLength(2);
        expect(seasonResult.topUsers[0].userId).toBe(USER_ID_2); // Higher points
        expect(seasonResult.topUsers[0].totalPoints).toBe("750.750000");
        expect(seasonResult.topUsers[1].userId).toBe(USER_ID_1);
        expect(seasonResult.topUsers[1].totalPoints).toBe("500.250000");

        expect(seasonResult.userStats).toEqual({
          rank: 2,
          totalPoints: "500.250000",
          percentile: 50, // (1 - (2-1)/2) * 100 = 50th percentile
        });

        // Test category leaderboard
        const categoryResult =
          yield* leaderboardService.getActivityCategoryLeaderboard({
            categoryId: "tradingVolume",
            weekId: WEEK_ID,
            userId: USER_ID_2,
          });

        expect(categoryResult.topUsers).toHaveLength(2);
        expect(categoryResult.topUsers[0].userId).toBe(USER_ID_2); // Higher points
        expect(categoryResult.topUsers[0].totalPoints).toBe("300.000000");

        expect(categoryResult.userStats).toEqual({
          rank: 1,
          totalPoints: "300.000000",
          percentile: 100, // Top user
          activityBreakdown: [
            {
              activityId: "c9_trade_xrd-xusdc",
              activityName: "c9_trade_xrd-xusdc",
              points: "300",
            },
          ],
        });
      }).pipe(
        Effect.provide(leaderboardCacheServiceLive),
        Effect.provide(leaderboardServiceLive)
      )
    );

    it.effect("should handle cache miss scenarios", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        const leaderboardService = yield* LeaderboardService;

        // Try to read from empty cache - should fail gracefully
        const seasonResult = yield* Effect.either(
          leaderboardService.getSeasonLeaderboard({
            seasonId: SEASON_ID,
          })
        );

        expect(seasonResult._tag).toBe("Left");
        if (seasonResult._tag === "Left") {
          expect(seasonResult.left.message).toContain("cache is being built");
        }

        const categoryResult = yield* Effect.either(
          leaderboardService.getActivityCategoryLeaderboard({
            categoryId: "tradingVolume",
            weekId: WEEK_ID,
          })
        );

        expect(categoryResult._tag).toBe("Left");
        if (categoryResult._tag === "Left") {
          expect(categoryResult.left.message).toContain("cache is being built");
        }
      }).pipe(
        Effect.provide(leaderboardCacheServiceLive),
        Effect.provide(leaderboardServiceLive)
      )
    );

    it.effect("should maintain data consistency after cache rebuild", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        // Initial data
        yield* Effect.promise(() =>
          db
            .insert(userSeasonPoints)
            .values([
              {
                userId: USER_ID_1,
                seasonId: SEASON_ID,
                weekId: WEEK_ID,
                points: "100.0",
              },
            ])
        );

        const cacheService = yield* LeaderboardCacheService;
        const leaderboardService = yield* LeaderboardService;

        // First cache build
        yield* cacheService.populateAll({ seasonId: SEASON_ID });

        let result = yield* leaderboardService.getSeasonLeaderboard({
          seasonId: SEASON_ID,
        });

        expect(result.topUsers).toHaveLength(1);
        expect(result.topUsers[0].totalPoints).toBe("100.000000");

        // Add more data
        yield* Effect.promise(() =>
          db
            .insert(userSeasonPoints)
            .values([
              {
                userId: USER_ID_2,
                seasonId: SEASON_ID,
                weekId: WEEK_ID,
                points: "200.0",
              },
            ])
        );

        // Rebuild cache
        yield* cacheService.populateAll({ seasonId: SEASON_ID });

        // Verify updated results
        result = yield* leaderboardService.getSeasonLeaderboard({
          seasonId: SEASON_ID,
        });

        expect(result.topUsers).toHaveLength(2);
        expect(result.topUsers[0].userId).toBe(USER_ID_2); // Should be first now
        expect(result.topUsers[0].totalPoints).toBe("200.000000");
        expect(result.topUsers[1].userId).toBe(USER_ID_1);
        expect(result.topUsers[1].totalPoints).toBe("100.000000");

        // Verify stats were updated
        expect(result.globalStats.totalUsers).toBe(2);
      }).pipe(
        Effect.provide(leaderboardCacheServiceLive),
        Effect.provide(leaderboardServiceLive)
      )
    );

    it.effect("should handle concurrent cache operations gracefully", () =>
      Effect.gen(function* () {
        yield* setupTestData;

        // Insert data for multiple seasons/weeks
        const SEASON_ID_2 = "22222222-2222-2222-2222-222222222222";
        const WEEK_ID_2 = "44444444-4444-4444-4444-444444444444";

        yield* Effect.promise(() =>
          db
            .insert(seasons)
            .values([
              { id: SEASON_ID_2, name: "Season 2", status: "completed" },
            ])
        );

        yield* Effect.promise(() =>
          db.insert(weeks).values([
            {
              id: WEEK_ID_2,
              seasonId: SEASON_ID_2,
              startDate: new Date("2025-01-08"),
              endDate: new Date("2025-01-14"),
            },
          ])
        );

        yield* Effect.promise(() =>
          db.insert(userSeasonPoints).values([
            {
              userId: USER_ID_1,
              seasonId: SEASON_ID,
              weekId: WEEK_ID,
              points: "100.0",
            },
            {
              userId: USER_ID_1,
              seasonId: SEASON_ID_2,
              weekId: WEEK_ID_2,
              points: "200.0",
            },
          ])
        );

        yield* Effect.promise(() =>
          db.insert(accountActivityPoints).values([
            {
              accountAddress: "account_rdx1111",
              weekId: WEEK_ID,
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

        const cacheService = yield* LeaderboardCacheService;
        const leaderboardService = yield* LeaderboardService;

        // Populate caches for specific seasons/weeks
        yield* Effect.all([
          cacheService.populateAll({ seasonId: SEASON_ID }),
          cacheService.populateAll({ seasonId: SEASON_ID_2 }),
          cacheService.populateAll({ weekId: WEEK_ID }),
          cacheService.populateAll({ weekId: WEEK_ID_2 }),
        ]);

        // Verify both caches work independently
        const season1Result = yield* leaderboardService.getSeasonLeaderboard({
          seasonId: SEASON_ID,
        });
        expect(season1Result.topUsers[0].totalPoints).toBe("100.000000");

        const season2Result = yield* leaderboardService.getSeasonLeaderboard({
          seasonId: SEASON_ID_2,
        });
        expect(season2Result.topUsers[0].totalPoints).toBe("200.000000");

        const week1CategoryResult =
          yield* leaderboardService.getActivityCategoryLeaderboard({
            categoryId: "tradingVolume",
            weekId: WEEK_ID,
          });
        expect(week1CategoryResult.topUsers[0].totalPoints).toBe("50.000000");

        const week2CategoryResult =
          yield* leaderboardService.getActivityCategoryLeaderboard({
            categoryId: "tradingVolume",
            weekId: WEEK_ID_2,
          });
        expect(week2CategoryResult.topUsers[0].totalPoints).toBe("75.000000");
      }).pipe(
        Effect.provide(leaderboardCacheServiceLive),
        Effect.provide(leaderboardServiceLive)
      )
    );
  }
);
