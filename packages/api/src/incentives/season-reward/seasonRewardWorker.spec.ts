import { layer } from '@effect/vitest';
import { seasons, userSeasonReward, users } from 'db/incentives';
import { Effect, Layer, Logger } from 'effect';
import { SeasonId, UserId } from 'shared/brandedTypes';
import { RedisLockTest } from '../../common/redis/redisLock.test-layer';
import { createAccount } from '../../test-helpers/createAccount';
import { DisableTestClock } from '../../test-helpers/disableTestClock';
import { truncateTables } from '../../test-helpers/truncateTables';
import { AccountAddress, Amount } from '../account-balance/v2/schemas';
import { DbService } from '../db/dbClient';
import { Signer } from '../transaction-intent/signer/signer';
import { IncentivesVesterConfig } from './incentives-vester/config';
import { IncentivesVester } from './incentives-vester/incentivesVester';
import { InvalidAmountError, SeasonRewardClaim } from './seasonRewardClaim';
import { SeasonRewardWorker } from './seasonRewardWorker';

process.env.NOTARIZER_PRIVATE_KEY =
  'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

const testSetup = Effect.gen(function* () {
  const db = yield* DbService;

  const accountA = yield* createAccount({ networkId: 2 });
  const accountB = yield* createAccount({ networkId: 2 });

  const result = yield* db.use(async (db) => {
    const [season] = await db
      .insert(seasons)
      .values({
        name: 'Season 1',
        status: 'active',
      })
      .returning();

    const [user] = await db
      .insert(users)
      .values({
        identityAddress: crypto.randomUUID(),
        label: 'Test User',
      })
      .returning();

    const userA = {
      userId: UserId.make(user.id),
      accountAddress: AccountAddress(accountA.address),
    };
    const userB = {
      userId: UserId.make(user.id),
      accountAddress: AccountAddress(accountB.address),
    };

    await db
      .insert(userSeasonReward)
      .values({
        userId: userA.userId,
        seasonId: season.id,
        accountAddress: accountA.address,
        amount: '100',
      })
      .returning();

    return {
      seasonId: SeasonId.make(season.id),
      userA,
      userB,
    };
  });

  return result;
}).pipe(Effect.tapError(Effect.logError), Effect.provide(DbService.Default));

layer(
  SeasonRewardWorker.DefaultWithoutDependencies.pipe(
    Layer.provide(
      Layer.mergeAll(
        SeasonRewardClaim.Default,
        IncentivesVester.Default.pipe(
          Layer.provide(
            Layer.effect(
              IncentivesVesterConfig,
              IncentivesVesterConfig.StokenetConfig,
            ),
          ),
        ),
        RedisLockTest,
      ),
    ),
  ),
)('SeasonRewardWorker', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });
  it.effect.skip('should claim a season reward', () =>
    Effect.gen(function* () {
      const seasonRewardWorker = yield* SeasonRewardWorker;
      const seasonRewardClaim = yield* SeasonRewardClaim;

      const { seasonId, userA } = yield* testSetup;

      yield* DisableTestClock(
        seasonRewardWorker.claim({
          seasonId,
          userId: userA.userId,
          accountAddress: userA.accountAddress,
          claimAmount: Amount('1'),
        }),
      );

      const totalClaimableAmount =
        yield* seasonRewardClaim.getTotalClaimedAmount({
          userId: userA.userId,
          seasonId,
          includePending: true,
        });

      expect(parseInt(totalClaimableAmount)).toBe(1);
    }).pipe(
      Effect.provide(Signer.VaultLive),
      Effect.provide(Logger.pretty),
      Effect.provide(SeasonRewardClaim.Default),
    ),
  );
  it.effect.skip(
    'should fail to claim a season reward if claim amount is greater than total claimable amount',
    () =>
      Effect.gen(function* () {
        const seasonRewardWorker = yield* SeasonRewardWorker;

        const { seasonId, userA } = yield* testSetup;

        const result = yield* DisableTestClock(
          seasonRewardWorker.claim({
            seasonId,
            userId: userA.userId,
            accountAddress: userA.accountAddress,
            claimAmount: Amount('10000'),
          }),
        ).pipe(
          Effect.catchTags({
            InvalidAmountError: (error) => Effect.succeed(error),
          }),
        );

        expect(result).toBeInstanceOf(InvalidAmountError);
      }).pipe(Effect.provide(Signer.VaultLive), Effect.provide(Logger.pretty)),
  );
});
