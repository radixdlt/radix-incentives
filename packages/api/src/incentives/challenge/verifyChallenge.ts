import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { challenge } from "db/consultation";
import { and, eq, gt } from "drizzle-orm";
import { AppConfigService } from "../config/appConfig";

export class VerifyChallengeService extends Context.Tag(
  "VerifyChallengeService"
)<
  VerifyChallengeService,
  (input: string) => Effect.Effect<boolean, DbError>
>() {}

export const VerifyChallengeLive = Layer.effect(
  VerifyChallengeService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const appConfig = yield* AppConfigService;

    return (input: string) =>
      Effect.tryPromise({
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
  })
);
