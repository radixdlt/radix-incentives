import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { seasonPointsMultiplier } from "db/incentives";
import { sql } from "drizzle-orm";

export class UpsertUserTwaWithMultiplierService extends Context.Tag(
  "UpsertUserTwaWithMultiplierService"
)<
  UpsertUserTwaWithMultiplierService,
  (
    input: (typeof seasonPointsMultiplier.$inferInsert)[]
  ) => Effect.Effect<void, DbError, DbClientService>
>() {}

export const UpsertUserTwaWithMultiplierLive = Layer.effect(
  UpsertUserTwaWithMultiplierService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db
              .insert(seasonPointsMultiplier)
              .values(input)
              .onConflictDoUpdate({
                target: [
                  seasonPointsMultiplier.userId,
                  seasonPointsMultiplier.weekId,
                ],
                set: {
                  multiplier: sql`excluded.multiplier`,
                  totalTwaBalance: sql`excluded.total_twa_balance`,
                },
              }),
          catch: (error) => new DbError(error),
        });
      });
  })
); 