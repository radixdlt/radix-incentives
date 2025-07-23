import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { activityWeeks } from "db/incentives";
import { eq } from "drizzle-orm";

export class ActivityWeekService extends Effect.Service<ActivityWeekService>()(
  "ActivityWeekService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
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
                .where(eq(activityWeeks.weekId, input.weekId)),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
