import { type Session, type User, sessions, users } from 'db/consultation';
import { eq } from 'drizzle-orm';
import { Context, Effect, Layer } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

export class SessionNotFoundError {
  readonly _tag = 'SessionNotFoundError';
}

export class GetSessionService extends Context.Tag('GetSessionService')<
  GetSessionService,
  (
    sessionId: string,
  ) => Effect.Effect<
    { session: Session; user: User },
    DbError | SessionNotFoundError
  >
>() {}

export const GetSessionLive = Layer.effect(
  GetSessionService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (sessionId) =>
      Effect.gen(function* () {
        const session = yield* Effect.tryPromise({
          try: () =>
            db
              .select({ user: users, session: sessions })
              .from(sessions)
              .innerJoin(users, eq(sessions.userId, users.id))
              .where(eq(sessions.id, sessionId))
              .then(([result]): typeof result | undefined => result),
          catch: (error) => new DbError(error),
        });

        if (!session) return yield* Effect.fail(new SessionNotFoundError());

        return session;
      });
  }),
);
