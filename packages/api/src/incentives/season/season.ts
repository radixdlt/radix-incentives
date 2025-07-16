import { Data, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { seasons } from "db/incentives";
import { eq } from "drizzle-orm";

class NotFound extends Data.TaggedError("NotFound")<{
  message: string;
}> {}

export class SeasonService extends Effect.Service<SeasonService>()(
  "SeasonService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        getActiveSeason: Effect.fn(function* () {
          const season = yield* Effect.tryPromise({
            try: () =>
              db
                .select({ id: seasons.id })
                .from(seasons)
                .where(eq(seasons.status, "active"))
                .limit(1)
                .then((result) => result[0]),
            catch: (error) => new DbError(error),
          });

          if (!season) {
            return yield* Effect.fail(
              new NotFound({ message: "No active season found" })
            );
          }

          return season;
        }),
        getById: Effect.fn(function* (id: string) {
          const season = yield* Effect.tryPromise({
            try: () =>
              db.query.seasons.findFirst({
                where: eq(seasons.id, id),
              }),
            catch: (error) => new DbError(error),
          });

          if (!season) {
            return yield* Effect.fail(
              new NotFound({ message: `Season ${id} not found` })
            );
          }

          return season;
        }),
      };
    }),
  }
) {}
