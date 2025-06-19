import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { transactionFees } from "db/incentives";
import type BigNumber from "bignumber.js";

export type AddTransactionFeeServiceInput = {
  txId: string;
  accountAddress: string;
  fee: BigNumber;
  timestamp: Date;
}[];

export class AddTransactionFeeService extends Context.Tag(
  "AddTransactionFeeService"
)<
  AddTransactionFeeService,
  (
    input: AddTransactionFeeServiceInput
  ) => Effect.Effect<void, DbError, DbClientService>
>() {}

export const AddTransactionFeeLive = Layer.effect(
  AddTransactionFeeService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        if (input.length === 0) return;
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .insert(transactionFees)
              .values(
                input.map((t) => ({
                  transactionId: t.txId,
                  accountAddress: t.accountAddress,
                  fee: t.fee.toString(),
                  timestamp: t.timestamp,
                }))
              )
              .onConflictDoNothing(),
          catch: (error) => new DbError(error),
        });

        return result;
      });
    };
  })
);
