import { Data, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { weeks } from "db/incentives";
import { z } from "zod";
import { ActivityCategoryWeekService } from "../activity-category-week/activityCategoryWeek";
import { ActivityWeekService } from "../activity-week/activityWeek";

class WeekNotFoundError extends Data.TaggedError("WeekNotFoundError")<{
  message: string;
}> {}

export const CreateWeekSchema = z.object({
  seasonId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

export type CreateWeekInput = z.infer<typeof CreateWeekSchema>;

export class WeekService extends Effect.Service<WeekService>()("WeekService", {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;
    const activityWeekService = yield* ActivityWeekService;
    const activityCategoryWeekService = yield* ActivityCategoryWeekService;

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
      create: Effect.fn(function* (input: CreateWeekInput) {
        const lastWeekId = yield* Effect.tryPromise({
          try: () =>
            db.query.weeks
              .findMany({
                where: and(eq(weeks.seasonId, input.seasonId)),
                orderBy: [desc(weeks.startDate)],
              })
              .then((weeks) => weeks[0]?.id),
          catch: (error) => new DbError(error),
        });

        const newWeek = yield* Effect.tryPromise({
          try: () =>
            db
              .insert(weeks)
              .values(input)
              .returning()
              .then(([week]) => week),
          catch: (error) => new DbError(error),
        });

        yield* Effect.log(
          `Cloning activities from ${lastWeekId} to ${newWeek.id}`
        );

        yield* Effect.all([
          activityCategoryWeekService.cloneByWeekId({
            fromWeekId: lastWeekId,
            toWeekId: newWeek.id,
          }),
          activityWeekService.cloneByWeekId({
            fromWeekId: lastWeekId,
            toWeekId: newWeek.id,
          }),
        ]);
      }),
    };
  }),
}) {}
