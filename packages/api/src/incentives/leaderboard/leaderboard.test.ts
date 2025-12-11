import { it } from '@effect/vitest';
import {
  accounts,
  activities,
  activityCategories,
  activityCategoryWeeks,
  activityWeeks,
  categoryLeaderboardCache,
  leaderboardStatsCache,
  schema,
  seasonLeaderboardCache,
  seasons,
  users,
  weeks,
} from 'db/incentives';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Effect, Layer, Logger, LogLevel } from 'effect';
import postgres from 'postgres';
import { describe, inject } from 'vitest';
import { AccountBalanceService } from '../account/accountBalance';
import { ActivityService } from '../activity/activity';
import { ActivityCategoryService } from '../activity-category/activityCategory';
import { ActivityCategoryWeekService } from '../activity-category-week/activityCategoryWeek';
import { ActivityWeekService } from '../activity-week/activityWeek';
import { createDbClientLive } from '../db/dbClient';
import { SeasonService } from '../season/season';
import { UserService } from '../user/user';
import { WeekService } from '../week/week';
import { ActivityDisplayService } from './activityDisplay';
import { ActivityPointsAdjustmentService } from './activityPointsAdjustment';
import { CacheNotAvailableError, LeaderboardService } from './leaderboard';

describe(
  'LeaderboardService',
  {
    timeout: 60_000,
  },
  () => {
    const dbUrl = inject('testDbUrl');
    const client = postgres(dbUrl, { max: 1 });
    const db = drizzle(client, { schema });

    const dbLive = createDbClientLive(db);

    const activityWeekServiceLive = ActivityWeekService.Default.pipe(
      Layer.provide(dbLive),
    );

    const activityCategoryWeekServiceLive =
      ActivityCategoryWeekService.Default.pipe(Layer.provide(dbLive));

    const weekLive = WeekService.Default.pipe(
      Layer.provide(dbLive),
      Layer.provide(activityCategoryWeekServiceLive),
      Layer.provide(activityWeekServiceLive),
    );

    const seasonLive = SeasonService.Default.pipe(Layer.provide(dbLive));

    const activityCategoryServiceLive = ActivityCategoryService.Default.pipe(
      Layer.provide(dbLive),
    );

    const activityDisplayServiceLive = ActivityDisplayService.Default;

    const activityPointsAdjustmentServiceLive =
      ActivityPointsAdjustmentService.Default;

    const accountBalanceServiceLive = AccountBalanceService.Default.pipe(
      Layer.provide(dbLive),
    );

    const activityServiceLive = ActivityService.Default.pipe(
      Layer.provide(dbLive),
    );

    const userServiceLive = UserService.Default.pipe(
      Layer.provide(dbLive),
      Layer.provide(accountBalanceServiceLive),
      Layer.provide(activityServiceLive),
      Layer.provide(activityWeekServiceLive),
    );

    const leaderboardServiceLive = LeaderboardService.Default.pipe(
      Layer.provide(dbLive),
      Layer.provide(weekLive),
      Layer.provide(seasonLive),
      Layer.provide(activityCategoryServiceLive),
      Layer.provide(activityCategoryWeekServiceLive),
      Layer.provide(activityWeekServiceLive),
      Layer.provide(activityDisplayServiceLive),
      Layer.provide(activityPointsAdjustmentServiceLive),
      Layer.provide(userServiceLive),
      Layer.provide(Logger.minimumLogLevel(LogLevel.None)),
    );

    // Test data constants
    const SEASON_ID = '11111111-1111-1111-1111-111111111111';
    const WEEK_ID = '33333333-3333-3333-3333-333333333333';
    const USER_ID_1 = '55555555-5555-5555-5555-555555555555';
    const USER_ID_2 = '66666666-6666-6666-6666-666666666666';
    const USER_ID_3 = '77777777-7777-7777-7777-777777777777';

    const setupTestData = Effect.gen(function* () {
      // Clean up cache tables
      yield* Effect.promise(() => db.delete(seasonLeaderboardCache));
      yield* Effect.promise(() => db.delete(categoryLeaderboardCache));
      yield* Effect.promise(() => db.delete(leaderboardStatsCache));

      // Clean up data tables
      yield* Effect.promise(() => db.delete(accounts));
      yield* Effect.promise(() => db.delete(users));
      yield* Effect.promise(() => db.delete(activityWeeks));
      yield* Effect.promise(() => db.delete(activityCategoryWeeks));
      yield* Effect.promise(() => db.delete(activities));
      yield* Effect.promise(() => db.delete(activityCategories));
      yield* Effect.promise(() => db.delete(weeks));
      yield* Effect.promise(() => db.delete(seasons));

      // Insert test data
      yield* Effect.promise(() =>
        db
          .insert(seasons)
          .values([{ id: SEASON_ID, name: 'Test Season', status: 'active' }]),
      );

      yield* Effect.promise(() =>
        db.insert(weeks).values([
          {
            id: WEEK_ID,
            seasonId: SEASON_ID,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-07'),
          },
        ]),
      );

      yield* Effect.promise(() =>
        db.insert(users).values([
          {
            id: USER_ID_1,
            identityAddress: `identity_${USER_ID_1}`,
            label: 'TopPlayer',
          },
          {
            id: USER_ID_2,
            identityAddress: `identity_${USER_ID_2}`,
            label: 'MiddlePlayer',
          },
          {
            id: USER_ID_3,
            identityAddress: `identity_${USER_ID_3}`,
            label: 'NewPlayer',
          },
        ]),
      );

      // Insert activity categories
      yield* Effect.promise(() =>
        db.insert(activityCategories).values([
          {
            id: 'tradingVolume',
            name: 'Trading volume',
            description: 'Total trading volume across all DEXs',
          },
        ]),
      );

      // Insert activities
      yield* Effect.promise(() =>
        db.insert(activities).values([
          {
            id: 'c9_trade_xrd-xusdc',
            name: 'c9_trade_xrd-xusdc',
            category: 'tradingVolume',
            description: 'CaviarNine XRD/XUSDC trading',
          },
          {
            id: 'c9_trade_xrd-xusdt',
            name: 'c9_trade_xrd-xusdt',
            category: 'tradingVolume',
            description: 'CaviarNine XRD/XUSDT trading',
          },
        ]),
      );

      // Insert activity weeks
      yield* Effect.promise(() =>
        db.insert(activityWeeks).values([
          {
            activityId: 'c9_trade_xrd-xusdc',
            weekId: WEEK_ID,
            multiplier: '1',
          },
          {
            activityId: 'c9_trade_xrd-xusdt',
            weekId: WEEK_ID,
            multiplier: '1',
          },
        ]),
      );

      // Insert activity category weeks
      yield* Effect.promise(() =>
        db.insert(activityCategoryWeeks).values([
          {
            activityCategoryId: 'tradingVolume',
            weekId: WEEK_ID,
            pointsPool: 10000,
          },
        ]),
      );
    });

    describe('getSeasonLeaderboard', { retry: 0 }, () => {
      it.effect(
        'should return season leaderboard when cache is available',
        () =>
          Effect.gen(function* () {
            yield* setupTestData;

            // Insert mock cache data
            const SEASON_TOTALS_WEEK_ID =
              '00000000-0000-0000-0000-000000000000';
            yield* Effect.promise(() =>
              db.insert(seasonLeaderboardCache).values([
                {
                  seasonId: SEASON_ID,
                  weekId: SEASON_TOTALS_WEEK_ID, // Required field for season totals
                  userId: USER_ID_1,
                  totalPoints: '1000.50',
                  totalReferralPoints: '0', // Required field
                  categoryBreakdown: {}, // Required field
                  rank: 1,
                },
                {
                  seasonId: SEASON_ID,
                  weekId: SEASON_TOTALS_WEEK_ID,
                  userId: USER_ID_2,
                  totalPoints: '750.25',
                  totalReferralPoints: '0',
                  categoryBreakdown: {},
                  rank: 2,
                },
                {
                  seasonId: SEASON_ID,
                  weekId: SEASON_TOTALS_WEEK_ID,
                  userId: USER_ID_3,
                  totalPoints: '250.75',
                  totalReferralPoints: '0',
                  categoryBreakdown: {},
                  rank: 3,
                },
              ]),
            );

            // Insert stats cache
            yield* Effect.promise(() =>
              db.insert(leaderboardStatsCache).values([
                {
                  cacheKey: `season_${SEASON_ID}_week_00000000-0000-0000-0000-000000000000`,
                  totalUsers: 3,
                  median: '750.250000',
                  average: '667.170000',
                },
              ]),
            );

            const leaderboardService = yield* LeaderboardService;
            const result = yield* leaderboardService.getSeasonLeaderboard({
              seasonId: SEASON_ID,
            });

            // Verify response structure
            expect(result.topUsers).toHaveLength(3);
            expect(result.topUsers[0]).toEqual({
              userId: USER_ID_1,
              label: 'TopPlayer',
              totalPoints: '1000.500000',
              rank: 1,
            });

            expect(result.globalStats).toEqual({
              totalUsers: 3,
              totalUsersInSystem: 3,
              median: '750.250000',
              average: '667.170000',
            });

            expect(result.seasonInfo).toMatchObject({
              id: SEASON_ID,
              name: 'Test Season',
            });

            expect(result.userStats).toBeNull(); // No userId provided
          }).pipe(Effect.provide(leaderboardServiceLive)),
      );

      it.effect('should return user stats when userId is provided', () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Insert additional test users for percentile calculation
          yield* Effect.promise(() =>
            db.insert(users).values([
              {
                id: '44444444-4444-4444-4444-444444444444',
                identityAddress:
                  'identity_44444444-4444-4444-4444-444444444444',
                label: 'TestUser4',
              },
              {
                id: '99999999-9999-9999-9999-999999999999',
                identityAddress:
                  'identity_99999999-9999-9999-9999-999999999999',
                label: 'TestUser5',
              },
            ]),
          );

          // Insert mock cache data
          const SEASON_TOTALS_WEEK_ID = '00000000-0000-0000-0000-000000000000';
          yield* Effect.promise(() =>
            db.insert(seasonLeaderboardCache).values([
              {
                seasonId: SEASON_ID,
                weekId: SEASON_TOTALS_WEEK_ID,
                userId: USER_ID_1,
                totalPoints: '1000.000000',
                totalReferralPoints: '0',
                categoryBreakdown: {},
                rank: 1,
              },
              {
                seasonId: SEASON_ID,
                weekId: SEASON_TOTALS_WEEK_ID,
                userId: USER_ID_2,
                totalPoints: '750.000000',
                totalReferralPoints: '0',
                categoryBreakdown: {},
                rank: 2,
              },
              {
                seasonId: SEASON_ID,
                weekId: SEASON_TOTALS_WEEK_ID,
                userId: USER_ID_3,
                totalPoints: '250.000000',
                totalReferralPoints: '0',
                categoryBreakdown: {},
                rank: 3,
              },
              // Add more users to test percentile calculation
              {
                seasonId: SEASON_ID,
                weekId: SEASON_TOTALS_WEEK_ID,
                userId: '44444444-4444-4444-4444-444444444444',
                totalPoints: '100.000000',
                totalReferralPoints: '0',
                categoryBreakdown: {},
                rank: 4,
              },
              {
                seasonId: SEASON_ID,
                weekId: SEASON_TOTALS_WEEK_ID,
                userId: '99999999-9999-9999-9999-999999999999',
                totalPoints: '50.000000',
                totalReferralPoints: '0',
                categoryBreakdown: {},
                rank: 5,
              },
            ]),
          );

          const leaderboardService = yield* LeaderboardService;
          const result = yield* leaderboardService.getSeasonLeaderboard({
            seasonId: SEASON_ID,
            userId: USER_ID_2, // Middle ranked user
          });

          expect(result.userStats).toMatchObject({
            rank: 2,
            totalPoints: '750.000000',
            percentile: 80, // (1 - (2-1)/5) * 100 = 80th percentile
          });

          // Top 5 should be limited to actual top 5
          expect(result.topUsers).toHaveLength(5);
        }).pipe(Effect.provide(leaderboardServiceLive)),
      );

      it.effect(
        'should fail with CacheNotAvailableError when cache is empty',
        () =>
          Effect.gen(function* () {
            yield* setupTestData;

            const leaderboardService = yield* LeaderboardService;

            const result = yield* Effect.either(
              leaderboardService.getSeasonLeaderboard({
                seasonId: SEASON_ID,
              }),
            );

            expect(result._tag).toBe('Left');
            if (result._tag === 'Left') {
              expect(result.left).toBeInstanceOf(CacheNotAvailableError);
              expect(result.left.message).toContain('cache is being built');
            }
          }).pipe(Effect.provide(leaderboardServiceLive)),
      );

      it.effect('should fail when season does not exist', () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* Effect.provide(
            LeaderboardService,
            leaderboardServiceLive,
          );
          const nonExistentSeasonId = '99999999-9999-9999-9999-999999999999';

          yield* leaderboardService
            .getSeasonLeaderboard({
              seasonId: nonExistentSeasonId,
            })
            .pipe(
              Effect.catchTag('NotFound', (e) => {
                expect(e.message).toBe(
                  `Season ${nonExistentSeasonId} not found`,
                );
                return Effect.succeed(e);
              }),
            );
        }),
      );
    });

    describe('getActivityCategoryLeaderboard', { retry: 0 }, () => {
      it.effect(
        'should return category leaderboard with activity breakdown',
        () =>
          Effect.gen(function* () {
            yield* setupTestData;

            // Insert mock cache data with activity breakdown
            yield* Effect.promise(() =>
              db.insert(categoryLeaderboardCache).values([
                {
                  weekId: WEEK_ID,
                  categoryId: 'tradingVolume',
                  userId: USER_ID_1,
                  totalPoints: '500.000000',
                  rank: 1,
                  activityBreakdown: {
                    'c9_trade_xrd-xusdc': 300,
                    'c9_trade_xrd-xusdt': 200,
                  },
                },
                {
                  weekId: WEEK_ID,
                  categoryId: 'tradingVolume',
                  userId: USER_ID_2,
                  totalPoints: '300.000000',
                  rank: 2,
                  activityBreakdown: { 'c9_trade_xrd-xusdc': 300 },
                },
              ]),
            );

            // Insert stats cache
            yield* Effect.promise(() =>
              db.insert(leaderboardStatsCache).values([
                {
                  cacheKey: `category_${WEEK_ID}_tradingVolume`,
                  totalUsers: 2,
                  median: '400.000000',
                  average: '400.000000',
                },
              ]),
            );

            const leaderboardService = yield* LeaderboardService;
            const result =
              yield* leaderboardService.getActivityCategoryLeaderboard({
                categoryId: 'tradingVolume',
                weekId: WEEK_ID,
                userId: USER_ID_1,
              });

            expect(result.topUsers).toHaveLength(2);
            expect(result.topUsers[0]).toEqual({
              userId: USER_ID_1,
              label: 'TopPlayer',
              totalPoints: '500.000000',
              rank: 1,
            });

            expect(result.userStats).toEqual({
              rank: 1,
              totalPoints: '500.000000',
              percentile: 100, // Top user = 100th percentile
              activityBreakdown: [
                {
                  activityId: 'c9_trade_xrd-xusdc',
                  activityName: 'c9_trade_xrd-xusdc',
                  points: '300.000000',
                },
                {
                  activityId: 'c9_trade_xrd-xusdt',
                  activityName: 'c9_trade_xrd-xusdt',
                  points: '200.000000',
                },
              ],
            });

            expect(result.categoryInfo).toEqual({
              id: 'tradingVolume',
              name: 'Trading volume',
            });

            expect(result.weekInfo).toEqual({
              id: WEEK_ID,
              startDate: new Date('2025-01-01'),
              endDate: new Date('2025-01-07'),
            });
          }).pipe(Effect.provide(leaderboardServiceLive)),
      );

      it.effect('should handle missing activity breakdown gracefully', () =>
        Effect.gen(function* () {
          yield* setupTestData;

          // Insert cache data without breakdown
          yield* Effect.promise(() =>
            db.insert(categoryLeaderboardCache).values([
              {
                weekId: WEEK_ID,
                categoryId: 'tradingVolume',
                userId: USER_ID_1,
                totalPoints: '500.000000',
                rank: 1,
                activityBreakdown: {}, // Empty breakdown
              },
            ]),
          );

          const leaderboardService = yield* LeaderboardService;
          const result =
            yield* leaderboardService.getActivityCategoryLeaderboard({
              categoryId: 'tradingVolume',
              weekId: WEEK_ID,
              userId: USER_ID_1,
            });

          expect(
            result.userStats && 'activityBreakdown' in result.userStats
              ? result.userStats.activityBreakdown
              : undefined,
          ).toEqual([]);
        }).pipe(Effect.provide(leaderboardServiceLive)),
      );

      it.effect('should fail when category or week does not exist', () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;

          // Test non-existent category
          const categoryResult = yield* Effect.either(
            leaderboardService.getActivityCategoryLeaderboard({
              categoryId: 'non-existent',
              weekId: WEEK_ID,
            }),
          );

          expect(categoryResult._tag).toBe('Left');
          if (categoryResult._tag === 'Left') {
            expect(categoryResult.left.message).toBe(
              'Activity category non-existent not found',
            );
          }

          // Test non-existent week
          const weekResult = yield* Effect.either(
            leaderboardService.getActivityCategoryLeaderboard({
              categoryId: 'tradingVolume',
              weekId: '99999999-9999-9999-9999-999999999999',
            }),
          );

          expect(weekResult._tag).toBe('Left');
          if (weekResult._tag === 'Left') {
            expect(weekResult.left.message).toBe(
              'Week 99999999-9999-9999-9999-999999999999 not found',
            );
          }
        }).pipe(Effect.provide(leaderboardServiceLive)),
      );
    });

    describe('getAvailable* methods', () => {
      it.effect('should return available seasons', () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;
          const seasons = yield* leaderboardService.getAvailableSeasons();

          expect(seasons).toHaveLength(1);
          expect(seasons[0]).toMatchObject({
            id: SEASON_ID,
            name: 'Test Season',
            status: 'active',
          });
        }).pipe(Effect.provide(leaderboardServiceLive)),
      );

      it.effect('should return available weeks', () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;
          const weeks = yield* leaderboardService.getAvailableWeeks({});

          expect(weeks).toHaveLength(1);
          expect(weeks[0]).toEqual({
            id: WEEK_ID,
            seasonId: SEASON_ID,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-07'),
            seasonName: 'Test Season',
          });
        }).pipe(Effect.provide(leaderboardServiceLive)),
      );

      it.effect('should return available categories', () =>
        Effect.gen(function* () {
          yield* setupTestData;

          const leaderboardService = yield* LeaderboardService;
          const categories = yield* leaderboardService.getAvailableCategories({
            weekId: WEEK_ID,
          });

          // Should return categories that have non-hold, non-common activities
          expect(categories.length).toBeGreaterThan(0);
          expect(categories[0]).toHaveProperty('id');
          expect(categories[0]).toHaveProperty('name');
          expect(categories[0]).toHaveProperty('description');
        }).pipe(Effect.provide(leaderboardServiceLive)),
      );
    });
  },
);
