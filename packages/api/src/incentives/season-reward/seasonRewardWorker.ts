import { Data, Duration, Effect, Schema } from 'effect';
import { RedisLock } from '../../common/redis/redisLock';
import { AccountAddress, Amount } from '../account-balance/v2/schemas';
import { SeasonId, type TransactionId, UserId } from '../schemas/brandedTypes';
import { TransactionLifeCycleHook } from '../transaction-intent/transactionHelper';
import { IncentivesVester } from './incentives-vester/incentivesVester';
import { SeasonRewardClaim } from './seasonRewardClaim';

export const SeasonRewardWorkerInputSchema = Schema.Struct({
  seasonId: SeasonId,
  userId: UserId,
  accountAddress: Schema.String.pipe(Schema.fromBrand(AccountAddress)),
  claimAmount: Schema.String.pipe(Schema.fromBrand(Amount)),
});

export class UnresolvedTransactionError extends Data.TaggedError(
  'UnresolvedTransactionError',
)<{
  message: string;
  transactionId: TransactionId;
}> {}

export class SeasonRewardWorker extends Effect.Service<SeasonRewardWorker>()(
  'SeasonRewardWorker',
  {
    dependencies: [
      IncentivesVester.MainnetLive,
      SeasonRewardClaim.Default,
      RedisLock.Default,
    ],
    effect: Effect.gen(function* () {
      const incentivesVester = yield* IncentivesVester;
      const seasonRewardClaim = yield* SeasonRewardClaim;
      const redisLock = yield* RedisLock;

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
