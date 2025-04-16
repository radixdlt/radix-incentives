import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../../effect/services/dbClient";
import { challenge } from "db";

export class ChallengeService extends Context.Tag("ChallengeService")<
  ChallengeService,
  string
>() {}

export const CreateChallengeLive = Layer.effect(
  ChallengeService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const value = yield* Effect.tryPromise({
      try: () =>
        db
          .insert(challenge)
          .values({})
          .returning()
          .then(([value]) => value),
      catch: (error) => new DbError(error),
    });
    if (!value) return yield* Effect.fail(new DbError("No challenge created"));

    return value.challenge;
  })
);

export const createChallengeProgram = Effect.gen(function* () {
  const challenge = yield* ChallengeService;
  return challenge;
});
