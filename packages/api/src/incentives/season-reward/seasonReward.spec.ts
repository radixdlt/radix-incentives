import { layer } from '@effect/vitest';
import BigNumber from 'bignumber.js';
import {
  accounts,
  seasons,
  userSeasonBonuses,
  userSeasonPoints,
  userSeasonReward,
  users,
  weeks,
} from 'db/incentives';
import { Effect, HashMap, Layer, Logger, Option } from 'effect';
import { beforeEach, expect } from 'vitest';
import { truncateTables } from '../../test-helpers/truncateTables';
import {
  AccountAddress,
  ComponentAddress,
} from '../account-balance/v2/schemas';
import { DbService } from '../db/dbClient';
import { NetworkId, SeasonId, UserId } from '../schemas/brandedTypes';
import { IncentivesVesterStateService } from './incentives-vester/incentivesVester';
import { Points, SeasonBonus, SeasonRewardService } from './seasonReward';

// Mock IncentivesVesterStateService to return configurable total_tokens_to_vest
const createMockVesterStateService = (totalTokensToVest: string) =>
  Layer.succeed(
    IncentivesVesterStateService,
    IncentivesVesterStateService.of(() =>
      // @ts-expect-error
      Effect.succeed({
        locker: 'locker_address',
        pool: 'pool_address',
        lp_tokens_vault: 'lp_vault',
        locked_tokens_vault: 'locked_vault',
        total_tokens_to_vest: totalTokensToVest,
        vested_tokens: '0',
        vest_start: Option.none(),
        vest_end: Option.none(),
        vest_duration_days: 365,
        pre_claim_duration_seconds: 86400,
        initial_vested_fraction: '0.2',
      }),
    ),
  );

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

    // Create accounts for users
    const [account1] = await db
      .insert(accounts)
      .values({
        userId: user1.id,
        address: 'account_tdx_1_user1_address',
        label: 'User 1 Account',
      })
      .returning();

    const [account2] = await db
      .insert(accounts)
      .values({
        userId: user2.id,
        address: 'account_tdx_1_user2_address',
        label: 'User 2 Account',
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
      account1,
      account2,
    };
  });

  return data;
}).pipe(Effect.provide(DbService.Default));

// Test layer with mocked IncentivesVesterStateService
const TestLayer = SeasonRewardService.DefaultWithoutDependencies.pipe(
  Layer.provide(createMockVesterStateService('1000')),
  Layer.provide(Logger.pretty),
  Layer.provide(DbService.Default),
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
          rewardBudget: new BigNumber('1000000'),
          componentAddress: ComponentAddress('component_test_address'),
          networkId: NetworkId.make(2),
        });

        expect(result).toEqual([]);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'calculateSeasonReward - calculates rewards proportionally based on adjusted points',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { user1, user2, season1, week1 } = yield* testSetup;

        // User1 has 500 points, User2 has 500 points
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
              points: '500',
            },
          ]),
        );

        // Total tokens to vest is 1000 (from mock)
        // Each user has 500/1000 = 50% share
        const result = yield* service.calculateSeasonReward({
          seasonId: SeasonId.make(season1.id),
          rewardBudget: new BigNumber('1000'),
          componentAddress: ComponentAddress('component_test_address'),
          networkId: NetworkId.make(2),
        });

        expect(result).toHaveLength(2);

        const user1Reward = result.find((r) => r.userId === user1.id);
        const user2Reward = result.find((r) => r.userId === user2.id);

        // Both users should get 50% of 1000 = 500 each
        expect(user1Reward?.rewardAmount.toString()).toBe('500');
        expect(user2Reward?.rewardAmount.toString()).toBe('500');
        expect(user1Reward?.poolShare.toString()).toBe('0.5');
        expect(user2Reward?.poolShare.toString()).toBe('0.5');
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'calculateSeasonReward - applies season bonus multiplier correctly',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { user1, user2, season1, week1 } = yield* testSetup;

        // Both users have 400 points each (800 total raw points)
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
        // User1 adjusted: 400 * 1.25 = 500
        // User2 adjusted: 400 * 1.0 = 400
        yield* db.use((db) =>
          db.insert(userSeasonBonuses).values({
            userId: user1.id,
            seasonId: season1.id,
            seasonBonus: '0.25',
          }),
        );

        // Total tokens to vest is 1000 (from mock)
        // User1 share: 500/1000 = 0.5
        // User2 share: 400/1000 = 0.4
        const result = yield* service.calculateSeasonReward({
          seasonId: SeasonId.make(season1.id),
          rewardBudget: new BigNumber('1000'),
          componentAddress: ComponentAddress('component_test_address'),
          networkId: NetworkId.make(2),
        });

        expect(result).toHaveLength(2);

        const user1Reward = result.find((r) => r.userId === user1.id);
        const user2Reward = result.find((r) => r.userId === user2.id);

        expect(user1Reward?.totalPoints.toString()).toBe('400.000000');
        expect(user1Reward?.seasonBonus.toString()).toBe('0.250000');
        expect(user1Reward?.poolShare.toString()).toBe('0.5');
        expect(user1Reward?.rewardAmount.toString()).toBe('500');

        expect(user2Reward?.totalPoints.toString()).toBe('400.000000');
        expect(user2Reward?.seasonBonus.toString()).toBe('0');
        expect(user2Reward?.poolShare.toString()).toBe('0.4');
        expect(user2Reward?.rewardAmount.toString()).toBe('400');
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'saveSeasonRewards - does nothing when rewards array is empty',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { season1, user1, account1 } = yield* testSetup;

        yield* service.saveSeasonRewards({
          seasonId: SeasonId.make(season1.id),
          rewards: [],
          accountAddresses: new Map([
            [UserId.make(user1.id), AccountAddress(account1.address)],
          ]),
        });

        const count = yield* db.use((db) => db.select().from(userSeasonReward));

        expect(count).toHaveLength(0);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'saveSeasonRewards - saves rewards for users with account addresses',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { season1, user1, user2, account1, account2 } = yield* testSetup;

        yield* service.saveSeasonRewards({
          seasonId: SeasonId.make(season1.id),
          rewards: [
            {
              userId: UserId.make(user1.id),
              totalPoints: Points('500'),
              seasonBonus: SeasonBonus('0.1'),
              poolShare: new BigNumber('0.5'),
              rewardAmount: new BigNumber('500'),
            },
            {
              userId: UserId.make(user2.id),
              totalPoints: Points('500'),
              seasonBonus: SeasonBonus('0'),
              poolShare: new BigNumber('0.5'),
              rewardAmount: new BigNumber('500'),
            },
          ],
          accountAddresses: new Map([
            [UserId.make(user1.id), AccountAddress(account1.address)],
            [UserId.make(user2.id), AccountAddress(account2.address)],
          ]),
        });

        const saved = yield* db.use((db) => db.select().from(userSeasonReward));

        expect(saved).toHaveLength(2);

        const user1Saved = saved.find((r) => r.userId === user1.id);
        const user2Saved = saved.find((r) => r.userId === user2.id);

        expect(user1Saved?.amount).toBe('500.000000');
        expect(user1Saved?.accountAddress).toBe(account1.address);
        expect(user2Saved?.amount).toBe('500.000000');
        expect(user2Saved?.accountAddress).toBe(account2.address);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'saveSeasonRewards - filters out users without account addresses',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { season1, user1, user2, account1 } = yield* testSetup;

        yield* service.saveSeasonRewards({
          seasonId: SeasonId.make(season1.id),
          rewards: [
            {
              userId: UserId.make(user1.id),
              totalPoints: Points('500'),
              seasonBonus: SeasonBonus('0.1'),
              poolShare: new BigNumber('0.5'),
              rewardAmount: new BigNumber('500'),
            },
            {
              userId: UserId.make(user2.id),
              totalPoints: Points('500'),
              seasonBonus: SeasonBonus('0'),
              poolShare: new BigNumber('0.5'),
              rewardAmount: new BigNumber('500'),
            },
          ],
          // Only user1 has an account address
          accountAddresses: new Map([
            [UserId.make(user1.id), AccountAddress(account1.address)],
          ]),
        });

        const saved = yield* db.use((db) => db.select().from(userSeasonReward));

        expect(saved).toHaveLength(1);
        expect(saved[0].userId).toBe(user1.id);
      }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('saveSeasonRewards - upserts on conflict', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const db = yield* DbService;
      const { season1, user1, account1 } = yield* testSetup;

      // First save
      yield* service.saveSeasonRewards({
        seasonId: SeasonId.make(season1.id),
        rewards: [
          {
            userId: UserId.make(user1.id),
            totalPoints: Points('500'),
            seasonBonus: SeasonBonus('0.1'),
            poolShare: new BigNumber('0.5'),
            rewardAmount: new BigNumber('500'),
          },
        ],
        accountAddresses: new Map([
          [UserId.make(user1.id), AccountAddress(account1.address)],
        ]),
      });

      // Second save with different amount
      yield* service.saveSeasonRewards({
        seasonId: SeasonId.make(season1.id),
        rewards: [
          {
            userId: UserId.make(user1.id),
            totalPoints: Points('600'),
            seasonBonus: SeasonBonus('0.15'),
            poolShare: new BigNumber('0.6'),
            rewardAmount: new BigNumber('750'),
          },
        ],
        accountAddresses: new Map([
          [UserId.make(user1.id), AccountAddress(account1.address)],
        ]),
      });

      const saved = yield* db.use((db) => db.select().from(userSeasonReward));

      expect(saved).toHaveLength(1);
      expect(saved[0].amount).toBe('750.000000');
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getUserSeasonReward - returns None when no reward exists', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const { season1, user1 } = yield* testSetup;

      const result = yield* service.getUserSeasonReward({
        userId: UserId.make(user1.id),
        seasonId: SeasonId.make(season1.id),
      });

      expect(Option.isNone(result)).toBe(true);
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect('getUserSeasonReward - returns reward when it exists', () =>
    Effect.gen(function* () {
      const service = yield* SeasonRewardService;
      const db = yield* DbService;
      const { season1, user1, account1 } = yield* testSetup;

      yield* db.use((db) =>
        db.insert(userSeasonReward).values({
          userId: user1.id,
          seasonId: season1.id,
          amount: '1234.567890',
          accountAddress: account1.address,
        }),
      );

      const result = yield* service.getUserSeasonReward({
        userId: UserId.make(user1.id),
        seasonId: SeasonId.make(season1.id),
      });

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value.amount.toString()).toBe('1234.56789');
        expect(result.value.accountAddress).toBe(account1.address);
      }
    }).pipe(Effect.provide(DbService.Default)),
  );

  it.effect(
    'getUserSeasonReward - returns correct reward for specific season',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { season1, season2, user1, account1 } = yield* testSetup;

        // Insert rewards for both seasons
        yield* db.use((db) =>
          db.insert(userSeasonReward).values([
            {
              userId: user1.id,
              seasonId: season1.id,
              amount: '100',
              accountAddress: account1.address,
            },
            {
              userId: user1.id,
              seasonId: season2.id,
              amount: '200',
              accountAddress: account1.address,
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

        expect(Option.isSome(result1)).toBe(true);
        expect(Option.isSome(result2)).toBe(true);

        if (Option.isSome(result1) && Option.isSome(result2)) {
          expect(result1.value.amount.toString()).toBe('100');
          expect(result2.value.amount.toString()).toBe('200');
        }
      }).pipe(Effect.provide(DbService.Default)),
  );
});

// Test with zero total tokens to vest (error case)
const ZeroVesterLayer = SeasonRewardService.DefaultWithoutDependencies.pipe(
  Layer.provide(createMockVesterStateService('0')),
  Layer.provide(Logger.pretty),
  Layer.provide(DbService.Default),
);

layer(ZeroVesterLayer)('SeasonRewardService - Zero Total Tokens', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });

  it.effect(
    'calculateSeasonReward - fails when total tokens to vest is zero',
    () =>
      Effect.gen(function* () {
        const service = yield* SeasonRewardService;
        const db = yield* DbService;
        const { user1, season1, week1 } = yield* testSetup;

        yield* db.use((db) =>
          db.insert(userSeasonPoints).values({
            userId: user1.id,
            seasonId: season1.id,
            weekId: week1.id,
            points: '500',
          }),
        );

        const result = yield* service
          .calculateSeasonReward({
            seasonId: SeasonId.make(season1.id),
            rewardBudget: new BigNumber('1000'),
            componentAddress: ComponentAddress('component_test_address'),
            networkId: NetworkId.make(2),
          })
          .pipe(
            Effect.catchTag('TotalTokensToVestError', (e) => Effect.succeed(e)),
          );

        expect(result).toHaveProperty('_tag', 'TotalTokensToVestError');
      }).pipe(Effect.provide(DbService.Default)),
  );
});
