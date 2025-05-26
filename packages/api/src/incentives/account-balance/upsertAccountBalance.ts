import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { sql } from "drizzle-orm";
import { accountBalances } from "db/incentives";

type UpsertAccountBalanceInput = {
  timestamp: Date;
  address: string;
  usdValue: string;
  activityId: string;
  data: Record<string, string>;
}[];

export class UpsertAccountBalancesService extends Context.Tag(
  "UpsertAccountBalancesService"
)<
  UpsertAccountBalancesService,
  (
    input: UpsertAccountBalanceInput
  ) => Effect.Effect<void, DbError, DbClientService>
>() {}

export const UpsertAccountBalancesLive = Layer.effect(
  UpsertAccountBalancesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db
              .insert(accountBalances)
              .values(
                input.map(
                  ({
                    timestamp,
                    address: accountAddress,
                    usdValue,
                    activityId,
                    data,
                  }) => ({
                    timestamp,
                    accountAddress,
                    activityId,
                    data,
                    usdValue,
                  })
                )
              )
              .onConflictDoUpdate({
                target: [
                  accountBalances.accountAddress,
                  accountBalances.timestamp,
                  accountBalances.activityId,
                ],
                set: {
                  usdValue: sql`excluded.usd_value`,
                  data: sql`excluded.data`,
                },
              }),
          catch: (error) => new DbError(error),
        });
      });
  })
);
