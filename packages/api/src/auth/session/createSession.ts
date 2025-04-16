import { Context, Layer, Effect } from "effect";
import { DbClientService, DbError } from "../../effect/services/dbClient";
import { AppConfigService } from "../../effect/services/appConfig";
import { type Session, sessions } from "db";

export class CreateSessionService extends Context.Tag("CreateSessionService")<
  CreateSessionService,
  (input: {
    token: string;
    userId: string;
  }) => Effect.Effect<Session, DbError, DbClientService | AppConfigService>
>() {}

export const CreateSessionLive = Layer.effect(
  CreateSessionService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const appConfig = yield* AppConfigService;

    return (input: { token: string; userId: string }) =>
      Effect.tryPromise({
        try: () =>
          db
            .insert(sessions)
            .values({
              id: input.token,
              userId: input.userId,
              expiresAt: new Date(Date.now() + appConfig.sessionTTL),
            })
            .returning(),
        catch: (error) => new DbError(error),
      }).pipe(Effect.map(([session]) => session as Session));
  })
);
