import { users } from 'db/incentives';
import { isNull, sql } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';
import { UserReferral } from '../user-referral/userReferral';

export class SeedUserReferralCodesService extends Effect.Service<SeedUserReferralCodesService>()(
  'SeedUserReferralCodesService',
  {
    dependencies: [dbClientLive, UserReferral.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const userReferral = yield* UserReferral;

      return Effect.fnUntraced(function* () {
        const usersWithoutReferralCode = yield* Effect.tryPromise({
          try: () => db.select().from(users).where(isNull(users.referralCode)),
          catch: (error) => new DbError(error),
        });

        const usersWithReferralCode = yield* Effect.reduce(
          usersWithoutReferralCode,
          [] as (typeof users.$inferInsert)[],
          Effect.fnUntraced(function* (acc, user) {
            let referralCode: string | undefined;

            while (!referralCode) {
              referralCode = yield* userReferral.generateReferralCode();

              if (acc.some((user) => user.referralCode === referralCode)) {
                referralCode = undefined;
              }
            }

            return [...acc, { ...user, referralCode }];
          }),
        );

        yield* Effect.tryPromise({
          try: () =>
            db
              .insert(users)
              .values(usersWithReferralCode)
              .onConflictDoUpdate({
                target: [users.id],
                set: { referralCode: sql`excluded.referral_code` },
              }),
          catch: (error) => new DbError(error),
        });
      });
    }),
  },
) {}
