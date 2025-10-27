import { it, layer } from '@effect/vitest';
import { resourceRewardClaims } from 'db/incentives';
import { Effect, Layer, Logger } from 'effect';
import { groupBy } from 'effect/Array';
import { vi } from 'vitest';
import {
  GetEntityDetailsService,
  GetLedgerStateService,
  GetNonFungibleBalanceService,
} from '../../common/gateway';
import { createSeasonAndWeek } from '../../test-helpers/createSeasonAndWeek';
import { createUser } from '../../test-helpers/createUser';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbClientService, dbClientLive } from '../db/dbClient';
import { SeasonService } from '../season/season';
import { UserService } from '../user/user';
import { WeekService } from '../week/week';
import {
  ResourceRewardDefinition,
  ResourceRewardService,
} from './resourceReward';
import { ResourceRewardHelpers } from './resourceRewardHelpers';

const mockGetNonFungibleBalanceResponse = vi.fn();

const mockGetNonFungibleBalanceService = Effect.provideService(
  GetNonFungibleBalanceService,
  new GetNonFungibleBalanceService(mockGetNonFungibleBalanceResponse),
);

const mockGetLedgerStateResponse = vi.fn();

const mockGetLedgerStateService = Effect.provideService(
  GetLedgerStateService,
  new GetLedgerStateService(mockGetLedgerStateResponse),
);

const ResourceRewardServiceLive =
  ResourceRewardService.DefaultWithoutDependencies.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(UserService.Default),
    Layer.provide(GetEntityDetailsService.Default),
    Layer.provide(SeasonService.Default),
    Layer.provide(WeekService.Default),
  );

const testResources = {
  taox: new ResourceRewardDefinition({
    address:
      'resource_rdx1ngm27j7zpwx2m3jkflxtlq9grfkf4f6xpgz9vxzuplx0fd7egh9sx7',
    points: 25,
    weeklyLimit: undefined,
  }),
  xrdDomain: new ResourceRewardDefinition({
    address:
      'resource_rdx1n2dd0w53zpdlqdz65vpymygj8a60vqnggyuxfpfdldjmy2224x020q',
    points: 10,
    weeklyLimit: 25,
  }),
} as const;

const TestSetup = Effect.gen(function* () {
  const userA = yield* createUser;
  const userB = yield* createUser;

  const { week, season } = yield* createSeasonAndWeek();

  return {
    userA: userA.user,
    userB: userB.user,
    accountA: userA.account,
    accountB: userB.account,
    week,
    season,
  };
});

layer(ResourceRewardService.Default)('resourceReward', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });

  it.effect('should create a resource reward definition', () =>
    Effect.gen(function* () {
      const service = yield* ResourceRewardService;

      yield* service.createResourceRewardDefinition(testResources.taox);

      const [result] = yield* service.listResourceRewardDefinitions();

      expect(result).toHaveProperty('address', testResources.taox.address);
      expect(result).toHaveProperty('points', testResources.taox.points);
      expect(result).toHaveProperty('iconUrl', 'https://taox.app/terra.png');
      expect(result).toHaveProperty('name', "Terracotta Army of Xi'an");
    }).pipe(Effect.provide(Logger.pretty)),
  );

  it.effect(
    'should fail to claim resource reward with a non-existing resource reward definition',
    () =>
      Effect.gen(function* () {
        const service = yield* ResourceRewardService;
        const testSetup = yield* TestSetup;

        const result = yield* service
          .createResourceRewardClaim({
            resourceManager: 'resource_rdx1111',
            userId: testSetup.userA.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          })
          .pipe(
            Effect.catchTag('ResourceNotFoundError', () =>
              Effect.succeed('ResourceNotFoundError'),
            ),
          );

        expect(result).toBe('ResourceNotFoundError');
      }),
  );

  it.effect(
    'should fail to claim resource reward if user does not hold resource',
    () =>
      Effect.gen(function* () {
        const service = yield* ResourceRewardService;
        const testSetup = yield* TestSetup;

        yield* service.createResourceRewardDefinition(testResources.taox);

        const result = yield* service
          .createResourceRewardClaim({
            resourceManager: testResources.taox.address,
            userId: testSetup.userA.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          })
          .pipe(
            Effect.catchTag('UserDoesNotHoldResourceError', () =>
              Effect.succeed('UserDoesNotHoldResourceError'),
            ),
          );

        expect(result).toBe('UserDoesNotHoldResourceError');
      }),
  );

  it.effect('should aggregate points by week id', () => {
    return Effect.gen(function* () {
      const service = yield* ResourceRewardService;
      const testSetup = yield* TestSetup;
      const db = yield* DbClientService;

      const { user } = yield* createUser;

      yield* service.createResourceRewardDefinition(testResources.taox);
      yield* service.createResourceRewardDefinition(testResources.xrdDomain);

      yield* Effect.promise(() =>
        db.insert(resourceRewardClaims).values([
          {
            resourceManager: testResources.taox.address,
            localId: '1',
            userId: user.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          },
          {
            resourceManager: testResources.taox.address,
            localId: '2',
            userId: user.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          },
          {
            resourceManager: testResources.xrdDomain.address,
            localId: '1',
            userId: user.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          },
        ]),
      );

      const results = yield* service.getAggregatedResourceRewardClaimsByWeekId({
        weekId: testSetup.week.id,
      });

      expect(results[0]).toHaveProperty(
        'points',
        `${testResources.taox.points * 2 + testResources.xrdDomain.points}`,
      );
    }).pipe(Effect.provide(dbClientLive), Effect.provide(Logger.pretty));
  });

  it.effect('should list claimed rewards by week id', () => {
    return Effect.gen(function* () {
      const service = yield* ResourceRewardService;
      const testSetup = yield* TestSetup;
      const db = yield* DbClientService;

      const users = yield* Effect.all(
        new Array(100).fill(0).map(() => createUser),
        { concurrency: 25 },
      );

      yield* service.createResourceRewardDefinition(testResources.taox);

      yield* Effect.forEach(users, ({ user }, index) =>
        Effect.gen(function* () {
          yield* Effect.promise(() =>
            db.insert(resourceRewardClaims).values({
              resourceManager: testResources.taox.address,
              userId: user.id,
              weekId: testSetup.week.id,
              seasonId: testSetup.season.id,
            }),
          );

          if (index % 2 === 0) {
            yield* Effect.promise(() =>
              db.insert(resourceRewardClaims).values({
                resourceManager: testResources.taox.address,
                userId: user.id,
                weekId: testSetup.week.id,
                seasonId: testSetup.season.id,
              }),
            );
          }
        }),
      );

      const result = yield* service.getAggregatedResourceRewardClaimsByWeekId({
        weekId: testSetup.week.id,
      });

      const groupByPoints = groupBy(result, (item) => item.points ?? '0');

      expect(groupByPoints['50']).toHaveLength(50);
      expect(groupByPoints['25']).toHaveLength(50);
    }).pipe(Effect.provide(dbClientLive), Effect.provide(Logger.pretty));
  });

  it.effect('should limit points by weekly limit', () => {
    return Effect.gen(function* () {
      const service = yield* ResourceRewardService;
      const testSetup = yield* TestSetup;
      const db = yield* DbClientService;

      const { user } = yield* createUser;

      yield* service.createResourceRewardDefinition(testResources.xrdDomain);

      // user has claimed 5 XRD domains (5 * 10 = 50 points) but weekly limit caps at 25 points
      yield* Effect.promise(() =>
        db.insert(resourceRewardClaims).values([
          {
            resourceManager: testResources.xrdDomain.address,
            localId: '1',
            userId: user.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          },
          {
            resourceManager: testResources.xrdDomain.address,
            localId: '2',
            userId: user.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          },
          {
            resourceManager: testResources.xrdDomain.address,
            localId: '3',
            userId: user.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          },
          {
            resourceManager: testResources.xrdDomain.address,
            localId: '4',
            userId: user.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          },
          {
            resourceManager: testResources.xrdDomain.address,
            localId: '5',
            userId: user.id,
            weekId: testSetup.week.id,
            seasonId: testSetup.season.id,
          },
        ]),
      );

      const results = yield* service.getAggregatedResourceRewardClaimsByWeekId({
        weekId: testSetup.week.id,
      });

      expect(results[0]).toHaveProperty(
        'points',
        `${testResources.xrdDomain.weeklyLimit}`,
      );
    }).pipe(Effect.provide(dbClientLive), Effect.provide(Logger.pretty));
  });
});

describe('resourceReward', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  it.effect('should claim resource reward', () => {
    return Effect.gen(function* () {
      const service = yield* ResourceRewardService;
      const testSetup = yield* TestSetup;

      yield* service.createResourceRewardDefinition(testResources.taox);

      // Mock ledger state for pagination support
      mockGetLedgerStateResponse.mockReturnValue(
        Effect.succeed({
          state_version: 12345,
          proposer_round_timestamp: new Date().toISOString(),
          epoch: 1,
          round: 1,
        }),
      );

      // user A claims two resources
      mockGetNonFungibleBalanceResponse.mockReturnValue(
        Effect.succeed({
          items: [
            {
              nonFungibleResources: [{ items: [{ id: '123' }, { id: '456' }] }],
            },
          ],
        }),
      );

      yield* service.createResourceRewardClaim({
        resourceManager: testResources.taox.address,
        userId: testSetup.userA.id,
        weekId: testSetup.week.id,
        seasonId: testSetup.season.id,
      });

      // simulate user B claiming the same resource again
      mockGetNonFungibleBalanceResponse.mockReturnValue(
        Effect.succeed({
          items: [
            {
              nonFungibleResources: [{ items: [{ id: '456' }] }],
            },
          ],
        }),
      );

      yield* service.createResourceRewardClaim({
        resourceManager: testResources.taox.address,
        userId: testSetup.userB.id,
        weekId: testSetup.week.id,
        seasonId: testSetup.season.id,
      });

      const [resultA, resultB] = yield* Effect.all([
        service.getResourceRewardClaimsByUserId({
          userId: testSetup.userA.id,
          weekId: testSetup.week.id,
        }),
        service.getResourceRewardClaimsByUserId({
          userId: testSetup.userB.id,
          weekId: testSetup.week.id,
        }),
      ]);

      expect(resultA.claims).toHaveLength(1);
      expect(resultA.claims[0].localId).toBe('123');

      expect(resultB.claims).toHaveLength(1);
      expect(resultB.claims[0].localId).toBe('456');
    }).pipe(
      Effect.provide(ResourceRewardServiceLive),
      Effect.provide(
        ResourceRewardHelpers.DefaultWithoutDependencies.pipe(
          Layer.provide(dbClientLive),
        ),
      ),
      mockGetNonFungibleBalanceService,
      mockGetLedgerStateService,
      Effect.provide(Logger.pretty),
    );
  });
});
