import { user, userSeasonPoints, users } from 'db/incentives';
import { and, count, eq, sum } from 'drizzle-orm';
import { Data, Effect, Schema } from 'effect';
import { ConfigService } from '../config/configService';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export const ReferralCodeSchema = Schema.String.pipe(
  Schema.minLength(6),
  Schema.maxLength(6),
  Schema.filter(
    (value) =>
      /^[a-zA-Z0-9]+$/.test(value) ||
      'Invalid referral code, expected 6 alphanumeric characters',
  ),
);

class UserNotFoundError extends Data.TaggedError('UserNotFoundError')<{
  message: string;
  referralCode: string;
}> {}

export class UserReferral extends Effect.Service<UserReferral>()(
  'UserReferral',
  {
    dependencies: [dbClientLive, ConfigService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const config = yield* ConfigService;

      const generateReferralCode = Effect.fnUntraced(function* () {
        return crypto.randomUUID().slice(0, 6);
      });

      const checkIfReferralCodeExists = (referralCode: string) =>
        Effect.tryPromise({
          try: () =>
            db
              .select({ referralCode: users.referralCode })
              .from(users)
              .where(eq(users.referralCode, referralCode))
              .limit(1),
          catch: (error) => new DbError(error),
        }).pipe(Effect.map((result) => result.length > 0));

      return {
        generateReferralCode: Effect.fnUntraced(function* () {
          let referralCode: string | undefined;

          while (!referralCode) {
            referralCode = yield* generateReferralCode();
            // there is a small chance that the referral code is already taken, so we need to check if it exists
            if (yield* checkIfReferralCodeExists(referralCode)) {
              referralCode = undefined;
            }
          }

          return referralCode;
        }),
        getUserIdByReferralCode: Effect.fnUntraced(function* (input: string) {
          const referralCode =
            yield* Schema.decodeUnknown(ReferralCodeSchema)(input);

          return yield* Effect.tryPromise({
            try: () =>
              db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.referralCode, referralCode))
                .limit(1),
            catch: (error) => new DbError(error),
          }).pipe(
            Effect.flatMap((result) => {
              return Effect.gen(function* () {
                if (result.length === 0) {
                  return yield* Effect.fail(
                    new UserNotFoundError({
                      message: `User not found with referral code ${referralCode}`,
                      referralCode,
                    }),
                  );
                }
                return result[0]?.id;
              });
            }),
          );
        }),
        getUserReferralStats: Effect.fnUntraced(function* (input: {
          userId: string;
          seasonId: string;
        }) {
          const referralPercentage = yield* config.getReferralPercentage();

          const [referralCode, numberOfReferrals, referralPoints]: [
            string,
            number,
            string,
          ] = yield* Effect.all(
            [
              Effect.tryPromise({
                try: () =>
                  db
                    .select({
                      referralCode: user.referralCode,
                    })
                    .from(user)
                    .where(eq(user.id, input.userId))
                    .then((result) => result[0]?.referralCode || ''),
                catch: (error) => new DbError(error),
              }),
              Effect.tryPromise({
                try: () =>
                  db
                    .select({ count: count() })
                    .from(user)
                    .where(eq(user.referredBy, input.userId))
                    .then((result) => result[0]?.count || 0),
                catch: (error) => new DbError(error),
              }),
              Effect.tryPromise({
                try: () =>
                  db
                    .select({
                      referralPoints: sum(userSeasonPoints.referralPoints),
                    })
                    .from(userSeasonPoints)
                    .where(
                      and(
                        eq(userSeasonPoints.userId, input.userId),
                        eq(userSeasonPoints.seasonId, input.seasonId),
                      ),
                    )
                    .then((result) => result[0]?.referralPoints || '0'),
                catch: (error) => new DbError(error),
              }),
            ],
            { concurrency: 'unbounded' },
          );

          return {
            numberOfReferrals: numberOfReferrals ?? 0,
            referralPoints: referralPoints ?? '0',
            percentage: referralPercentage,
            referralCode,
          };
        }),
      };
    }),
  },
) {}
