import { Data, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { eq } from "drizzle-orm";
import { weeks } from "db/incentives";

class ActiveWeekNotFoundError extends Data.TaggedError(
  "ActiveWeekNotFoundError"
)<{
  message: string;
}> {}

class WeekNotFoundError extends Data.TaggedError("WeekNotFoundError")<{
  message: string;
}> {}

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
          return yield* Effect.fail(
            new ActiveWeekNotFoundError({ message: "No active week found" })
          );
        }

        return activeWeek;
      }),
      getById: Effect.fn(function* (id: string) {
        const week = yield* Effect.tryPromise({
          try: () => db.query.weeks.findFirst({ where: eq(weeks.id, id) }),
          catch: (error) => new DbError(error),
        });

        if (!week) {
          return yield* Effect.fail(
            new WeekNotFoundError({ message: `Week ${id} not found` })
          );
        }

        return week;
      }),
    };
  }),
}) {}
