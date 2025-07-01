import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { accountActivityPoints } from "db/incentives";
import { sql } from "drizzle-orm";
import { chunker } from "../../common";

export class UpsertAccountActivityPointsService extends Context.Tag(
  "UpsertAccountActivityPointsService"
)<
  UpsertAccountActivityPointsService,
  (
    input: (typeof accountActivityPoints.$inferInsert)[]
  ) => Effect.Effect<void, DbError>
>() {}

export const UpsertAccountActivityPointsLive = Layer.effect(
  UpsertAccountActivityPointsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        yield* Effect.forEach(chunker(input, 10_000), (chunk) => {
          return Effect.gen(function* () {
            yield* Effect.tryPromise({
              try: () =>
                db
                  .insert(accountActivityPoints)
                  .values(chunk)
                  .onConflictDoUpdate({
                    target: [
                      accountActivityPoints.accountAddress,
                      accountActivityPoints.weekId,
                      accountActivityPoints.activityId,
                    ],
                    set: {
                      activityPoints: sql`excluded.activity_points`,
                    },
                  }),
              catch: (error) => new DbError(error),
            });
          });
        }).pipe(Effect.withSpan("upsertAccountActivityPoints"));
      });
  })
);
