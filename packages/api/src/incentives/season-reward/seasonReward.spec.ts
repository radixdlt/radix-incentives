import { layer } from '@effect/vitest';
import {
  seasons,
  userSeasonBonuses,
  userSeasonPoints,
  userSeasonReward,
  users,
  weeks,
} from 'db/incentives';
import { Effect, HashMap, Layer, Logger, Option } from 'effect';
import { SeasonId, UserId } from 'shared/brandedTypes';
import { beforeEach, expect } from 'vitest';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbService } from '../db/dbClient';
import {
  RewardAmount,
  RewardBudget,
  SeasonRewardService,
} from './seasonReward';

const testSetup = Effect.gen(function* () {
  const db = yield* DbService;

  const data = yield* db.use(async (db) => {
    const [user1] = await db
      .insert(users)
      .values({
        identityAddress: 'user-1-identity',
      })
      .returning();

    const [user2] = await db
      .insert(users)
      .values({
        identityAddress: 'user-2-identity',
      })
      .returning();

    const [user3] = await db
      .insert(users)
      .values({
        identityAddress: 'user-3-identity',
      })
      .returning();

    const [season1] = await db
      .insert(seasons)
      .values({
        name: 'Test Season 1',
        status: 'active',
      })
      .returning();

    const [season2] = await db
      .insert(seasons)
      .values({
        name: 'Test Season 2',
        status: 'active',
      })
      .returning();

    const [week1] = await db
      .insert(weeks)
      .values({
        seasonId: season1.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07'),
      })
      .returning();

    const [week2] = await db
      .insert(weeks)
      .values({
        seasonId: season1.id,
        startDate: new Date('2024-01-08'),
        endDate: new Date('2024-01-14'),
      })
      .returning();

    return {
      user1,
      user2,
      user3,
      season1,
      season2,
      week1,
      week2,
    };
  });

  return data;
}).pipe(Effect.provide(DbService.Default));

// Test layer - no external service dependencies needed
const TestLayer = SeasonRewardService.Default.pipe(
  Layer.provide(Logger.pretty),
);

layer(TestLayer)('SeasonRewardService', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });

  it.effect(
    'getUserSeasonPointTotals - returns empty array when no points exist',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const { season1 } = yield* testSetup;

        const result = yield* service.getUserSeasonPointTotals(
          SeasonId.make(season1.id),
        );

        expect(result).toEqual([]);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getUserSeasonPointTotals - returns user totals across weeks', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const db = yield* DbService;
      const { user1, user2, season1, week1, week2 } = yield* testSetup;

      // Insert season points for users across multiple weeks
      yield* db.use((db) =>
        db.insert(userSeasonPoints).values([
          {
            userId: user1.id,
            seasonId: season1.id,
            weekId: week1.id,
            points: '100',
          },
          {
            userId: user1.id,
            seasonId: season1.id,
            weekId: week2.id,
            points: '200',
          },
          {
            userId: user2.id,
            seasonId: season1.id,
            weekId: week1.id,
            points: '50',
          },
        ]),
      );

      const result = yield* service.getUserSeasonPointTotals(
        SeasonId.make(season1.id),
      );

      expect(result).toHaveLength(2);

      const user1Total = result.find((r) => r.userId === user1.id);
      const user2Total = result.find((r) => r.userId === user2.id);

      expect(user1Total?.totalPoints.toString()).toBe('300.000000');
      expect(user2Total?.totalPoints.toString()).toBe('50.000000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getSeasonBonuses - returns empty map when no bonuses exist', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const { season1 } = yield* testSetup;

      const result = yield* service.getSeasonBonuses(SeasonId.make(season1.id));

      expect(HashMap.size(result)).toBe(0);
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getSeasonBonuses - returns user bonuses for season', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const db = yield* DbService;
      const { user1, user2, season1 } = yield* testSetup;

      yield* db.use((db) =>
        db.insert(userSeasonBonuses).values([
          {
            userId: user1.id,
            seasonId: season1.id,
            seasonBonus: '0.15',
          },
          {
            userId: user2.id,
            seasonId: season1.id,
            seasonBonus: '0.10',
          },
        ]),
      );

      const result = yield* service.getSeasonBonuses(SeasonId.make(season1.id));

      expect(HashMap.size(result)).toBe(2);
      const bonus1 = HashMap.get(result, UserId.make(user1.id));
      const bonus2 = HashMap.get(result, UserId.make(user2.id));
      expect(Option.isSome(bonus1) && bonus1.value.toString()).toBe('0.150000');
      expect(Option.isSome(bonus2) && bonus2.value.toString()).toBe('0.100000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getTotalSeasonPoints - returns zero when no points exist', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const { season1 } = yield* testSetup;

      const result = yield* service.getTotalSeasonPoints(
        SeasonId.make(season1.id),
      );

      expect(result.toString()).toBe('0');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getTotalSeasonPoints - returns sum of all user points', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const db = yield* DbService;
      const { user1, user2, season1, week1, week2 } = yield* testSetup;

      yield* db.use((db) =>
        db.insert(userSeasonPoints).values([
          {
            userId: user1.id,
            seasonId: season1.id,
            weekId: week1.id,
            points: '100',
          },
          {
            userId: user1.id,
            seasonId: season1.id,
            weekId: week2.id,
            points: '200',
          },
          {
            userId: user2.id,
            seasonId: season1.id,
            weekId: week1.id,
            points: '50',
          },
        ]),
      );

      const result = yield* service.getTotalSeasonPoints(
        SeasonId.make(season1.id),
      );

      expect(result.toString()).toBe('350');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'calculateSeasonReward - returns empty array when no users have points',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const { season1 } = yield* testSetup;

        const result = yield* service.calculateSeasonReward({
          seasonId: SeasonId.make(season1.id),
          rewardBudget: RewardBudget.make('1000'),
        });

        expect(result).toEqual([]);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'calculateSeasonReward - calculates rewards as proportional share of budget',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { user1, user2, season1, week1 } = yield* testSetup;

        // User1 has 500 points, User2 has 300 points
        yield* db.use((db) =>
          db.insert(userSeasonPoints).values([
            {
              userId: user1.id,
              seasonId: season1.id,
              weekId: week1.id,
              points: '500',
            },
            {
              userId: user2.id,
              seasonId: season1.id,
              weekId: week1.id,
              points: '300',
            },
          ]),
        );

        // Budget: 1000, Total points: 800
        // User1: (500/800) * 1000 = 625
        // User2: (300/800) * 1000 = 375
        const result = yield* service.calculateSeasonReward({
          seasonId: SeasonId.make(season1.id),
          rewardBudget: RewardBudget.make('1000'),
        });

        expect(result).toHaveLength(2);

        const user1Reward = result.find((r) => r.userId === user1.id);
        const user2Reward = result.find((r) => r.userId === user2.id);

        // User1: (500/800) * 1000 = 625
        // User2: (300/800) * 1000 = 375
        expect(user1Reward?.rewardAmount.toString()).toBe('625');
        expect(user2Reward?.rewardAmount.toString()).toBe('375');
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'calculateSeasonReward - applies season bonus multiplier after proportional share',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { user1, user2, season1, week1 } = yield* testSetup;

        // User1 has 400 points, User2 has 400 points
        yield* db.use((db) =>
          db.insert(userSeasonPoints).values([
            {
              userId: user1.id,
              seasonId: season1.id,
              weekId: week1.id,
              points: '400',
            },
            {
              userId: user2.id,
              seasonId: season1.id,
              weekId: week1.id,
              points: '400',
            },
          ]),
        );

        // User1 has 25% bonus (0.25), User2 has no bonus
        yield* db.use((db) =>
          db.insert(userSeasonBonuses).values({
            userId: user1.id,
            seasonId: season1.id,
            seasonBonus: '0.25',
          }),
        );

        // Budget: 1000, Total points: 800
        // Step 1: Calculate base rewards (proportional share of budget, ignoring bonuses)
        //   User1: (400/800) * 1000 = 500
        //   User2: (400/800) * 1000 = 500
        // Step 2: Apply season bonus multiplier
        //   User1: 500 * 1.25 = 625
        //   User2: 500 * 1.0 = 500
        // Total distributed: 1125 (exceeds budget due to bonus, which is intentional)
        const result = yield* service.calculateSeasonReward({
          seasonId: SeasonId.make(season1.id),
          rewardBudget: RewardBudget.make('1000'),
        });

        expect(result).toHaveLength(2);

        const user1Reward = result.find((r) => r.userId === user1.id);
        const user2Reward = result.find((r) => r.userId === user2.id);

        expect(user1Reward?.totalPoints.toString()).toBe('400.000000');
        expect(user1Reward?.seasonBonus.toString()).toBe('0.250000');
        // (400/800) * 1000 * 1.25 = 625
        expect(user1Reward?.rewardAmount.toString()).toBe('625');

        expect(user2Reward?.totalPoints.toString()).toBe('400.000000');
        expect(user2Reward?.seasonBonus.toString()).toBe('0');
        // (400/800) * 1000 * 1.0 = 500
        expect(user2Reward?.rewardAmount.toString()).toBe('500');
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'saveSeasonRewards - does nothing when rewards array is empty',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { season1 } = yield* testSetup;

        yield* service.saveSeasonRewards({
          seasonId: SeasonId.make(season1.id),
          rewards: [],
        });

        const count = yield* db.use((db) => db.select().from(userSeasonReward));

        expect(count).toHaveLength(0);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('saveSeasonRewards - saves rewards for users', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const db = yield* DbService;
      const { season1, user1, user2 } = yield* testSetup;

      yield* service.saveSeasonRewards({
        seasonId: SeasonId.make(season1.id),
        rewards: [
          {
            userId: UserId.make(user1.id),
            rewardAmount: RewardAmount.make('500'),
          },
          {
            userId: UserId.make(user2.id),
            rewardAmount: RewardAmount.make('300'),
          },
        ],
      });

      const saved = yield* db.use((db) => db.select().from(userSeasonReward));

      expect(saved).toHaveLength(2);

      const user1Saved = saved.find((r) => r.userId === user1.id);
      const user2Saved = saved.find((r) => r.userId === user2.id);

      expect(user1Saved?.amount).toBe('500.000000');
      expect(user2Saved?.amount).toBe('300.000000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('saveSeasonRewards - upserts on conflict', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const db = yield* DbService;
      const { season1, user1 } = yield* testSetup;

      // First save
      yield* service.saveSeasonRewards({
        seasonId: SeasonId.make(season1.id),
        rewards: [
          {
            userId: UserId.make(user1.id),
            rewardAmount: RewardAmount.make('500'),
          },
        ],
      });

      // Second save with different amount
      yield* service.saveSeasonRewards({
        seasonId: SeasonId.make(season1.id),
        rewards: [
          {
            userId: UserId.make(user1.id),
            rewardAmount: RewardAmount.make('750'),
          },
        ],
      });

      const saved = yield* db.use((db) => db.select().from(userSeasonReward));

      expect(saved).toHaveLength(1);
      expect(saved[0].amount).toBe('750.000000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getUserSeasonReward - returns null when no reward exists', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const { season1, user1 } = yield* testSetup;

      const result = yield* service.getUserSeasonReward({
        userId: UserId.make(user1.id),
        seasonId: SeasonId.make(season1.id),
      });

      expect(result).toBe(null);
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getUserSeasonReward - returns reward when it exists', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const db = yield* DbService;
      const { season1, user1 } = yield* testSetup;

      yield* db.use((db) =>
        db.insert(userSeasonReward).values({
          userId: user1.id,
          seasonId: season1.id,
          amount: '1234.567890',
        }),
      );

      const result = yield* service.getUserSeasonReward({
        userId: UserId.make(user1.id),
        seasonId: SeasonId.make(season1.id),
      });

      expect(result).not.toBe(null);
      expect(result?.amount).toBe('1234.567890');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'getUserSeasonReward - returns correct reward for specific season',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { season1, season2, user1 } = yield* testSetup;

        // Insert rewards for both seasons
        yield* db.use((db) =>
          db.insert(userSeasonReward).values([
            {
              userId: user1.id,
              seasonId: season1.id,
              amount: '100',
            },
            {
              userId: user1.id,
              seasonId: season2.id,
              amount: '200',
            },
          ]),
        );

        const result1 = yield* service.getUserSeasonReward({
          userId: UserId.make(user1.id),
          seasonId: SeasonId.make(season1.id),
        });

        const result2 = yield* service.getUserSeasonReward({
          userId: UserId.make(user1.id),
          seasonId: SeasonId.make(season2.id),
        });

        expect(result1).not.toBe(null);
        expect(result2).not.toBe(null);

        expect(result1?.amount).toBe('100.000000');
        expect(result2?.amount).toBe('200.000000');
      }).pipe(Effect.provide(DbService.Default)),
  );
});
