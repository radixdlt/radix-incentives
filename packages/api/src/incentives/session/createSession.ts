import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { type Session, sessions } from 'db/consultation';
import { Context, Effect, Layer } from 'effect';
import { AppConfigService } from '../config/appConfig';
import { DbClientService, DbError } from '../db/dbClient';

export class CreateSessionService extends Context.Tag('CreateSessionService')<
  CreateSessionService,
  (input: { token: string; userId: string }) => Effect.Effect<Session, DbError>
>() {}

export const CreateSessionLive = Layer.effect(
  CreateSessionService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const appConfig = yield* AppConfigService;

    return (input: { token: string; userId: string }) => {
      const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(input.token)),
      );
      return Effect.tryPromise({
        try: () =>
          db
            .insert(sessions)
            .values({
              id: sessionId,
              userId: input.userId,
              expiresAt: new Date(Date.now() + appConfig.sessionTTL),
            })
            .returning(),
        catch: (error) => new DbError(error),
      }).pipe(Effect.map(([session]) => session as Session));
    };
  }),
);
