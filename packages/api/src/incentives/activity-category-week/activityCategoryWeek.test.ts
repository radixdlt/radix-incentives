import { describe, inject } from "vitest";
import { Effect } from "effect";
import { it } from "@effect/vitest";
import BigNumber from "bignumber.js";
import { ActivityCategoryWeekService } from "./activityCategoryWeek";
import { distributeWeightedPoints } from "./distributeWeightedPoints";
import { createDbClientLive } from "../db/dbClient";
import {
  schema,
  activityCategoryWeeks,
  activityWeeks,
  activityCategories,
  activities,
  weeks,
  seasons,
} from "db/incentives";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { ActivityCategoryId } from "data";

describe("ActivityCategoryWeekService", () => {
  const dbUrl = inject("testDbUrl");
  const client = postgres(dbUrl);
  const db = drizzle(client, { schema });
  const dbLive = createDbClientLive(db);

  describe("getByWeekId", () => {
    it.effect(
      "should return category data with activities and calculate distributed points correctly",
      () =>
        Effect.gen(function* () {
          // Create a test season
          const seasonInsertResult = yield* Effect.promise(() =>
            db
              .insert(seasons)
              .values({
                name: "Test Season",
                status: "active",
              })
              .returning({ id: seasons.id })
          );
          const testSeasonId = seasonInsertResult[0]?.id;
          if (!testSeasonId) {
            throw new Error("Failed to create test season");
          }

          // Create a test week
          const weekInsertResult = yield* Effect.promise(() =>
            db
              .insert(weeks)
              .values({
                seasonId: testSeasonId,
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-01-07"),
              })
              .returning({ id: weeks.id })
          );
          const testWeekId = weekInsertResult[0]?.id;
          if (!testWeekId) {
            throw new Error("Failed to create test week");
          }

          // Create activity categories
          yield* Effect.promise(() =>
            db
              .insert(activityCategories)
              .values([
                {
                  id: ActivityCategoryId.tradingVolume,
                  name: "Trading Volume",
                },
                {
                  id: ActivityCategoryId.lendingStables,
                  name: "Lending Stables",
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
                  id: "test-activity-1",
                  name: "Test Activity 1",
                  category: ActivityCategoryId.tradingVolume,
                },
                {
                  id: "test-activity-2",
                  name: "Test Activity 2",
                  category: ActivityCategoryId.tradingVolume,
                },
                {
                  id: "test-activity-3",
                  name: "Test Activity 3",
                  category: ActivityCategoryId.lendingStables,
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
                  activityCategoryId: ActivityCategoryId.tradingVolume,
                  weekId: testWeekId,
                  pointsPool: 1000,
                },
                {
                  activityCategoryId: ActivityCategoryId.lendingStables,
                  weekId: testWeekId,
                  pointsPool: 2000,
                },
              ])
              .onConflictDoNothing()
          );

          // Create activity weeks with multipliers
          yield* Effect.promise(() =>
            db
              .insert(activityWeeks)
              .values([
                {
                  activityId: "test-activity-1",
                  weekId: testWeekId,
                  multiplier: "2",
                },
                {
                  activityId: "test-activity-2",
                  weekId: testWeekId,
                  multiplier: "3",
                },
                {
                  activityId: "test-activity-3",
                  weekId: testWeekId,
                  multiplier: "1",
                },
              ])
              .onConflictDoNothing()
          );

          // Use the service to get results
          const service = yield* ActivityCategoryWeekService;
          const categoryResults = yield* service.getByWeekId({
            weekId: testWeekId,
          });

          // Verify we get exactly 2 categories
          expect(categoryResults).toHaveLength(2);

          // Verify all results have proper structure
          for (const category of categoryResults) {
            expect(category).toHaveProperty("categoryId");
            expect(category).toHaveProperty("activities");
            expect(category).toHaveProperty("pointsPool");
            expect(category.pointsPool).toBeInstanceOf(BigNumber);
            expect(Array.isArray(category.activities)).toBe(true);
            expect(category.pointsPool.isGreaterThan(0)).toBe(true);
          }

          // Find specific categories
          const tradingVolumeCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.tradingVolume
          );
          const lendingStablesCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.lendingStables
          );

          expect(tradingVolumeCategory).toBeDefined();
          expect(lendingStablesCategory).toBeDefined();

          if (!tradingVolumeCategory || !lendingStablesCategory) {
            throw new Error("Failed to find required categories");
          }

          // Verify trading volume category
          expect(tradingVolumeCategory.activities).toHaveLength(2);
          expect(
            tradingVolumeCategory.pointsPool.isEqualTo(new BigNumber(1000))
          ).toBe(true);

          // Verify lending stables category
          expect(lendingStablesCategory.activities).toHaveLength(1);
          expect(
            lendingStablesCategory.pointsPool.isEqualTo(new BigNumber(2000))
          ).toBe(true);

          // Test point distribution for trading volume category
          const tradingVolumeDistribution = yield* distributeWeightedPoints({
            pointsPool: tradingVolumeCategory.pointsPool,
            items: tradingVolumeCategory.activities.map((a) => ({
              id: a.id,
              multiplier: a.multiplier,
            })),
          });

          expect(tradingVolumeDistribution).toHaveLength(2);

          const activity1Distribution = tradingVolumeDistribution.find(
            (d) => d.id === "test-activity-1"
          );
          const activity2Distribution = tradingVolumeDistribution.find(
            (d) => d.id === "test-activity-2"
          );

          expect(
            activity1Distribution?.points.isEqualTo(new BigNumber(400))
          ).toBe(true); // 1000 * 2/5
          expect(
            activity2Distribution?.points.isEqualTo(new BigNumber(600))
          ).toBe(true); // 1000 * 3/5

          // Test point distribution for lending stables category
          const lendingStablesDistribution = yield* distributeWeightedPoints({
            pointsPool: lendingStablesCategory.pointsPool,
            items: lendingStablesCategory.activities.map((a) => ({
              id: a.id,
              multiplier: a.multiplier,
            })),
          });

          expect(lendingStablesDistribution).toHaveLength(1);

          const activity3Distribution = lendingStablesDistribution.find(
            (d) => d.id === "test-activity-3"
          );
          expect(
            activity3Distribution?.points.isEqualTo(new BigNumber(2000))
          ).toBe(true); // 2000 * 1/1

          // Clean up test data
          yield* Effect.promise(() =>
            db.delete(activityWeeks).where(eq(activityWeeks.weekId, testWeekId))
          );
          yield* Effect.promise(() =>
            db
              .delete(activityCategoryWeeks)
              .where(eq(activityCategoryWeeks.weekId, testWeekId))
          );
          yield* Effect.promise(() =>
            db.delete(weeks).where(eq(weeks.id, testWeekId))
          );
          yield* Effect.promise(() =>
            db.delete(seasons).where(eq(seasons.id, testSeasonId))
          );
        }).pipe(
          Effect.provide(ActivityCategoryWeekService.Default),
          Effect.provide(dbLive)
        )
    );

    it.effect(
      "should exclude categories with zero points pool even if they have activities",
      () =>
        Effect.gen(function* () {
          // Create a test season
          const seasonInsertResult = yield* Effect.promise(() =>
            db
              .insert(seasons)
              .values({
                name: "Test Season Zero Pool",
              })
              .returning({ id: seasons.id })
          );
          const testSeasonId = seasonInsertResult[0]?.id;
          if (!testSeasonId) {
            throw new Error("Failed to create test season");
          }

          // Create a test week
          const weekInsertResult = yield* Effect.promise(() =>
            db
              .insert(weeks)
              .values({
                seasonId: testSeasonId,
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-01-07"),
              })
              .returning({ id: weeks.id })
          );
          const testWeekId = weekInsertResult[0]?.id;
          if (!testWeekId) {
            throw new Error("Failed to create test week");
          }

          // Create activity categories
          yield* Effect.promise(() =>
            db
              .insert(activityCategories)
              .values([
                {
                  id: ActivityCategoryId.tradingVolume,
                  name: "Trading Volume",
                },
                {
                  id: ActivityCategoryId.lendingStables,
                  name: "Lending Stables",
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
                  id: "test-activity-with-points",
                  name: "Test Activity With Points",
                  category: ActivityCategoryId.tradingVolume,
                },
                {
                  id: "test-activity-zero-pool-1",
                  name: "Test Activity Zero Pool 1",
                  category: ActivityCategoryId.lendingStables,
                },
                {
                  id: "test-activity-zero-pool-2",
                  name: "Test Activity Zero Pool 2",
                  category: ActivityCategoryId.lendingStables,
                },
              ])
              .onConflictDoNothing()
          );

          // Create activity category weeks - one with points, one with zero points
          yield* Effect.promise(() =>
            db
              .insert(activityCategoryWeeks)
              .values([
                {
                  activityCategoryId: ActivityCategoryId.tradingVolume,
                  weekId: testWeekId,
                  pointsPool: 1000, // This category has points
                },
                {
                  activityCategoryId: ActivityCategoryId.lendingStables,
                  weekId: testWeekId,
                  pointsPool: 0, // This category has zero points
                },
              ])
              .onConflictDoNothing()
          );

          // Create activity weeks for all activities (including those in zero-pool category)
          yield* Effect.promise(() =>
            db
              .insert(activityWeeks)
              .values([
                {
                  activityId: "test-activity-with-points",
                  weekId: testWeekId,
                  multiplier: "1",
                },
                {
                  activityId: "test-activity-zero-pool-1",
                  weekId: testWeekId,
                  multiplier: "2",
                },
                {
                  activityId: "test-activity-zero-pool-2",
                  weekId: testWeekId,
                  multiplier: "3",
                },
              ])
              .onConflictDoNothing()
          );

          // Use the service to get results
          const service = yield* ActivityCategoryWeekService;
          const categoryResults = yield* service.getByWeekId({
            weekId: testWeekId,
          });

          // Should only return 1 category (the one with points > 0)
          expect(categoryResults).toHaveLength(1);

          // Verify the returned category is the one with points
          const tradingVolumeCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.tradingVolume
          );
          const lendingStablesCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.lendingStables
          );

          expect(tradingVolumeCategory).toBeDefined();
          expect(lendingStablesCategory).toBeUndefined(); // Should be excluded due to zero points

          if (!tradingVolumeCategory) {
            throw new Error("Trading volume category should be present");
          }

          // Verify the category with points has correct data
          expect(tradingVolumeCategory.activities).toHaveLength(1);
          expect(
            tradingVolumeCategory.pointsPool.isEqualTo(new BigNumber(1000))
          ).toBe(true);
          expect(tradingVolumeCategory.activities[0]?.id).toBe(
            "test-activity-with-points"
          );

          // Clean up test data
          yield* Effect.promise(() =>
            db.delete(activityWeeks).where(eq(activityWeeks.weekId, testWeekId))
          );
          yield* Effect.promise(() =>
            db
              .delete(activityCategoryWeeks)
              .where(eq(activityCategoryWeeks.weekId, testWeekId))
          );
          yield* Effect.promise(() =>
            db.delete(weeks).where(eq(weeks.id, testWeekId))
          );
          yield* Effect.promise(() =>
            db.delete(seasons).where(eq(seasons.id, testSeasonId))
          );
        }).pipe(
          Effect.provide(ActivityCategoryWeekService.Default),
          Effect.provide(dbLive)
        )
    );

    it.effect("should handle empty results when no data exists", () =>
      Effect.gen(function* () {
        const service = yield* ActivityCategoryWeekService;
        const result = yield* service.getByWeekId({
          weekId: "99999999-9999-9999-9999-999999999999", // Valid UUID that doesn't exist
        });

        expect(result).toEqual([]);
      }).pipe(
        Effect.provide(ActivityCategoryWeekService.Default),
        Effect.provide(dbLive)
      )
    );
  });
});
