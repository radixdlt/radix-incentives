import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { weeks } from "db/incentives";
import { eq } from "drizzle-orm";

export type UpdateWeekStatusError = DbError;

export class UpdateWeekStatusService extends Effect.Service<UpdateWeekStatusService>()(
  "UpdateWeekStatusService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (input: { id: string; processed: boolean }) {
          yield* Effect.tryPromise({
            try: () =>
              db
                .update(weeks)
                .set({ processed: input.processed })
                .where(eq(weeks.id, input.id)),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
