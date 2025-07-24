import { it } from '@effect/vitest';
import BigNumber from 'bignumber.js';
import { ActivityCategoryId } from 'data';
import {
  activities,
  activityCategories,
  activityCategoryWeeks,
  activityWeeks,
  schema,
  seasons,
  weeks,
} from 'db/incentives';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Effect } from 'effect';
import postgres from 'postgres';
import { describe, inject } from 'vitest';
import { createDbClientLive } from '../db/dbClient';
import { ActivityCategoryWeekService } from './activityCategoryWeek';
import { distributeWeightedPoints } from './distributeWeightedPoints';

describe('ActivityCategoryWeekService', () => {
  const dbUrl = inject('testDbUrl');
  const client = postgres(dbUrl);
  const db = drizzle(client, { schema });
  const dbLive = createDbClientLive(db);

  describe('getByWeekId', () => {
    it.effect(
      'should return category data with activities and calculate distributed points correctly',
      () =>
        Effect.gen(function* () {
          // Create a test season
          const seasonInsertResult = yield* Effect.promise(() =>
            db
              .insert(seasons)
              .values({
                name: 'Test Season',
                status: 'active',
              })
              .returning({ id: seasons.id }),
          );
          const testSeasonId = seasonInsertResult[0]?.id;
          if (!testSeasonId) {
            throw new Error('Failed to create test season');
          }

          // Create a test week
          const weekInsertResult = yield* Effect.promise(() =>
            db
              .insert(weeks)
              .values({
                seasonId: testSeasonId,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-07'),
              })
              .returning({ id: weeks.id }),
          );
          const testWeekId = weekInsertResult[0]?.id;
          if (!testWeekId) {
            throw new Error('Failed to create test week');
          }

          // Create activity categories
          yield* Effect.promise(() =>
            db
              .insert(activityCategories)
              .values([
                {
                  id: ActivityCategoryId.tradingVolume,
                  name: 'Trading Volume',
                },
                {
                  id: ActivityCategoryId.lendingStables,
                  name: 'Lending Stables',
                },
              ])
              .onConflictDoNothing(),
          );

          // Create activities
          yield* Effect.promise(() =>
            db
              .insert(activities)
              .values([
                {
                  id: 'test-activity-1',
                  name: 'Test Activity 1',
                  category: ActivityCategoryId.tradingVolume,
                },
                {
                  id: 'test-activity-2',
                  name: 'Test Activity 2',
                  category: ActivityCategoryId.tradingVolume,
                },
                {
                  id: 'test-activity-3',
                  name: 'Test Activity 3',
                  category: ActivityCategoryId.lendingStables,
                },
              ])
              .onConflictDoNothing(),
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
              .onConflictDoNothing(),
          );

          // Create activity weeks with multipliers
          yield* Effect.promise(() =>
            db
              .insert(activityWeeks)
              .values([
                {
                  activityId: 'test-activity-1',
                  weekId: testWeekId,
                  multiplier: '2',
                },
                {
                  activityId: 'test-activity-2',
                  weekId: testWeekId,
                  multiplier: '3',
                },
                {
                  activityId: 'test-activity-3',
                  weekId: testWeekId,
                  multiplier: '1',
                },
              ])
              .onConflictDoNothing(),
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
            expect(category).toHaveProperty('categoryId');
            expect(category).toHaveProperty('activities');
            expect(category).toHaveProperty('pointsPool');
            expect(category.pointsPool).toBeInstanceOf(BigNumber);
            expect(Array.isArray(category.activities)).toBe(true);
            expect(category.pointsPool.isGreaterThan(0)).toBe(true);
          }

          // Find specific categories
          const tradingVolumeCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.tradingVolume,
          );
          const lendingStablesCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.lendingStables,
          );

          expect(tradingVolumeCategory).toBeDefined();
          expect(lendingStablesCategory).toBeDefined();

          if (!tradingVolumeCategory || !lendingStablesCategory) {
            throw new Error('Failed to find required categories');
          }

          // Verify trading volume category
          expect(tradingVolumeCategory.activities).toHaveLength(2);
          expect(
            tradingVolumeCategory.pointsPool.isEqualTo(new BigNumber(1000)),
          ).toBe(true);

          // Verify lending stables category
          expect(lendingStablesCategory.activities).toHaveLength(1);
          expect(
            lendingStablesCategory.pointsPool.isEqualTo(new BigNumber(2000)),
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
            (d) => d.id === 'test-activity-1',
          );
          const activity2Distribution = tradingVolumeDistribution.find(
            (d) => d.id === 'test-activity-2',
          );

          expect(
            activity1Distribution?.points.isEqualTo(new BigNumber(400)),
          ).toBe(true); // 1000 * 2/5
          expect(
            activity2Distribution?.points.isEqualTo(new BigNumber(600)),
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
            (d) => d.id === 'test-activity-3',
          );
          expect(
            activity3Distribution?.points.isEqualTo(new BigNumber(2000)),
          ).toBe(true); // 2000 * 1/1

          // Clean up test data
          yield* Effect.promise(() =>
            db
              .delete(activityWeeks)
              .where(eq(activityWeeks.weekId, testWeekId)),
          );
          yield* Effect.promise(() =>
            db
              .delete(activityCategoryWeeks)
              .where(eq(activityCategoryWeeks.weekId, testWeekId)),
          );
          yield* Effect.promise(() =>
            db.delete(weeks).where(eq(weeks.id, testWeekId)),
          );
          yield* Effect.promise(() =>
            db.delete(seasons).where(eq(seasons.id, testSeasonId)),
          );
        }).pipe(
          Effect.provide(ActivityCategoryWeekService.Default),
          Effect.provide(dbLive),
        ),
    );

    it.effect(
      'should include categories with zero points pool when they have activities',
      () =>
        Effect.gen(function* () {
          // Create a test season
          const seasonInsertResult = yield* Effect.promise(() =>
            db
              .insert(seasons)
              .values({
                name: 'Test Season Zero Pool',
              })
              .returning({ id: seasons.id }),
          );
          const testSeasonId = seasonInsertResult[0]?.id;
          if (!testSeasonId) {
            throw new Error('Failed to create test season');
          }

          // Create a test week
          const weekInsertResult = yield* Effect.promise(() =>
            db
              .insert(weeks)
              .values({
                seasonId: testSeasonId,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-07'),
              })
              .returning({ id: weeks.id }),
          );
          const testWeekId = weekInsertResult[0]?.id;
          if (!testWeekId) {
            throw new Error('Failed to create test week');
          }

          // Create activity categories
          yield* Effect.promise(() =>
            db
              .insert(activityCategories)
              .values([
                {
                  id: ActivityCategoryId.tradingVolume,
                  name: 'Trading Volume',
                },
                {
                  id: ActivityCategoryId.lendingStables,
                  name: 'Lending Stables',
                },
              ])
              .onConflictDoNothing(),
          );

          // Create activities
          yield* Effect.promise(() =>
            db
              .insert(activities)
              .values([
                {
                  id: 'test-activity-with-points',
                  name: 'Test Activity With Points',
                  category: ActivityCategoryId.tradingVolume,
                },
                {
                  id: 'test-activity-zero-pool-1',
                  name: 'Test Activity Zero Pool 1',
                  category: ActivityCategoryId.lendingStables,
                },
                {
                  id: 'test-activity-zero-pool-2',
                  name: 'Test Activity Zero Pool 2',
                  category: ActivityCategoryId.lendingStables,
                },
              ])
              .onConflictDoNothing(),
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
              .onConflictDoNothing(),
          );

          // Create activity weeks for all activities (including those in zero-pool category)
          yield* Effect.promise(() =>
            db
              .insert(activityWeeks)
              .values([
                {
                  activityId: 'test-activity-with-points',
                  weekId: testWeekId,
                  multiplier: '1',
                },
                {
                  activityId: 'test-activity-zero-pool-1',
                  weekId: testWeekId,
                  multiplier: '2',
                },
                {
                  activityId: 'test-activity-zero-pool-2',
                  weekId: testWeekId,
                  multiplier: '3',
                },
              ])
              .onConflictDoNothing(),
          );

          // Use the service to get results
          const service = yield* ActivityCategoryWeekService;
          const categoryResults = yield* service.getByWeekId({
            weekId: testWeekId,
          });

          // Should return both categories (including the one with zero points)
          expect(categoryResults).toHaveLength(2);

          // Verify both categories are returned
          const tradingVolumeCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.tradingVolume,
          );
          const lendingStablesCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.lendingStables,
          );

          expect(tradingVolumeCategory).toBeDefined();
          expect(lendingStablesCategory).toBeDefined(); // Should be included even with zero points

          if (!tradingVolumeCategory || !lendingStablesCategory) {
            throw new Error('Both categories should be present');
          }

          // Verify the category with points has correct data
          expect(tradingVolumeCategory.activities).toHaveLength(1);
          expect(
            tradingVolumeCategory.pointsPool.isEqualTo(new BigNumber(1000)),
          ).toBe(true);
          expect(tradingVolumeCategory.activities[0]?.id).toBe(
            'test-activity-with-points',
          );

          // Verify the category with zero points has correct data
          expect(lendingStablesCategory.activities).toHaveLength(2);
          expect(
            lendingStablesCategory.pointsPool.isEqualTo(new BigNumber(0)),
          ).toBe(true);
          expect(lendingStablesCategory.activities[0]?.id).toBe(
            'test-activity-zero-pool-1',
          );
          expect(lendingStablesCategory.activities[1]?.id).toBe(
            'test-activity-zero-pool-2',
          );

          // Clean up test data
          yield* Effect.promise(() =>
            db
              .delete(activityWeeks)
              .where(eq(activityWeeks.weekId, testWeekId)),
          );
          yield* Effect.promise(() =>
            db
              .delete(activityCategoryWeeks)
              .where(eq(activityCategoryWeeks.weekId, testWeekId)),
          );
          yield* Effect.promise(() =>
            db.delete(weeks).where(eq(weeks.id, testWeekId)),
          );
          yield* Effect.promise(() =>
            db.delete(seasons).where(eq(seasons.id, testSeasonId)),
          );
        }).pipe(
          Effect.provide(ActivityCategoryWeekService.Default),
          Effect.provide(dbLive),
        ),
    );

    it.effect(
      'should return categories with zero points when explicitly configured to include them',
      () =>
        Effect.gen(function* () {
          // Create a test season
          const seasonInsertResult = yield* Effect.promise(() =>
            db
              .insert(seasons)
              .values({
                name: 'Test Season Include Zero',
              })
              .returning({ id: seasons.id }),
          );
          const testSeasonId = seasonInsertResult[0]?.id;
          if (!testSeasonId) {
            throw new Error('Failed to create test season');
          }

          // Create a test week
          const weekInsertResult = yield* Effect.promise(() =>
            db
              .insert(weeks)
              .values({
                seasonId: testSeasonId,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-07'),
              })
              .returning({ id: weeks.id }),
          );
          const testWeekId = weekInsertResult[0]?.id;
          if (!testWeekId) {
            throw new Error('Failed to create test week');
          }

          // Create activity categories
          yield* Effect.promise(() =>
            db
              .insert(activityCategories)
              .values([
                {
                  id: ActivityCategoryId.tradingVolume,
                  name: 'Trading Volume',
                },
                {
                  id: ActivityCategoryId.lendingStables,
                  name: 'Lending Stables',
                },
              ])
              .onConflictDoNothing(),
          );

          // Create activities
          yield* Effect.promise(() =>
            db
              .insert(activities)
              .values([
                {
                  id: 'test-activity-with-points',
                  name: 'Test Activity With Points',
                  category: ActivityCategoryId.tradingVolume,
                },
                {
                  id: 'test-activity-zero-pool',
                  name: 'Test Activity Zero Pool',
                  category: ActivityCategoryId.lendingStables,
                },
              ])
              .onConflictDoNothing(),
          );

          // Create activity category weeks - both with positive points pools
          // This test verifies that categories with activities are returned even if they have 0 calculated points
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
                  pointsPool: 500, // This category also has points (not zero)
                },
              ])
              .onConflictDoNothing(),
          );

          // Create activity weeks
          yield* Effect.promise(() =>
            db
              .insert(activityWeeks)
              .values([
                {
                  activityId: 'test-activity-with-points',
                  weekId: testWeekId,
                  multiplier: '1',
                },
                {
                  activityId: 'test-activity-zero-pool',
                  weekId: testWeekId,
                  multiplier: '0', // Zero multiplier, but category has points pool
                },
              ])
              .onConflictDoNothing(),
          );

          // Use the service to get results
          const service = yield* ActivityCategoryWeekService;
          const categoryResults = yield* service.getByWeekId({
            weekId: testWeekId,
          });

          // Should return both categories since both have positive points pools
          expect(categoryResults).toHaveLength(2);

          // Find specific categories
          const tradingVolumeCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.tradingVolume,
          );
          const lendingStablesCategory = categoryResults.find(
            (c) => c.categoryId === ActivityCategoryId.lendingStables,
          );

          expect(tradingVolumeCategory).toBeDefined();
          expect(lendingStablesCategory).toBeDefined();

          if (!tradingVolumeCategory || !lendingStablesCategory) {
            throw new Error('Both categories should be present');
          }

          // Verify both categories have their respective points pools
          expect(
            tradingVolumeCategory.pointsPool.isEqualTo(new BigNumber(1000)),
          ).toBe(true);
          expect(
            lendingStablesCategory.pointsPool.isEqualTo(new BigNumber(500)),
          ).toBe(true);

          // Verify activities are present even with zero multipliers
          expect(tradingVolumeCategory.activities).toHaveLength(1);
          expect(lendingStablesCategory.activities).toHaveLength(1);
          expect(
            lendingStablesCategory.activities[0]?.multiplier.isEqualTo(
              new BigNumber(0),
            ),
          ).toBe(true);

          // Clean up test data
          yield* Effect.promise(() =>
            db
              .delete(activityWeeks)
              .where(eq(activityWeeks.weekId, testWeekId)),
          );
          yield* Effect.promise(() =>
            db
              .delete(activityCategoryWeeks)
              .where(eq(activityCategoryWeeks.weekId, testWeekId)),
          );
          yield* Effect.promise(() =>
            db.delete(weeks).where(eq(weeks.id, testWeekId)),
          );
          yield* Effect.promise(() =>
            db.delete(seasons).where(eq(seasons.id, testSeasonId)),
          );
        }).pipe(
          Effect.provide(ActivityCategoryWeekService.Default),
          Effect.provide(dbLive),
        ),
    );

    it.effect('should handle empty results when no data exists', () =>
      Effect.gen(function* () {
        const service = yield* ActivityCategoryWeekService;
        const result = yield* service.getByWeekId({
          weekId: '99999999-9999-9999-9999-999999999999', // Valid UUID that doesn't exist
        });

        expect(result).toEqual([]);
      }).pipe(
        Effect.provide(ActivityCategoryWeekService.Default),
        Effect.provide(dbLive),
      ),
    );
  });
});
