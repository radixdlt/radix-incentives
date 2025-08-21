import { it } from '@effect/vitest';
import type { Db } from 'db/incentives';
import { accountBalances, accounts, schema, users, weeks } from 'db/incentives';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Effect, Layer } from 'effect';
import postgres from 'postgres';
import { beforeEach, describe, expect, inject } from 'vitest';
import { ActivityCategoryWeekService } from '../activity-category-week/activityCategoryWeek';
import { ActivityWeekService } from '../activity-week/activityWeek';
import { createDbClientLive } from '../db/dbClient';
import { WeekService } from './week';

describe('WeekService - getUnprocessedWeeks', () => {
  let db: Db;
  let dbLive: ReturnType<typeof createDbClientLive>;
  let weekService: Layer.Layer<WeekService>;
  const seasonId = inject('seasonId');

  beforeEach(async () => {
    const dbUrl = inject('testDbUrl');
    const client = postgres(dbUrl);
    db = drizzle(client, { schema });
    dbLive = createDbClientLive(db);

    const activityWeekServiceLive = ActivityWeekService.Default.pipe(
      Layer.provide(dbLive),
    );

    const activityCategoryWeekServiceLive =
      ActivityCategoryWeekService.Default.pipe(Layer.provide(dbLive));

    weekService = WeekService.Default.pipe(
      Layer.provide(dbLive),
      Layer.provide(activityCategoryWeekServiceLive),
      Layer.provide(activityWeekServiceLive),
    );

    // Clean up test data
    await db.delete(accountBalances);
    await db.delete(accounts);
    await db.delete(users);
    await db.delete(weeks);
  });

  it('should return empty array when no unprocessed weeks exist', () =>
    Effect.gen(function* () {
      const service = yield* WeekService;
      const result = yield* service.getUnprocessedWeeks();
      expect(result).toEqual([]);
    }).pipe(Effect.provide(weekService)));

  it('should return unprocessed weeks that have ended', () =>
    Effect.gen(function* () {
      const service = yield* WeekService;

      // Create a past week that is unprocessed
      const pastWeek = yield* Effect.promise(() =>
        db
          .insert(weeks)
          .values({
            id: 'past-week-1',
            seasonId,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-07'),
            processed: false,
          })
          .returning()
          .then(([week]) => week!),
      );

      // Create a future week (should not be returned)
      yield* Effect.promise(() =>
        db.insert(weeks).values({
          id: 'future-week-1',
          seasonId,
          startDate: new Date('2030-01-01'),
          endDate: new Date('2030-01-07'),
          processed: false,
        }),
      );

      // Create a processed week (should not be returned)
      yield* Effect.promise(() =>
        db.insert(weeks).values({
          id: 'processed-week-1',
          seasonId,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-07'),
          processed: true,
        }),
      );

      const result = yield* service.getUnprocessedWeeks();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        weekId: pastWeek.id,
        startDate: pastWeek.startDate,
        endDate: pastWeek.endDate,
        accountCount: 0,
        balanceCount: 0,
        countsMatch: true,
      });
    }).pipe(Effect.provide(weekService)));

  it('should calculate account and balance counts correctly', () =>
    Effect.gen(function* () {
      const service = yield* WeekService;

      // Create a past week
      const pastWeek = yield* Effect.promise(() =>
        db
          .insert(weeks)
          .values({
            id: 'past-week-2',
            seasonId,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-07 23:59:59'),
            processed: false,
          })
          .returning()
          .then(([week]) => week!),
      );

      // Create user first
      const userId = yield* Effect.promise(() =>
        db
          .insert(users)
          .values({
            id: 'user-1',
            identityAddress: 'identity-1',
            label: 'Test User',
          })
          .returning()
          .then(([user]) => user!.id),
      );

      // Create accounts before the week ends
      yield* Effect.promise(() =>
        db.insert(accounts).values([
          {
            userId,
            address: 'address-1',
            label: 'Account 1',
            createdAt: new Date('2024-01-05'), // Created during the week
          },
          {
            userId,
            address: 'address-2',
            label: 'Account 2',
            createdAt: new Date('2024-01-06'), // Created during the week
          },
          {
            userId,
            address: 'address-3',
            label: 'Account 3',
            createdAt: new Date('2024-01-10'), // Created after the week ends
          },
        ]),
      );

      // Create account balances at the end hour of the week
      const endHour = new Date('2024-01-07 23:00:00');
      yield* Effect.promise(() =>
        db.insert(accountBalances).values([
          {
            accountAddress: 'address-1',
            timestamp: endHour,
            data: { resource_1: { amount: '100' } },
          },
          {
            accountAddress: 'address-2',
            timestamp: endHour,
            data: { resource_1: { amount: '200' } },
          },
          {
            accountAddress: 'address-1',
            timestamp: new Date('2024-01-07 22:00:00'), // Before the end hour
            data: { resource_1: { amount: '50' } },
          },
          {
            accountAddress: 'address-1',
            timestamp: new Date('2024-01-08 00:00:00'), // After the end hour
            data: { resource_1: { amount: '150' } },
          },
        ]),
      );

      const result = yield* service.getUnprocessedWeeks();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        weekId: pastWeek.id,
        accountCount: 2, // 2 accounts created before week end
        balanceCount: 2, // 2 unique account/hour combinations in the end hour
        countsMatch: true, // 2 === 2
      });
    }).pipe(Effect.provide(weekService)));

  it('should detect count mismatches', () =>
    Effect.gen(function* () {
      const service = yield* WeekService;

      // Create a past week
      const pastWeek = yield* Effect.promise(() =>
        db
          .insert(weeks)
          .values({
            id: 'past-week-3',
            seasonId,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-07 23:59:59'),
            processed: false,
          })
          .returning()
          .then(([week]) => week!),
      );

      // Create user first
      const userId = yield* Effect.promise(() =>
        db
          .insert(users)
          .values({
            id: 'user-2',
            identityAddress: 'identity-2',
            label: 'Test User 2',
          })
          .returning()
          .then(([user]) => user!.id),
      );

      // Create 3 accounts before the week ends
      yield* Effect.promise(() =>
        db.insert(accounts).values([
          {
            userId,
            address: 'address-4',
            label: 'Account 4',
            createdAt: new Date('2024-01-05'),
          },
          {
            userId,
            address: 'address-5',
            label: 'Account 5',
            createdAt: new Date('2024-01-06'),
          },
          {
            userId,
            address: 'address-6',
            label: 'Account 6',
            createdAt: new Date('2024-01-07'),
          },
        ]),
      );

      // Create only 2 account balances (mismatch)
      const endHour = new Date('2024-01-07 23:00:00');
      yield* Effect.promise(() =>
        db.insert(accountBalances).values([
          {
            accountAddress: 'address-4',
            timestamp: endHour,
            data: { resource_1: { amount: '100' } },
          },
          {
            accountAddress: 'address-5',
            timestamp: endHour,
            data: { resource_1: { amount: '200' } },
          },
        ]),
      );

      const result = yield* service.getUnprocessedWeeks();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        weekId: pastWeek.id,
        accountCount: 3,
        balanceCount: 2,
        countsMatch: false, // 3 !== 2
      });
    }).pipe(Effect.provide(weekService)));

  it('should handle multiple unprocessed weeks', () =>
    Effect.gen(function* () {
      const service = yield* WeekService;

      // Create multiple past weeks
      const week1 = yield* Effect.promise(() =>
        db
          .insert(weeks)
          .values({
            id: 'multi-week-1',
            seasonId,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-07'),
            processed: false,
          })
          .returning()
          .then(([week]) => week!),
      );

      const week2 = yield* Effect.promise(() =>
        db
          .insert(weeks)
          .values({
            id: 'multi-week-2',
            seasonId,
            startDate: new Date('2024-01-08'),
            endDate: new Date('2024-01-14'),
            processed: false,
          })
          .returning()
          .then(([week]) => week!),
      );

      const result = yield* service.getUnprocessedWeeks();

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.weekId).sort()).toEqual(
        [week1.id, week2.id].sort(),
      );
    }).pipe(Effect.provide(weekService)));

  it('should handle weeks with no accounts or balances', () =>
    Effect.gen(function* () {
      const service = yield* WeekService;

      // Create a week with no associated accounts or balances
      const emptyWeek = yield* Effect.promise(() =>
        db
          .insert(weeks)
          .values({
            id: 'empty-week-1',
            seasonId,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-07'),
            processed: false,
          })
          .returning()
          .then(([week]) => week!),
      );

      const result = yield* service.getUnprocessedWeeks();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        weekId: emptyWeek.id,
        accountCount: 0,
        balanceCount: 0,
        countsMatch: true, // 0 === 0
      });
    }).pipe(Effect.provide(weekService)));

  it('should count distinct account-hour combinations correctly', () =>
    Effect.gen(function* () {
      const service = yield* WeekService;

      // Create a past week
      const pastWeek = yield* Effect.promise(() =>
        db
          .insert(weeks)
          .values({
            id: 'distinct-week-1',
            seasonId,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-07 23:59:59'),
            processed: false,
          })
          .returning()
          .then(([week]) => week!),
      );

      // Create user first
      const userId = yield* Effect.promise(() =>
        db
          .insert(users)
          .values({
            id: 'user-3',
            identityAddress: 'identity-3',
            label: 'Test User 3',
          })
          .returning()
          .then(([user]) => user!.id),
      );

      // Create one account
      yield* Effect.promise(() =>
        db.insert(accounts).values({
          userId,
          address: 'address-7',
          label: 'Account 7',
          createdAt: new Date('2024-01-05'),
        }),
      );

      // Create multiple balances for the same account in the end hour
      const endHour = new Date('2024-01-07 23:00:00');
      const endHour30 = new Date('2024-01-07 23:30:00');
      yield* Effect.promise(() =>
        db.insert(accountBalances).values([
          {
            accountAddress: 'address-7',
            timestamp: endHour,
            data: { resource_1: { amount: '100' } },
          },
          {
            accountAddress: 'address-7',
            timestamp: endHour30, // Same hour, different minute
            data: { resource_2: { amount: '200' } },
          },
          {
            accountAddress: 'address-7',
            timestamp: endHour,
            data: { resource_3: { amount: '300' } },
          },
        ]),
      );

      const result = yield* service.getUnprocessedWeeks();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        weekId: pastWeek.id,
        accountCount: 1,
        balanceCount: 1, // Only 1 distinct account/hour combination
        countsMatch: true,
      });
    }).pipe(Effect.provide(weekService)));
});
