import { layer } from '@effect/vitest';
import { users } from 'db/incentives';
import { Effect, Logger } from 'effect';
import { DbClientService, dbClientLive } from '../db/dbClient';
import { UpsertUserService } from './upsertUser';

layer(UpsertUserService.Default)('upsertUser', (it) => {
  beforeEach(async () => {
    const truncateTables = Effect.gen(function* () {
      const db = yield* DbClientService;
      yield* Effect.promise(() => db.delete(users));
    }).pipe(Effect.provide(dbClientLive));

    await Effect.runPromise(truncateTables);
  });
  it.effect('should create a user', () =>
    Effect.gen(function* () {
      const service = yield* UpsertUserService;
      const identityAddress = crypto.randomUUID();
      const result = yield* service({
        label: 'Test User',
        address: identityAddress,
      });

      expect(result).toHaveProperty('id', expect.any(String));
      expect(result).toHaveProperty('label', 'Test User');
      expect(result).toHaveProperty('identityAddress', identityAddress);
      expect(result).toHaveProperty('referralCode', expect.any(String));
      expect(result).toHaveProperty('referredBy', null);
    }),
  );
  it.effect('should create a user with a referral code', () =>
    Effect.gen(function* () {
      const service = yield* UpsertUserService;
      const userA = yield* service({
        label: 'User A',
        address: crypto.randomUUID(),
      });
      const userB = yield* service({
        label: 'User B',
        referralCode: userA.referralCode ? userA.referralCode : undefined,
        address: crypto.randomUUID(),
      });
      expect(userB).toHaveProperty('referredBy', userA.id);
    }).pipe(Effect.provide(Logger.pretty)),
  );

  it.effect('should not not update referral code if it already exists', () =>
    Effect.gen(function* () {
      const service = yield* UpsertUserService;
      const userA = yield* service({
        label: 'User A',
        address: crypto.randomUUID(),
      });
      const userB = yield* service({
        label: 'User B',
        referralCode: userA.referralCode!,
        address: crypto.randomUUID(),
      });
      const userC = yield* service({
        label: 'User C',
        address: crypto.randomUUID(),
      });

      // try to update referredBy to user C
      const referredByUserA = yield* service({
        label: 'User B',
        referralCode: userC.referralCode!,
        address: userB.identityAddress,
      });
      expect(referredByUserA).toHaveProperty('referredBy', userA.id);

      // try to update referredBy to user A
      const notReferredUser = yield* service({
        label: 'User C',
        address: userC.identityAddress,
        referralCode: userA.referralCode!,
      });
      expect(notReferredUser).toHaveProperty('referredBy', null);
    }).pipe(Effect.provide(Logger.pretty)),
  );

  it.effect('should create a user with an invalid referral code', () =>
    Effect.gen(function* () {
      const service = yield* UpsertUserService;
      const user = yield* service({
        label: 'User',
        referralCode: 'INVALID_REFERRAL_CODE',
        address: crypto.randomUUID(),
      });
      expect(user).toHaveProperty('referredBy', null);
    }),
  );
});
