import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../services/dbClient";
import { challenge } from "db";
import { and, eq, gt } from "drizzle-orm";
import { AppConfigService } from "../services/appConfig";

export class VerifyChallengeService extends Context.Tag(
  "VerifyChallengeService"
)<
  VerifyChallengeService,
  (
    input: string
  ) => Effect.Effect<boolean, DbError, DbClientService | AppConfigService>
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
