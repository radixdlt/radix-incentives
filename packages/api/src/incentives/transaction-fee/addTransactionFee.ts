import type BigNumber from 'bignumber.js';
import { transactionFees } from 'db/incentives';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export type AddTransactionFeeServiceInput = {
  txId: string;
  accountAddress: string;
  fee: BigNumber;
  timestamp: Date;
}[];

export class AddTransactionFeeService extends Effect.Service<AddTransactionFeeService>()(
  'AddTransactionFeeService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fn(function* (input: AddTransactionFeeServiceInput) {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .insert(transactionFees)
              .values(
                input.map((t) => ({
                  transactionId: t.txId,
                  accountAddress: t.accountAddress,
                  fee: t.fee.toString(),
                  timestamp: t.timestamp,
                })),
              )
              .onConflictDoNothing(),
          catch: (error) => new DbError(error),
        });
      });
    }),
  },
) {}
