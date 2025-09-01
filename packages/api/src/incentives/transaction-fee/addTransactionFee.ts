import type BigNumber from 'bignumber.js';
import { transactionFees } from 'db/incentives';
import { Effect } from 'effect';
import { DbService } from '../db/dbClient';

export type AddTransactionFeeServiceInput = {
  txId: string;
  accountAddress: string;
  fee: BigNumber;
  timestamp: Date;
}[];

export class AddTransactionFeeService extends Effect.Service<AddTransactionFeeService>()(
  'AddTransactionFeeService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;
      return Effect.fn(function* (input: AddTransactionFeeServiceInput) {
        // Implementation goes here
        return yield* db
          .insert(transactionFees)
          .values(
            input.map((t) => ({
              transactionId: t.txId,
              accountAddress: t.accountAddress,
              fee: t.fee.toString(),
              timestamp: t.timestamp,
            })),
          )
          .onConflictDoNothing();
      });
    }),
  },
) {}
