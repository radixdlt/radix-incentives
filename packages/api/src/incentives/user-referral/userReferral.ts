import { users } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Data, Effect, Schema } from 'effect';
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
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

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
      };
    }),
  },
) {}
