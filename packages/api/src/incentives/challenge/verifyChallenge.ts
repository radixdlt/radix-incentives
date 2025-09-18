import { challenge } from 'db/incentives';
import { and, eq, gt } from 'drizzle-orm';
import { Config, Data, Effect } from 'effect';
import { defaultAppConfig } from '../config';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

class InvalidChallengeError extends Data.TaggedError('InvalidChallengeError') {}

export class VerifyChallengeService extends Effect.Service<VerifyChallengeService>()(
  'VerifyChallengeService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      const challengeTTL = yield* Config.number('CHALLENGE_TTL').pipe(
        Config.withDefault(defaultAppConfig.challengeTTL),
      );

      return Effect.fnUntraced(function* (input: string) {
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .delete(challenge)
              .where(
                and(
                  eq(challenge.challenge, input),
                  gt(challenge.createdAt, new Date(Date.now() - challengeTTL)),
                ),
              )
              .returning()
              .then(([value]) => !!value),
          catch: (error) => new DbError(error),
        });

        if (!result) {
          return yield* Effect.fail(new InvalidChallengeError());
        }

        return result;
      });
    }),
  },
) {}

export const VerifyChallengeLive = VerifyChallengeService.Default;
