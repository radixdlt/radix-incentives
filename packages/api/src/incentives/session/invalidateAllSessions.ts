import { sessions } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Context, Effect, Layer } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

export class InvalidateAllSessionsService extends Context.Tag(
  'InvalidateAllSessionsService',
)<
  InvalidateAllSessionsService,
  (userId: string) => Effect.Effect<void, DbError>
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
  }),
);
