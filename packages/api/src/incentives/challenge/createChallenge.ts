import { challenge } from 'db/incentives';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export class CreateChallengeService extends Effect.Service<CreateChallengeService>()(
  'CreateChallengeService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return Effect.fnUntraced(function* () {
        const value = yield* Effect.tryPromise({
          try: () =>
            db
              .insert(challenge)
              .values({})
              .returning()
              .then(([value]) => value),
          catch: (error) => new DbError(error),
        });
        if (!value)
          return yield* Effect.fail(new DbError('No challenge created'));

        return value.challenge;
      });
    }),
  },
) {}
