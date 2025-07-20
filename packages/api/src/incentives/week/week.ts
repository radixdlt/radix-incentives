import { Data, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { and, eq, gte, lte } from "drizzle-orm";
import { weeks } from "db/incentives";

class WeekNotFoundError extends Data.TaggedError("WeekNotFoundError")<{
  message: string;
}> {}

export class WeekService extends Effect.Service<WeekService>()("WeekService", {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;

    return {
      getByDate: Effect.fn(function* (date: Date) {
        const week = yield* Effect.tryPromise({
          try: () =>
            db.query.weeks.findFirst({
              where: and(lte(weeks.startDate, date), gte(weeks.endDate, date)),
            }),
          catch: (error) => new DbError(error),
        });

        if (!week) {
          return yield* Effect.fail(
            new WeekNotFoundError({
              message: `No week found for date ${date.toISOString()}`,
            })
          );
        }

        return week;
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
