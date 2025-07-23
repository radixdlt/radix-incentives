import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { activityWeeks } from "db/incentives";
import { eq, and, sql } from "drizzle-orm";
import { ActivityId } from "data";

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
                .set({ multiplier: input.multiplier.toString() })
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
          fromWeekId: string | undefined;
          toWeekId: string;
        }) {
          const values = input.fromWeekId
            ? yield* getByWeekId(input.fromWeekId).pipe(
                Effect.map((items) =>
                  items.reduce(
                    (acc, item) => {
                      acc[item.activityId] = item;
                      return acc;
                    },
                    {} as Record<
                      string,
                      { activityId: string; weekId: string; multiplier: string }
                    >
                  )
                )
              )
            : {};

          const items = Object.values(ActivityId).map((item) => ({
            activityId: item,
            weekId: input.toWeekId,
            multiplier: values[item]?.multiplier ?? "1",
          }));

          yield* Effect.tryPromise({
            try: () =>
              db
                .insert(activityWeeks)
                .values(items)
                .onConflictDoUpdate({
                  target: [activityWeeks.weekId, activityWeeks.activityId],
                  set: {
                    multiplier: sql`excluded.multiplier`,
                  },
                }),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
