import { sessions } from 'db/consultation';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

export const signOutProgram = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return yield* Effect.tryPromise({
      try: () => db.delete(sessions).where(eq(sessions.userId, userId)),
      catch: (error) => new DbError(error),
    });
  });
