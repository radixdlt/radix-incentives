import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accountBalances } from "db/incentives";
import { sql } from "drizzle-orm";

const BATCH_SIZE = 5000; // PostgreSQL typically has a limit of 65535 parameters, so we'll use a safe batch size

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
      Effect.tryPromise({
        try: async () => {
          // Process in batches
          for (let i = 0; i < input.length; i += BATCH_SIZE) {
            const batch = input.slice(i, i + BATCH_SIZE);
            await db
              .insert(accountBalances)
              .values(
                batch.map(
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
              });
          }
        },
        catch: (error) => new DbError(error),
      });
  })
);
