import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { transactions } from "db/incentives";
import type { TransformedTransaction } from "./transformEvent";

export class AddTransactionsToDbService extends Context.Tag(
  "AddTransactionsToDbService"
)<
  AddTransactionsToDbService,
  (
    input: TransformedTransaction[]
  ) => Effect.Effect<void, DbError, DbClientService>
>() {}

export const AddTransactionsToDbLive = Layer.effect(
  AddTransactionsToDbService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        if (input.length === 0) return;
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .insert(transactions)
              .values(
                input.map((t) => ({
                  transactionId: t.transactionId,
                  stateVersion: t.stateVersion,
                  timestamp: new Date(t.round_timestamp),
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
