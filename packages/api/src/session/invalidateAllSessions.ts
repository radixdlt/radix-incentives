import { Context, Layer, Effect } from "effect";
import { DbClientService, DbError } from "../services/dbClient";
import { sessions } from "db";
import { eq } from "drizzle-orm";

export class InvalidateAllSessionsService extends Context.Tag(
  "InvalidateAllSessionsService"
)<
  InvalidateAllSessionsService,
  (userId: string) => Effect.Effect<void, DbError, DbClientService>
>() {}

export const invalidateAllSessionsLive = Layer.effect(
  InvalidateAllSessionsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (userId: string) =>
      Effect.tryPromise({
        try: () => db.delete(sessions).where(eq(sessions.userId, userId)),
        catch: (error) => new DbError(error),
      });
  })
);
