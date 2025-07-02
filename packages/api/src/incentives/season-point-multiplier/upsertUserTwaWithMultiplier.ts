import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { seasonPointsMultiplier } from "db/incentives";
import { sql } from "drizzle-orm";
import { chunker } from "../../common";

const BATCH_SIZE = Number.parseInt(process.env.INSERT_BATCH_SIZE || "5000"); // PostgreSQL typically has a limit of 65535 parameters, so we'll use a safe batch size

export class UpsertUserTwaWithMultiplierService extends Context.Tag(
  "UpsertUserTwaWithMultiplierService"
)<
  UpsertUserTwaWithMultiplierService,
  (
    input: (typeof seasonPointsMultiplier.$inferInsert)[]
  ) => Effect.Effect<void, DbError>
>() {}

export const UpsertUserTwaWithMultiplierLive = Layer.effect(
  UpsertUserTwaWithMultiplierService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        const makeRequest = (items: (typeof seasonPointsMultiplier.$inferInsert)[]) =>
          Effect.tryPromise({
            try: async () => {
              await db
                .insert(seasonPointsMultiplier)
                .values(items)
                .onConflictDoUpdate({
                  target: [
                    seasonPointsMultiplier.userId,
                    seasonPointsMultiplier.weekId,
                  ],
                  set: {
                    multiplier: sql`excluded.multiplier`,
                    totalTWABalance: sql`excluded.total_twa_balance`,
                    cumulativeTWABalance: sql`excluded.cumulative_twa_balance`,
                  },
                });
            },
            catch: (error) => new DbError(error),
          }).pipe(Effect.withSpan("upsertUserTwaWithMultiplierBatch"));

        yield* Effect.forEach(chunker(input, BATCH_SIZE), makeRequest, {
          concurrency: 1,
        });
      });
    };
  })
);
