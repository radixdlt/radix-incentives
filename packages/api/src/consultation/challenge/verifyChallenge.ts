import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { challenge } from "db/consultation";
import { and, eq, gt } from "drizzle-orm";
import { AppConfigService } from "../config/appConfig";

export class VerifyChallengeService extends Effect.Service<VerifyChallengeService>()(
  "VerifyChallengeService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const appConfig = yield* AppConfigService;

      return {
        run: Effect.fn(function* (input: string) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .delete(challenge)
                .where(
                  and(
                    eq(challenge.challenge, input),
                    gt(
                      challenge.createdAt,
                      new Date(Date.now() - appConfig.challengeTTL)
                    )
                  )
                )
                .returning()
                .then(([value]) => !!value),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}
