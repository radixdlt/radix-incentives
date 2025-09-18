import { type User, user, users } from 'db/incentives';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';
import { UserReferral } from '../user-referral/userReferral';

export class UpsertUserService extends Effect.Service<UpsertUserService>()(
  'UpsertUserService',
  {
    dependencies: [dbClientLive, UserReferral.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const userReferral = yield* UserReferral;

      return Effect.fnUntraced(function* ({
        address,
        label,
        referralCode,
      }: {
        address: string;
        label: string;
        referralCode?: string;
      }) {
        const referredBy = referralCode
          ? yield* userReferral.getUserIdByReferralCode(referralCode).pipe(
              Effect.catchTags({
                UserNotFoundError: () => Effect.succeed(undefined),
                ParseError: () => Effect.succeed(undefined),
              }),
            )
          : undefined;

        const userReferralCode = yield* userReferral.generateReferralCode();

        return yield* Effect.tryPromise({
          try: () =>
            db
              .insert(users)
              .values({
                identityAddress: address,
                label,
                referralCode: userReferralCode,
                referredBy,
              })
              .onConflictDoUpdate({
                target: [user.identityAddress],
                set: { label },
              })
              .returning(),
          catch: (error) => new DbError(error),
        }).pipe(Effect.map(([user]) => user as User));
      });
    }),
  },
) {}
