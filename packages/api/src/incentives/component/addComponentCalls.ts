import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { componentCalls } from "db/incentives";
import { sql } from "drizzle-orm";

export type AddComponentCallsServiceInput = {
  accountAddress: string;
  timestamp: Date;
  calls: number;
}[];

export class AddComponentCallsService extends Context.Tag(
  "AddComponentCallsService"
)<
  AddComponentCallsService,
  (
    input: AddComponentCallsServiceInput
  ) => Effect.Effect<void, DbError, DbClientService>
>() {}

export const AddComponentCallsLive = Layer.effect(
  AddComponentCallsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        if (input.length === 0) return;
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .insert(componentCalls)
              .values(input)
              .onConflictDoUpdate({
                target: [
                  componentCalls.accountAddress,
                  componentCalls.timestamp,
                ],
                set: { calls: sql`excluded.calls` },
              }),
          catch: (error) => new DbError(error),
        });

        return result;
      });
    };
  })
);
