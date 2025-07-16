import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { sessions, users } from "db/consultation";
import { eq } from "drizzle-orm";

export class SessionNotFoundError {
  readonly _tag = "SessionNotFoundError";
}

export class GetSessionService extends Effect.Service<GetSessionService>()(
  "GetSessionService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (sessionId: string) {
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
        }),
      };
    }),
  }
) {}
