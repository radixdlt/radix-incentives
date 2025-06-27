import { Context, Layer, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { sessions } from "db/consultation";
import { eq } from "drizzle-orm";

export class InvalidateSessionService extends Context.Tag(
  "InvalidateSessionService"
)<
  InvalidateSessionService,
  (sessionId: string) => Effect.Effect<void, DbError>
>() {}

export const InvalidateSessionLive = Layer.effect(
  InvalidateSessionService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (sessionId: string) =>
      Effect.tryPromise({
        try: () => db.delete(sessions).where(eq(sessions.id, sessionId)),
        catch: (error) => new DbError(error),
      });
  })
);
