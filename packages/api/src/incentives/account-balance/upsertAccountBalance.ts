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
  (
    input: UpsertAccountBalanceInput
  ) => Effect.Effect<void, DbError, DbClientService>
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
              // Create the VALUES array for sql template
              const values = items.map(({ timestamp, accountAddress, data = {} }) => 
                sql`(${timestamp}, ${accountAddress}, ${JSON.stringify(data)}::jsonb)`
              );

              const query = sql`
                INSERT INTO account_balances (timestamp, account_address, data)
                VALUES ${sql.join(values, sql`, `)}
                ON CONFLICT (account_address, timestamp)
                DO UPDATE SET data = EXCLUDED.data
              `;

              await db.execute(query);
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
