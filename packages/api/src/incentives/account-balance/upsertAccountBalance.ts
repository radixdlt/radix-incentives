import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accountBalances } from "db/incentives";
import { sql } from "drizzle-orm";
import { chunker } from "../../common";

const BATCH_SIZE = Number.parseInt(process.env.INSERT_BATCH_SIZE || "5000"); // PostgreSQL typically has a limit of 65535 parameters, so we'll use a safe batch size

type UpsertAccountBalanceInput = {
  timestamp: Date;
  accountAddress: string;
  data?: unknown;
}[];

export class UpsertAccountBalancesService extends Context.Tag(
  "UpsertAccountBalancesService"
)<
  UpsertAccountBalancesService,
  (input: UpsertAccountBalanceInput) => Effect.Effect<void, DbError>
>() {}

export const UpsertAccountBalancesLive = Layer.effect(
  UpsertAccountBalancesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        const makeRequest = (items: UpsertAccountBalanceInput) =>
          Effect.tryPromise({
            try: async () => {
              await db
                .insert(accountBalances)
                .values(
                  items.map(({ timestamp, accountAddress, data = {} }) => ({
                    timestamp,
                    accountAddress,
                    data,
                  }))
                )
                .onConflictDoUpdate({
                  target: [
                    accountBalances.accountAddress,
                    accountBalances.timestamp,
                  ],
                  set: {
                    data: sql`excluded.data`,
                  },
                });
            },
            catch: (error) => new DbError(error),
          }).pipe(Effect.withSpan("upsertAccountBalancesBatch"));

        yield* Effect.forEach(chunker(input, BATCH_SIZE), makeRequest, {
          concurrency: 1,
        });
      });
    };
  })
);
