import { weeks } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export class WeekNotFoundError {
  readonly _tag = 'WeekNotFoundError';
  constructor(readonly message: string) {}
}

export type GetWeekByIdError = DbError | WeekNotFoundError;

export class GetWeekByIdService extends Effect.Service<GetWeekByIdService>()(
  'GetWeekByIdService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fn(function* (input: { id: string }) {
        const week = yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(weeks)
              .where(eq(weeks.id, input.id))
              .limit(1)
              .then((r) => r[0]),
          catch: (error) => new DbError(error),
        });

        if (!week) {
          return yield* Effect.fail(
            new WeekNotFoundError(`week ${input.id} not found`),
          );
        }

        return week;
      });
    }),
  },
) {}
