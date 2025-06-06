import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { accountActivityPoints } from "db/incentives";
import { sql } from "drizzle-orm";

export class UpsertAccountActivityPointsService extends Context.Tag(
  "UpsertAccountActivityPointsService"
)<
  UpsertAccountActivityPointsService,
  (
    input: (typeof accountActivityPoints.$inferInsert)[]
  ) => Effect.Effect<void, DbError, DbClientService>
>() {}

export const UpsertAccountActivityPointsLive = Layer.effect(
  UpsertAccountActivityPointsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db
              .insert(accountActivityPoints)
              .values(input)
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
  })
);
