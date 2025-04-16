import { Context, Layer, Effect, pipe } from "effect";
import { DbClientService, DbError } from "../../effect/services/dbClient";
import { AppConfigService } from "../../effect/services/appConfig";
import { type Session, sessions, type User, users } from "db";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { eq } from "drizzle-orm";
import { InvalidateSessionService } from "./invalidateSession";

export class ValidateSessionTokenService extends Context.Tag(
  "ValidateSessionTokenService"
)<
  ValidateSessionTokenService,
  (
    token: string
  ) => Effect.Effect<
    { session: Session; user: User } | { session: null; user: null },
    DbError,
    DbClientService | InvalidateSessionService | AppConfigService
  >
>() {}

export const validateSessionTokenLive = Layer.effect(
  ValidateSessionTokenService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const appConfig = yield* AppConfigService;
    const invalidateSession = yield* InvalidateSessionService;

    return (input: string) =>
      pipe(
        Effect.succeed(input),
        Effect.flatMap((token) => {
          const sessionId = encodeHexLowerCase(
            sha256(new TextEncoder().encode(token))
          );
          return Effect.tryPromise({
            try: () =>
              db
                .select({ user: users, session: sessions })
                .from(sessions)
                .innerJoin(users, eq(sessions.userId, users.id))
                .where(eq(sessions.id, sessionId))
                .then(([result]): typeof result | undefined => result),
            catch: (error) => new DbError(error),
          });
        }),
        Effect.flatMap(
          (
            result
          ): Effect.Effect<
            { session: Session; user: User } | { session: null; user: null },
            DbError,
            InvalidateSessionService | DbClientService | AppConfigService
          > => {
            if (!result) {
              return Effect.succeed({ session: null, user: null });
            }

            const { user, session } = result;

            if (!user || !session) {
              return Effect.succeed({ session: null, user: null });
            }

            if (Date.now() >= session.expiresAt.getTime()) {
              return invalidateSession(session.id).pipe(
                Effect.map(() => ({ session: null, user: null }))
              );
            }

            if (
              Date.now() >=
              session.expiresAt.getTime() - appConfig.sessionRefreshThreshold
            ) {
              session.expiresAt = new Date(Date.now() + appConfig.sessionTTL);
              return Effect.tryPromise({
                try: () =>
                  db
                    .update(sessions)
                    .set({
                      expiresAt: session.expiresAt,
                    })
                    .where(eq(sessions.id, session.id)),
                catch: (error) => new DbError(error),
              }).pipe(Effect.map(() => ({ session, user })));
            }

            return Effect.succeed({ session, user });
          }
        )
      );
  })
);

// async function validateSessionToken(
//   token: string
// ): Promise<SessionValidationResult> {
//   const sessionId = encodeHexLowerCase(
//     sha256(new TextEncoder().encode(token))
//   );
//   const result = await db
//     .select({ user: users, session: sessions })
//     .from(sessions)
//     .innerJoin(users, eq(sessions.userId, users.id))
//     .where(eq(sessions.id, sessionId));

//   if (!result?.length) {
//     return { session: null, user: null };
//   }
//   const row = result[0];
//   if (!row?.user || !row?.session) {
//     return { session: null, user: null };
//   }
//   const { user, session } = row;
//   if (Date.now() >= session.expiresAt.getTime()) {
//     await db.delete(sessions).where(eq(sessions.id, session.id));
//     return { session: null, user: null };
//   }
//   if (Date.now() >= session.expiresAt.getTime() - FIFTEEN_DAYS) {
//     session.expiresAt = new Date(Date.now() + THIRTY_DAYS);
//     await db
//       .update(sessions)
//       .set({
//         expiresAt: session.expiresAt,
//       })
//       .where(eq(sessions.id, session.id));
//   }
//   return { session, user };
// }
