import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { activityWeeks } from "db/incentives";
import { eq, and } from "drizzle-orm";

export class ActivityWeekService extends Effect.Service<ActivityWeekService>()(
  "ActivityWeekService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const getByWeekId = Effect.fn(function* (weekId: string) {
        return yield* Effect.tryPromise({
          try: () =>
            db.query.activityWeeks.findMany({
              where: eq(activityWeeks.weekId, weekId),
            }),
          catch: (error) => new DbError(error),
        });
      });
      return {
        updateMultiplier: Effect.fn(function* (input: {
          activityId: string;
          weekId: string;
          multiplier: number;
        }) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .update(activityWeeks)
                .set({ multiplier: input.multiplier })
                .where(
                  and(
                    eq(activityWeeks.weekId, input.weekId),
                    eq(activityWeeks.activityId, input.activityId)
                  )
                ),
            catch: (error) => new DbError(error),
          });
        }),
        getByWeekId,
        cloneByWeekId: Effect.fn(function* (input: {
          fromWeekId: string;
          toWeekId: string;
        }) {
          const values = yield* getByWeekId(input.fromWeekId);
          if (values.length === 0) {
            return;
          }
          yield* Effect.tryPromise({
            try: () =>
              db.insert(activityWeeks).values(
                values.map((item) => ({
                  ...item,
                  weekId: input.toWeekId,
                }))
              ),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
