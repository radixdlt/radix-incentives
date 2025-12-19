import BigNumber from 'bignumber.js';
import { userSeasonReward, userSeasonRewardClaims } from 'db/incentives';
import { and, eq, inArray, sum } from 'drizzle-orm';
import {
  Array as A,
  Data,
  DateTime,
  Effect,
  flow,
  Option,
  ParseResult,
  Record as R,
  Schema,
} from 'effect';
import { SeasonId, TransactionId, UserId } from 'shared/brandedTypes';
import { AccountAddress, Amount } from '../account-balance/v2/schemas';
import { DbService } from '../db/dbClient';
import {
  type TransactionIntent,
  TransactionIntentSchema,
} from '../transaction-intent/schemas';

export class InvalidAmountError extends Data.TaggedError('InvalidAmountError')<{
  message: string;
}> {}

const PendingTransactionSchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.Struct({
      transactionId: Schema.String,
      userId: Schema.UUID,
      seasonId: Schema.String,
      amount: Schema.String,
      status: Schema.Literal('pending', 'failed', 'success'),
      data: Schema.Unknown,
      accountAddress: Schema.String,
    }),
    Schema.Struct({
      transactionId: TransactionId,
      userId: UserId,
      seasonId: SeasonId,
      status: Schema.Literal('pending'),
      amount: Schema.String.pipe(Schema.fromBrand(Amount)),
      transactionIntent: Schema.propertySignature(TransactionIntentSchema).pipe(
        Schema.fromKey('data'),
      ),
      accountAddress: Schema.String.pipe(Schema.fromBrand(AccountAddress)),
    }),
    {
      strict: false,
      decode: (input) => Effect.succeed(input),
      encode: (value, _, ast) =>
        ParseResult.fail(
          new ParseResult.Forbidden(
            ast,
            value,
            'Encoding pending transactions back to plain object is forbidden.',
          ),
        ),
    },
  ),
);

export class SeasonRewardClaim extends Effect.Service<SeasonRewardClaim>()(
  'SeasonRewardClaim',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;

      const getPendingTransactions = (input: {
        userId: UserId;
        seasonId: SeasonId;
      }) =>
        db
          .use((db) =>
            db
              .select()
              .from(userSeasonRewardClaims)
              .where(
                and(
                  eq(userSeasonRewardClaims.seasonId, input.seasonId),
                  eq(userSeasonRewardClaims.userId, input.userId),
                  eq(userSeasonRewardClaims.status, 'pending'),
                ),
              ),
          )
          .pipe(
            Effect.flatMap((items) =>
              Schema.decodeUnknown(Schema.Array(PendingTransactionSchema))(
                items,
              ),
            ),
            Effect.orDie,
          );

      const getTotalClaimableAmount = (input: {
        userId: UserId;
        seasonId: SeasonId;
      }) =>
        db
          .use((db) =>
            db
              .select({
                totalClaimableAmount: sum(userSeasonReward.amount),
              })
              .from(userSeasonReward)
              .where(
                and(
                  eq(userSeasonReward.userId, input.userId),
                  eq(userSeasonReward.seasonId, input.seasonId),
                ),
              ),
          )
          .pipe(
            Effect.map(
              flow(
                A.head,
                Option.flatMap(R.get('totalClaimableAmount')),
                Option.flatMap(Option.fromNullable),
                Option.map(Amount),
                Option.getOrElse(() => Amount('0')),
              ),
            ),
            Effect.orDie,
          );

      const getTotalClaimedAmount = (input: {
        userId: UserId;
        seasonId: SeasonId;
        includePending: boolean;
      }) =>
        db
          .use((db) =>
            db
              .select({
                totalClaimedAmount: sum(userSeasonRewardClaims.amount),
              })
              .from(userSeasonRewardClaims)
              .where(
                and(
                  inArray(
                    userSeasonRewardClaims.status,
                    input.includePending ? ['success', 'pending'] : ['success'],
                  ),
                  eq(userSeasonRewardClaims.userId, input.userId),
                  eq(userSeasonRewardClaims.seasonId, input.seasonId),
                ),
              ),
          )
          .pipe(
            Effect.map(
              flow(
                A.head,
                Option.flatMap(R.get('totalClaimedAmount')),
                Option.flatMap(Option.fromNullable),
                Option.map(Amount),
                Option.getOrElse(() => Amount('0')),
              ),
            ),
            Effect.orDie,
          );

      const create = (input: {
        userId: UserId;
        seasonId: SeasonId;
        amount: Amount;
        accountAddress: AccountAddress;
        transactionIntent: TransactionIntent;
        transactionId: TransactionId;
      }) =>
        Schema.encodeUnknown(TransactionIntentSchema)(
          input.transactionIntent,
        ).pipe(
          Effect.flatMap((transactionIntent) =>
            db.use((db) =>
              db
                .insert(userSeasonRewardClaims)
                .values([
                  {
                    transactionId: input.transactionId,
                    userId: input.userId,
                    amount: input.amount,
                    seasonId: input.seasonId,
                    data: transactionIntent,
                    accountAddress: input.accountAddress,
                  },
                ])
                .onConflictDoNothing(),
            ),
          ),
        );

      const markAsFailed = (transactionId: TransactionId) =>
        db.use((db) =>
          db
            .update(userSeasonRewardClaims)
            .set({
              status: 'failed',
              data: {},
              updatedAt: DateTime.unsafeNow().pipe(DateTime.toDate),
            })
            .where(eq(userSeasonRewardClaims.transactionId, transactionId)),
        );

      const markAsSuccess = (transactionId: TransactionId) =>
        db.use((db) =>
          db
            .update(userSeasonRewardClaims)
            .set({
              status: 'success',
              data: {},
              updatedAt: DateTime.unsafeNow().pipe(DateTime.toDate),
            })
            .where(eq(userSeasonRewardClaims.transactionId, transactionId)),
        );

      return {
        verifyClaimAmount: (input: {
          userId: UserId;
          seasonId: SeasonId;
          claimAmount: Amount;
        }) =>
          Effect.gen(function* () {
            const [totalClaimableAmount, totalClaimedAmount] =
              yield* Effect.all(
                [
                  getTotalClaimableAmount({
                    userId: input.userId,
                    seasonId: input.seasonId,
                  }),
                  getTotalClaimedAmount({
                    userId: input.userId,
                    seasonId: input.seasonId,
                    includePending: true,
                  }),
                ],
                { concurrency: 'unbounded' },
              );

            const isWithinBounds = new BigNumber(totalClaimableAmount)
              .minus(totalClaimedAmount)
              .gte(input.claimAmount);

            if (!isWithinBounds) {
              return yield* new InvalidAmountError({
                message: `Claim amount is greater than the total claimable amount`,
              });
            }
          }),

        getUnresolved: getPendingTransactions,
        markAsFailed,
        create,
        markAsSuccess,
        getTotalClaimedAmount,
        getTotalClaimableAmount,
      };
    }),
  },
) {}
