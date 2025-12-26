import { Data, Duration, Effect, Option, Ref, Schema } from 'effect';
import {
  AccountAddress,
  Amount,
  SeasonId,
  type TransactionId,
  UserId,
} from 'shared/brandedTypes';
import { RedisLock } from '../../common/redis/redisLock';
import { SeasonService } from '../season/season';
import { TransactionLifeCycleHook } from '../transaction-intent/transactionHelper';
import { IncentivesVesterConfig } from './incentives-vester/config';
import { IncentivesVester } from './incentives-vester/incentivesVester';
import { SeasonRewardClaim } from './seasonRewardClaim';

export const SeasonRewardWorkerInputSchema = Schema.Struct({
  seasonId: SeasonId,
  userId: UserId,
  accountAddress: AccountAddress,
  claimAmount: Amount,
});

export type SeasonRewardWorkerInput = typeof SeasonRewardWorkerInputSchema.Type;

export class UnresolvedTransactionError extends Data.TaggedError(
  'UnresolvedTransactionError',
)<{
  message: string;
  transactionId: TransactionId;
}> {}

export class MissingConfigError extends Data.TaggedError(
  'SeasonRewardWorker.MissingConfigError',
)<{
  message: string;
}> {}

export class SeasonRewardWorker extends Effect.Service<SeasonRewardWorker>()(
  'SeasonRewardWorker',
  {
    dependencies: [
      IncentivesVester.MainnetLive,
      SeasonRewardClaim.Default,
      RedisLock.Default,
      SeasonService.Default,
    ],
    effect: Effect.gen(function* () {
      const incentivesVester = yield* IncentivesVester;
      const seasonRewardClaim = yield* SeasonRewardClaim;
      const redisLock = yield* RedisLock;
      const seasonService = yield* SeasonService;
      const incentivesVesterConfig = yield* IncentivesVesterConfig;

      const handleUnresolvedTransaction = (input: {
        seasonId: SeasonId;
        userId: UserId;
      }) =>
        Effect.gen(function* () {
          const unresolvedTransactions = yield* seasonRewardClaim.getUnresolved(
            {
              seasonId: input.seasonId,
              userId: input.userId,
            },
          );

          yield* Effect.forEach(unresolvedTransactions, (transaction) =>
            incentivesVester
              .claim({
                amount: transaction.amount,
                accountAddress: transaction.accountAddress,
                transactionIntent: transaction.transactionIntent,
              })
              .pipe(
                Effect.provideService(TransactionLifeCycleHook, {
                  onStatusFailure: (input) =>
                    Effect.gen(function* () {
                      if (input.permanent) {
                        yield* seasonRewardClaim
                          .markAsFailed(input.id)
                          .pipe(Effect.orDie);
                      }

                      return yield* Effect.die(
                        new UnresolvedTransactionError({
                          message:
                            'Transaction with unresolved status, try again later',
                          transactionId: input.id,
                        }),
                      );
                    }),
                  onSuccess: (input) =>
                    seasonRewardClaim
                      .markAsSuccess(input.id)
                      .pipe(Effect.orDie),
                }),
                Effect.catchTags({
                  InvalidEndEpochError: (error) =>
                    seasonRewardClaim.markAsFailed(error.transactionId),
                }),
              ),
          );
        });

      const claim = (input: typeof SeasonRewardWorkerInputSchema.Type) =>
        Effect.gen(function* () {
          const { seasonId, userId, claimAmount, accountAddress } = input;
          const {
            adminAccount,
            adminBadge,
            rewardsResourceAddress,
            seasonRewardComponentAddress,
          } = yield* seasonService.getConfig(seasonId);

          if (seasonRewardComponentAddress === null) {
            return yield* Effect.die(
              new MissingConfigError({
                message: 'Season reward component address not configured',
              }),
            );
          }

          if (adminAccount === null) {
            return yield* Effect.die(
              new MissingConfigError({
                message: 'Admin account not configured',
              }),
            );
          }

          if (adminBadge === null) {
            return yield* Effect.die(
              new MissingConfigError({
                message: 'Admin badge not configured',
              }),
            );
          }

          if (rewardsResourceAddress === null) {
            return yield* Effect.die(
              new MissingConfigError({
                message: 'Rewards resource address not configured',
              }),
            );
          }

          yield* Ref.update(incentivesVesterConfig, (config) => ({
            ...config,
            componentAddress: Option.some(seasonRewardComponentAddress),
            adminAccount: Option.some(adminAccount),
            adminBadge: Option.some(adminBadge),
            rewardsResourceAddress: rewardsResourceAddress,
          }));

          // prevents multiple claims of the same season reward
          const lock = yield* redisLock.acquire({
            key: `season-reward-claim:${seasonId}:${userId}`,
            ttlMs: Duration.minutes(1).pipe(Duration.toMillis),
            maxRetries: 3,
            retryDelayMs: Duration.seconds(30).pipe(Duration.toMillis),
          });

          // handle all unresolved transactions before continuing
          yield* handleUnresolvedTransaction({
            seasonId: input.seasonId,
            userId: input.userId,
          });

          // check if user is allowed to claim the amount
          yield* seasonRewardClaim.verifyClaimAmount({
            seasonId: input.seasonId,
            userId: input.userId,
            claimAmount: input.claimAmount,
          });

          yield* incentivesVester
            .claim({
              amount: input.claimAmount,
              accountAddress: input.accountAddress,
            })
            .pipe(
              Effect.provideService(TransactionLifeCycleHook, {
                onSubmit: (input) =>
                  seasonRewardClaim
                    .create({
                      seasonId,
                      userId,
                      amount: claimAmount,
                      accountAddress,
                      transactionIntent: input.intent,
                      transactionId: input.id,
                    })
                    .pipe(Effect.orDie),
                onStatusFailure: (input) =>
                  Effect.gen(function* () {
                    if (input.permanent) {
                      yield* seasonRewardClaim
                        .markAsFailed(input.id)
                        .pipe(Effect.orDie);
                    }
                    yield* redisLock.release(lock).pipe(Effect.orDie);
                    return yield* Effect.die(
                      new UnresolvedTransactionError({
                        message:
                          'Unresolved transaction, please try again later',
                        transactionId: input.id,
                      }),
                    );
                  }),
                onSuccess: (input) =>
                  Effect.gen(function* () {
                    yield* seasonRewardClaim
                      .markAsSuccess(input.id)
                      .pipe(Effect.orDie);
                    yield* redisLock.release(lock).pipe(Effect.orDie);
                  }),
              }),
            );
        });

      return { claim };
    }),
  },
) {}
