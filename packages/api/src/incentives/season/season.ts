import { Data, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { type Season, seasons, weeks } from "db/incentives";
import { eq } from "drizzle-orm";
import { z } from "zod";

class NotFound extends Data.TaggedError("NotFound")<{
  message: string;
}> {}

export const CreateSeasonSchema = z.object({
  name: z.string(),
  status: z.enum(["upcoming", "active", "completed"]),
});

export const EditSeasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["upcoming", "active", "completed"]),
});

export type EditSeasonInput = z.infer<typeof EditSeasonSchema>;

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
        getByWeekId: Effect.fn(function* (weekId: string) {
          const season = yield* Effect.tryPromise({
            try: () =>
              db.query.weeks
                .findFirst({
                  where: eq(weeks.id, weekId),
                  with: {
                    season: true,
                  },
                })
                .then((result) => result?.season),
            catch: (error) => new DbError(error),
          });

          if (!season) {
            return yield* Effect.fail(
              new NotFound({ message: `Season for week ${weekId} not found` })
            );
          }

          return season;
        }),
        create: Effect.fn(function* (input: Omit<Season, "id">) {
          const season = yield* Effect.tryPromise({
            try: () => db.insert(seasons).values(input).returning(),
            catch: (error) => new DbError(error),
          });

          return season;
        }),
        edit: Effect.fn(function* (input: EditSeasonInput) {
          yield* Effect.tryPromise({
            try: () =>
              db.update(seasons).set(input).where(eq(seasons.id, input.id)),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
