import { sessions } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export class SignOutService extends Effect.Service<SignOutService>()(
  'SignOutService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fn(function* (userId: string) {
        return yield* Effect.tryPromise({
          try: () => db.delete(sessions).where(eq(sessions.userId, userId)),
          catch: (error) => new DbError(error),
        });
      });
    }),
  },
) {}
