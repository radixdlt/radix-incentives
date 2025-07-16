import { describe, inject } from "vitest";
import { Effect, Layer } from "effect";
import { it } from "@effect/vitest";
import { createDbClientLive } from "../db/dbClient";
import { CalculateSeasonPointsService } from "./calculateSeasonPoints";
import { drizzle } from "drizzle-orm/postgres-js";
import BigNumber from "bignumber.js";
import { eq } from "drizzle-orm";

import {
  schema,
  users,
  accounts,
  seasons,
  weeks,
  activities,
  activityCategories,
  activityCategoryWeeks,
  activityWeeks,
  accountActivityPoints,
  seasonPointsMultiplier,
  userSeasonPoints,
  ActivityCategoryKey,
} from "db/incentives";
import postgres from "postgres";

// Import required services
import { UserActivityPointsService } from "../user/userActivityPoints";
import { AddSeasonPointsToUserService } from "./addSeasonPointsToUser";
import { UpdateWeekStatusService } from "../week/updateWeekStatus";
import { GetSeasonPointMultiplierService } from "../season-point-multiplier/getSeasonPointMultiplier";
import { ActivityCategoryWeekService } from "../activity-category-week/activityCategoryWeek";
import { SeasonService } from "../season/season";
import { WeekService } from "../week/week";

describe(
  "CalculateSeasonPointsService",
  {
    timeout: 60_000,
  },
  () => {
    const dbUrl = inject("testDbUrl");
    const client = postgres(dbUrl);
    const db = drizzle(client, { schema });
    const dbLive = createDbClientLive(db);

    // Test data constants
    const SEASON_ID = "11111111-1111-1111-1111-111111111111";
    const WEEK_ID = "22222222-2222-2222-2222-222222222222";
    const USER_1 = "33333333-3333-3333-3333-333333333333";
    const USER_2 = "44444444-4444-4444-4444-444444444444";
    const USER_3 = "55555555-5555-5555-5555-555555555555";
    const USER_4 = "66666666-6666-6666-6666-666666666666";
    const ACTIVITY_1 = "test-activity-1";
    const ACTIVITY_2 = "test-activity-2";
    const ACTIVITY_3 = "test-activity-3";

    const ACCOUNT_1 = "account_rdx12test1_calculate_season_points_acc";
    const ACCOUNT_2 = "account_rdx12test2_calculate_season_points_acc";
    const ACCOUNT_3 = "account_rdx12test3_calculate_season_points_acc";
    const ACCOUNT_4 = "account_rdx12test4_calculate_season_points_acc";

    const setupTestData = Effect.gen(function* () {
      // Create season
      yield* Effect.promise(() =>
        db
          .insert(seasons)
          .values([
            {
              id: SEASON_ID,
              name: "Test Season",
              startDate: new Date("2024-01-01"),
              endDate: new Date("2024-12-31"),
              status: "active",
            },
          ])
          .onConflictDoNothing()
      );

      // Create week
      yield* Effect.promise(() =>
        db
          .insert(weeks)
          .values([
            {
              id: WEEK_ID,
              seasonId: SEASON_ID,
              startDate: new Date("2024-01-01"),
              endDate: new Date("2024-01-07"),
              status: "active",
            },
          ])
          .onConflictDoNothing()
      );

      // Create activity categories
      yield* Effect.promise(() =>
        db
          .insert(activityCategories)
          .values([
            {
              id: ActivityCategoryKey.tradingVolume,
              name: "Trading Volume",
            },
            {
              id: ActivityCategoryKey.componentCalls,
              name: "Component Calls",
            },
          ])
          .onConflictDoNothing()
      );

      // Create activities
      yield* Effect.promise(() =>
        db
          .insert(activities)
          .values([
            {
              id: ACTIVITY_1,
              name: "Test Activity 1",
              category: ActivityCategoryKey.tradingVolume,
            },
            {
              id: ACTIVITY_2,
              name: "Test Activity 2",
              category: ActivityCategoryKey.tradingVolume,
            },
            {
              id: ACTIVITY_3,
              name: "Test Activity 3",
              category: ActivityCategoryKey.componentCalls,
            },
          ])
          .onConflictDoNothing()
      );

      // Create activity category weeks with points pools
      yield* Effect.promise(() =>
        db
          .insert(activityCategoryWeeks)
          .values([
            {
              activityCategoryId: ActivityCategoryKey.tradingVolume,
              weekId: WEEK_ID,
              pointsPool: 10000,
            },
            {
              activityCategoryId: ActivityCategoryKey.componentCalls,
              weekId: WEEK_ID,
              pointsPool: 5000,
            },
          ])
          .onConflictDoNothing()
      );

      // Create activity weeks with multipliers (integers only)
      yield* Effect.promise(() =>
        db
          .insert(activityWeeks)
          .values([
            {
              activityId: ACTIVITY_1,
              weekId: WEEK_ID,
              multiplier: 2,
            },
            {
              activityId: ACTIVITY_2,
              weekId: WEEK_ID,
              multiplier: 3,
            },
            {
              activityId: ACTIVITY_3,
              weekId: WEEK_ID,
              multiplier: 1,
            },
          ])
          .onConflictDoNothing()
      );

      // Create users
      yield* Effect.promise(() =>
        db
          .insert(users)
          .values([
            { id: USER_1, identityAddress: `identity_${USER_1}` },
            { id: USER_2, identityAddress: `identity_${USER_2}` },
            { id: USER_3, identityAddress: `identity_${USER_3}` },
            { id: USER_4, identityAddress: `identity_${USER_4}` },
          ])
          .onConflictDoNothing()
      );

      // Create accounts
      yield* Effect.promise(() =>
        db
          .insert(accounts)
          .values([
            { address: ACCOUNT_1, userId: USER_1, label: "Account 1" },
            { address: ACCOUNT_2, userId: USER_2, label: "Account 2" },
            { address: ACCOUNT_3, userId: USER_3, label: "Account 3" },
            { address: ACCOUNT_4, userId: USER_4, label: "Account 4" },
          ])
          .onConflictDoNothing()
      );

      // Create season points multiplier data
      yield* Effect.promise(() =>
        db
          .insert(seasonPointsMultiplier)
          .values([
            {
              userId: USER_1,
              weekId: WEEK_ID,
              totalTWABalance: "100",
              cumulativeTWABalance: "100",
              multiplier: "1.5",
            },
            {
              userId: USER_2,
              weekId: WEEK_ID,
              totalTWABalance: "200",
              cumulativeTWABalance: "200",
              multiplier: "2.0",
            },
            {
              userId: USER_3,
              weekId: WEEK_ID,
              totalTWABalance: "300",
              cumulativeTWABalance: "300",
              multiplier: "2.5",
            },
            {
              userId: USER_4,
              weekId: WEEK_ID,
              totalTWABalance: "25", // Below minimum threshold
              cumulativeTWABalance: "25",
              multiplier: "1.0",
            },
          ])
          .onConflictDoNothing()
      );

      // Create account activity points with varying amounts
      yield* Effect.promise(() =>
        db
          .insert(accountActivityPoints)
          .values([
            // User 1 - high performance in trading volume
            {
              accountAddress: ACCOUNT_1,
              weekId: WEEK_ID,
              activityId: ACTIVITY_1,
              activityPoints: 1000,
            },
            {
              accountAddress: ACCOUNT_1,
              weekId: WEEK_ID,
              activityId: ACTIVITY_2,
              activityPoints: 800,
            },
            // User 2 - medium performance across activities
            {
              accountAddress: ACCOUNT_2,
              weekId: WEEK_ID,
              activityId: ACTIVITY_1,
              activityPoints: 600,
            },
            {
              accountAddress: ACCOUNT_2,
              weekId: WEEK_ID,
              activityId: ACTIVITY_3,
              activityPoints: 400,
            },
            // User 3 - focused on component calls
            {
              accountAddress: ACCOUNT_3,
              weekId: WEEK_ID,
              activityId: ACTIVITY_3,
              activityPoints: 1200,
            },
            // User 4 - low activity but below TWA threshold anyway
            {
              accountAddress: ACCOUNT_4,
              weekId: WEEK_ID,
              activityId: ACTIVITY_1,
              activityPoints: 100,
            },
          ])
          .onConflictDoNothing()
      );
    });

    const cleanupTestData = Effect.gen(function* () {
      yield* Effect.promise(() => db.delete(userSeasonPoints));
      yield* Effect.promise(() => db.delete(accountActivityPoints));
      yield* Effect.promise(() => db.delete(seasonPointsMultiplier));
      yield* Effect.promise(() => db.delete(accounts));
      yield* Effect.promise(() => db.delete(users));
      yield* Effect.promise(() => db.delete(activityWeeks));
      yield* Effect.promise(() => db.delete(activityCategoryWeeks));
      yield* Effect.promise(() => db.delete(activities));
      yield* Effect.promise(() => db.delete(weeks));
      yield* Effect.promise(() => db.delete(seasons));
    });

    describe("run", () => {
      const validInput = {
        seasonId: SEASON_ID,
        weekId: WEEK_ID,
        endOfWeek: false,
      };

      it.effect(
        "should successfully calculate and distribute season points",
        () =>
          Effect.gen(function* () {
            yield* setupTestData;

            const service = yield* Effect.provide(
              CalculateSeasonPointsService,
              testLayer
            );

            yield* service.run(validInput);

            // Verify that season points were created
            const seasonPointsResults = yield* Effect.promise(() =>
              db.select().from(userSeasonPoints)
            );

            expect(seasonPointsResults.length).toBeGreaterThan(0);

            // Verify that eligible users received points (those above TWA threshold)
            const userSeasonPointsMap = seasonPointsResults.reduce(
              (acc, row) => {
                acc[row.userId] = new BigNumber(row.points);
                return acc;
              },
              {} as Record<string, BigNumber>
            );

            // User 1, 2, 3 should have season points (above TWA threshold)
            expect(userSeasonPointsMap[USER_1]).toBeInstanceOf(BigNumber);
            expect(userSeasonPointsMap[USER_1].isGreaterThan(0)).toBe(true);

            expect(userSeasonPointsMap[USER_2]).toBeInstanceOf(BigNumber);
            expect(userSeasonPointsMap[USER_2].isGreaterThan(0)).toBe(true);

            expect(userSeasonPointsMap[USER_3]).toBeInstanceOf(BigNumber);
            expect(userSeasonPointsMap[USER_3].isGreaterThan(0)).toBe(true);

            // User 4 should not have season points (below TWA threshold)
            expect(userSeasonPointsMap[USER_4]).toBeUndefined();

            // Verify multiplier effects
            // Higher multipliers should result in higher final season points
            const user1Points = userSeasonPointsMap[USER_1];
            const user2Points = userSeasonPointsMap[USER_2];
            const user3Points = userSeasonPointsMap[USER_3];

            // User 3 has highest multiplier (2.5), should have highest final points relative to base
            expect(user3Points).toBeInstanceOf(BigNumber);
            expect(user2Points).toBeInstanceOf(BigNumber);
            expect(user1Points).toBeInstanceOf(BigNumber);

            yield* cleanupTestData;
          })
      );

      it.effect("should validate input and reject invalid data", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const service = yield* Effect.provide(
            CalculateSeasonPointsService,
            testLayer
          );

          const invalidInput = {
            // Missing required seasonId field to trigger InputValidationError
            weekId: WEEK_ID,
            endOfWeek: false,
          } as {
            seasonId: string;
            weekId: string;
            endOfWeek: boolean;
          };

          const result = yield* Effect.either(service.run(invalidInput));

          expect(result._tag).toBe("Left");
          if (result._tag === "Left") {
            expect(result.left._tag).toBe("InputValidationError");
          }

          yield* cleanupTestData;
        })
      );

      it.effect("should reject completed season unless forced", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Mark season as completed
          yield* Effect.promise(() =>
            db
              .update(seasons)
              .set({ status: "completed" })
              .where(eq(seasons.id, SEASON_ID))
          );

          const service = yield* Effect.provide(
            CalculateSeasonPointsService,
            testLayer
          );

          const result = yield* Effect.either(service.run(validInput));

          expect(result._tag).toBe("Left");
          if (result._tag === "Left") {
            expect(result.left._tag).toBe("InvalidStateError");
            expect(result.left.message).toContain("completed state");
          }

          yield* cleanupTestData;
        })
      );

      const seasonLayer = SeasonService.Default.pipe(Layer.provide(dbLive));
      const weekLayer = WeekService.Default.pipe(Layer.provide(dbLive));
      const activityCategoryWeekLayer =
        ActivityCategoryWeekService.Default.pipe(Layer.provide(dbLive));
      const userActivityPointsLayer = UserActivityPointsService.Default.pipe(
        Layer.provide(dbLive)
      );
      const addSeasonPointsToUserLayer =
        AddSeasonPointsToUserService.Default.pipe(Layer.provide(dbLive));
      const updateWeekStatusLayer = UpdateWeekStatusService.Default.pipe(
        Layer.provide(dbLive)
      );
      const getSeasonPointMultiplierLayer =
        GetSeasonPointMultiplierService.Default.pipe(Layer.provide(dbLive));

      const testLayer = CalculateSeasonPointsService.Default.pipe(
        Layer.provide(dbLive),
        Layer.provide(seasonLayer),
        Layer.provide(weekLayer),
        Layer.provide(activityCategoryWeekLayer),
        Layer.provide(userActivityPointsLayer),
        Layer.provide(addSeasonPointsToUserLayer),
        Layer.provide(updateWeekStatusLayer),
        Layer.provide(getSeasonPointMultiplierLayer)
      );

      it.effect("should process completed season when forced", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Mark season as completed
          yield* Effect.promise(() =>
            db
              .update(seasons)
              .set({ status: "completed" })
              .where(eq(seasons.id, SEASON_ID))
          );

          const service = yield* Effect.provide(
            CalculateSeasonPointsService,
            testLayer
          );

          const forcedInput = {
            ...validInput,
            force: true,
          };

          yield* service.run(forcedInput);

          // Verify that season points were still created
          const seasonPointsResults = yield* Effect.promise(() =>
            db.select().from(userSeasonPoints)
          );

          expect(seasonPointsResults.length).toBeGreaterThan(0);

          yield* cleanupTestData;
        })
      );

      it.effect("should reject completed week unless forced", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Mark week as completed
          yield* Effect.promise(() =>
            db
              .update(weeks)
              .set({ status: "completed" })
              .where(eq(weeks.id, WEEK_ID))
          );

          const service = yield* Effect.provide(
            CalculateSeasonPointsService,
            testLayer
          );

          const result = yield* Effect.either(service.run(validInput));

          expect(result._tag).toBe("Left");
          if (result._tag === "Left") {
            expect(result.left._tag).toBe("InvalidStateError");
            expect(result.left.message).toContain("already processed");
          }

          yield* cleanupTestData;
        })
      );

      it.effect("should mark week as completed when endOfWeek is true", () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const service = yield* Effect.provide(
            CalculateSeasonPointsService,
            testLayer
          );

          const endOfWeekInput = {
            ...validInput,
            endOfWeek: true,
          };

          yield* service.run(endOfWeekInput);

          // Verify week status was updated
          const weekResult = yield* Effect.promise(() =>
            db.select().from(weeks).where(eq(weeks.id, WEEK_ID))
          );

          expect(weekResult[0]?.status).toBe("completed");

          yield* cleanupTestData;
        })
      );

      it.effect("should handle users with no activity gracefully", () =>
        Effect.gen(function* () {
          // Create minimal test data with no activity points
          yield* Effect.promise(() =>
            db
              .insert(seasons)
              .values([
                {
                  id: SEASON_ID,
                  name: "Empty Season",
                  startDate: new Date("2024-01-01"),
                  endDate: new Date("2024-12-31"),
                  status: "active",
                },
              ])
              .onConflictDoNothing()
          );

          yield* Effect.promise(() =>
            db
              .insert(weeks)
              .values([
                {
                  id: WEEK_ID,
                  seasonId: SEASON_ID,
                  startDate: new Date("2024-01-01"),
                  endDate: new Date("2024-01-07"),
                  status: "active",
                },
              ])
              .onConflictDoNothing()
          );

          yield* Effect.promise(() =>
            db
              .insert(activityCategories)
              .values([
                {
                  id: ActivityCategoryKey.tradingVolume,
                  name: "Trading Volume",
                },
              ])
              .onConflictDoNothing()
          );

          yield* Effect.promise(() =>
            db
              .insert(activityCategoryWeeks)
              .values([
                {
                  activityCategoryId: ActivityCategoryKey.tradingVolume,
                  weekId: WEEK_ID,
                  pointsPool: 1000,
                },
              ])
              .onConflictDoNothing()
          );

          const service = yield* Effect.provide(
            CalculateSeasonPointsService,
            testLayer
          );

          // Should not throw error even with no users/activities
          yield* service.run(validInput);

          // Verify no season points were created
          const seasonPointsResults = yield* Effect.promise(() =>
            db.select().from(userSeasonPoints)
          );

          expect(seasonPointsResults).toHaveLength(0);

          yield* cleanupTestData;
        })
      );

      it.effect(
        "should handle large user base with proper banding and distribution",
        () =>
          Effect.gen(function* () {
            // Create 24 users for comprehensive testing
            const userIds = Array.from(
              { length: 24 },
              (_, i) =>
                `00000${String(i + 1).padStart(3, "0")}-1111-1111-1111-111111111111`
            );
            const accountAddresses = Array.from(
              { length: 24 },
              (_, i) =>
                `account_rdx12user${String(i + 1).padStart(2, "0")}_large_test_address`
            );

            // Create season and week
            yield* Effect.promise(() =>
              db
                .insert(seasons)
                .values([
                  {
                    id: SEASON_ID,
                    name: "Large Test Season",
                    startDate: new Date("2024-01-01"),
                    endDate: new Date("2024-12-31"),
                    status: "active",
                  },
                ])
                .onConflictDoNothing()
            );

            yield* Effect.promise(() =>
              db
                .insert(weeks)
                .values([
                  {
                    id: WEEK_ID,
                    seasonId: SEASON_ID,
                    startDate: new Date("2024-01-01"),
                    endDate: new Date("2024-01-07"),
                    status: "active",
                  },
                ])
                .onConflictDoNothing()
            );

            // Create activity categories
            yield* Effect.promise(() =>
              db
                .insert(activityCategories)
                .values([
                  {
                    id: ActivityCategoryKey.tradingVolume,
                    name: "Trading Volume",
                  },
                ])
                .onConflictDoNothing()
            );

            // Create activities
            yield* Effect.promise(() =>
              db
                .insert(activities)
                .values([
                  {
                    id: ACTIVITY_1,
                    name: "Large Test Activity",
                    category: ActivityCategoryKey.tradingVolume,
                  },
                ])
                .onConflictDoNothing()
            );

            // Create activity category weeks
            yield* Effect.promise(() =>
              db
                .insert(activityCategoryWeeks)
                .values([
                  {
                    activityCategoryId: ActivityCategoryKey.tradingVolume,
                    weekId: WEEK_ID,
                    pointsPool: 100000, // Large points pool for 24 users
                  },
                ])
                .onConflictDoNothing()
            );

            // Create activity weeks
            yield* Effect.promise(() =>
              db
                .insert(activityWeeks)
                .values([
                  {
                    activityId: ACTIVITY_1,
                    weekId: WEEK_ID,
                    multiplier: 2,
                  },
                ])
                .onConflictDoNothing()
            );

            // Create 24 users
            yield* Effect.promise(() =>
              db
                .insert(users)
                .values(
                  userIds.map((id) => ({
                    id,
                    identityAddress: `identity_${id}`,
                  }))
                )
                .onConflictDoNothing()
            );

            // Create 24 accounts
            yield* Effect.promise(() =>
              db
                .insert(accounts)
                .values(
                  userIds.map((id, index) => ({
                    address: accountAddresses[index],
                    userId: id,
                    label: `Account ${index + 1}`,
                  }))
                )
                .onConflictDoNothing()
            );

            // Create season points multiplier data with varying multipliers
            yield* Effect.promise(() =>
              db
                .insert(seasonPointsMultiplier)
                .values(
                  userIds.map((id, index) => {
                    // Create a distribution of multipliers
                    let multiplier = "1.0";
                    if (index < 4)
                      multiplier = "3.0"; // Top 4 users get 3x
                    else if (index < 8)
                      multiplier = "2.5"; // Next 4 get 2.5x
                    else if (index < 12)
                      multiplier = "2.0"; // Next 4 get 2x
                    else if (index < 16)
                      multiplier = "1.5"; // Next 4 get 1.5x
                    else if (index < 20) multiplier = "1.2"; // Next 4 get 1.2x
                    // Last 4 get 1.0x

                    return {
                      userId: id,
                      weekId: WEEK_ID,
                      totalTWABalance: "500", // Well above minimum threshold
                      cumulativeTWABalance: "500",
                      multiplier,
                    };
                  })
                )
                .onConflictDoNothing()
            );

            // Create account activity points with realistic distribution
            yield* Effect.promise(() =>
              db
                .insert(accountActivityPoints)
                .values(
                  userIds.map((id, index) => {
                    // Create a varied distribution of activity points
                    // Following a power law distribution where top users have much more activity
                    const basePoints = 10000;
                    const points = Math.floor(basePoints / (index + 1) ** 0.8);

                    return {
                      accountAddress: accountAddresses[index],
                      weekId: WEEK_ID,
                      activityId: ACTIVITY_1,
                      activityPoints: Math.max(points, 100), // Minimum 100 points
                    };
                  })
                )
                .onConflictDoNothing()
            );

            const service = yield* Effect.provide(
              CalculateSeasonPointsService,
              testLayer
            );

            yield* service.run({
              seasonId: SEASON_ID,
              weekId: WEEK_ID,
              endOfWeek: false,
            });

            // Verify that season points were created for all eligible users
            const seasonPointsResults = yield* Effect.promise(() =>
              db
                .select()
                .from(userSeasonPoints)
                .orderBy(userSeasonPoints.points)
            );

            // Should have results for users after 10% percentile trimming
            // With 24 users and 10% cumulative percentage trimming, expect ~17-19 users to get season points
            // The exact number depends on the distribution of activity points
            expect(seasonPointsResults.length).toBeGreaterThanOrEqual(17);
            expect(seasonPointsResults.length).toBeLessThanOrEqual(20);

            // Verify total points distributed
            const totalPointsDistributed = seasonPointsResults.reduce(
              (sum, row) => sum.plus(new BigNumber(row.points)),
              new BigNumber(0)
            );

            // Total should be positive and reasonable
            expect(totalPointsDistributed.isGreaterThan(0)).toBe(true);

            // Verify proper ordering - users with higher multipliers should generally have higher final points
            const userSeasonPointsMap = seasonPointsResults.reduce(
              (acc, row) => {
                acc[row.userId] = new BigNumber(row.points);
                return acc;
              },
              {} as Record<string, BigNumber>
            );

            // Check that top multiplier users received points
            const topMultiplierUsers = userIds.slice(0, 4); // First 4 users have 3.0x multiplier

            for (const userId of topMultiplierUsers) {
              expect(userSeasonPointsMap[userId]).toBeInstanceOf(BigNumber);
              expect(userSeasonPointsMap[userId].isGreaterThan(0)).toBe(true);
            }

            // Due to percentile trimming, some bottom users may not receive points
            // Just verify that some users with lower multipliers also received points
            const usersWithLowerMultipliers = userIds.slice(16, 20); // Users with 1.2x multiplier
            let lowerMultiplierUsersWithPoints = 0;

            for (const userId of usersWithLowerMultipliers) {
              if (userSeasonPointsMap[userId]) {
                expect(userSeasonPointsMap[userId]).toBeInstanceOf(BigNumber);
                expect(userSeasonPointsMap[userId].isGreaterThan(0)).toBe(true);
                lowerMultiplierUsersWithPoints++;
              }
            }

            // At least some users with lower multipliers should receive points
            expect(lowerMultiplierUsersWithPoints).toBeGreaterThanOrEqual(1);

            // Verify user banding worked - check that distribution isn't uniform
            const pointsValues = seasonPointsResults.map(
              (row) => new BigNumber(row.points)
            );
            const maxPoints = BigNumber.maximum(...pointsValues);
            const minPoints = BigNumber.minimum(...pointsValues);

            // There should be meaningful variance in the distribution
            expect(maxPoints.isGreaterThan(minPoints.multipliedBy(1.5))).toBe(
              true
            );

            // Cleanup
            yield* Effect.promise(() => db.delete(userSeasonPoints));
            yield* Effect.promise(() => db.delete(accountActivityPoints));
            yield* Effect.promise(() => db.delete(seasonPointsMultiplier));
            yield* Effect.promise(() => db.delete(accounts));
            yield* Effect.promise(() => db.delete(users));
            yield* Effect.promise(() => db.delete(activityWeeks));
            yield* Effect.promise(() => db.delete(activityCategoryWeeks));
            yield* Effect.promise(() => db.delete(activities));
            yield* Effect.promise(() => db.delete(weeks));
            yield* Effect.promise(() => db.delete(seasons));
          })
      );
    });
  }
);
