import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { sessions } from "db/consultation";
import { eq } from "drizzle-orm";

export class InvalidateSessionService extends Effect.Service<InvalidateSessionService>()(
  "InvalidateSessionService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (sessionId: string) {
          // Implementation goes here
          return Effect.tryPromise({
            try: () => db.delete(sessions).where(eq(sessions.id, sessionId)),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
