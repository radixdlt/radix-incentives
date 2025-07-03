import { Data, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { eq } from "drizzle-orm";
import { weeks } from "db/incentives";

class ActiveWeekNotFoundError extends Data.TaggedError(
  "ActiveWeekNotFoundError"
) {}

export class WeekService extends Effect.Service<WeekService>()("WeekService", {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;

    return {
      getActiveWeek: Effect.fn(function* () {
        const activeWeek = yield* Effect.tryPromise({
          try: () =>
            db.query.weeks.findFirst({
              where: eq(weeks.status, "active"),
            }),
          catch: (error) => new DbError(error),
        });

        if (!activeWeek) {
          return yield* Effect.fail(new ActiveWeekNotFoundError());
        }

        return activeWeek;
      }),
    };
  }),
}) {}
