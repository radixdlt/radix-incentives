import { Effect } from "effect";

import { DbError } from "../db/dbClient";
import { AppConfigService } from "../config/appConfig";
import { DbClientService } from "../db/dbClient";
import { InvalidateSessionService } from "../session/invalidateSession";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { GetSessionService } from "../session/getSession";
import { sessions } from "db/consultation";
import { eq } from "drizzle-orm";

class SessionExpiredError {
  readonly _tag = "SessionExpiredError";
}

export class ValidateSessionTokenService extends Effect.Service<ValidateSessionTokenService>()(
  "ValidateSessionTokenService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const appConfig = yield* AppConfigService;
      const invalidateSession = yield* InvalidateSessionService;
      const getSession = yield* GetSessionService;

      return {
        run: Effect.fn(function* (token: string) {
          const sessionId = encodeHexLowerCase(
            sha256(new TextEncoder().encode(token))
          );

          yield* Effect.logDebug(
            { token, sessionId },
            "Validating session token"
          );

          const { user, session } = yield* getSession.run(sessionId);

          const isSessionExpired = Date.now() >= session.expiresAt.getTime();

          if (isSessionExpired) {
            return yield* invalidateSession
              .run(session.id)
              .pipe(
                Effect.flatMap(() => Effect.fail(new SessionExpiredError()))
              );
          }

          const shouldRefreshSession =
            Date.now() >=
            session.expiresAt.getTime() - appConfig.sessionRefreshThreshold;

          if (shouldRefreshSession) {
            const updatedSession = yield* Effect.tryPromise({
              try: () =>
                db
                  .update(sessions)
                  .set({
                    expiresAt: new Date(
                      session.expiresAt.getTime() +
                        appConfig.sessionRefreshThreshold
                    ),
                  })
                  .where(eq(sessions.id, session.id))
                  .returning(),
              catch: (error) => new DbError(error),
            }).pipe(
              Effect.map(([updatedSession]) => ({
                session: updatedSession,
                user,
              }))
            );
            return updatedSession;
          }

          return { user, session };
        }),
      };
    }),
  }
) {}
