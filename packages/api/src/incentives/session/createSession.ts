import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { type Session, sessions } from 'db/consultation';
import { Config, Effect } from 'effect';
import { defaultAppConfig } from '../config/appConfig';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export class CreateSessionService extends Effect.Service<CreateSessionService>()(
  'CreateSessionService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const sessionTTL = yield* Config.number('SESSION_TTL').pipe(
        Config.withDefault(defaultAppConfig.sessionTTL),
      );
      return Effect.fnUntraced(function* (input: {
        token: string;
        userId: string;
      }) {
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(input.token)),
        );
        return yield* Effect.tryPromise({
          try: () =>
            db
              .insert(sessions)
              .values({
                id: sessionId,
                userId: input.userId,
                expiresAt: new Date(Date.now() + sessionTTL),
              })
              .returning(),
          catch: (error) => new DbError(error),
        }).pipe(Effect.map(([session]) => session as Session));
      });
    }),
  },
) {}
