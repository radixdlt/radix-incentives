import { layer } from '@effect/vitest';
import { seasons, userSeasonPoints, users, weeks } from 'db/incentives';
import { Effect, Logger } from 'effect';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbClientService, dbClientLive } from '../db/dbClient';
import { UserReferral } from './userReferral';

layer(UserReferral.Default)('userReferral', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });
  it.effect('should get user referral stats correctly', () =>
    Effect.gen(function* () {
      const service = yield* UserReferral;
      const db = yield* DbClientService;

      const [userA] = yield* Effect.promise(() =>
        db
          .insert(users)
          .values([
            {
              identityAddress: 'testAddressA',
              label: '',
              referralCode: 'abc123',
            },
          ])
          .returning(),
      );

      yield* Effect.promise(() =>
        db
          .insert(users)
          .values(
            new Array(10).fill(0).map((_, index) => ({
              identityAddress: `testAddress-${index}`,
              label: '',
              referredBy: userA.id,
            })),
          )
          .returning(),
      );

      const [season] = yield* Effect.promise(() =>
        db
          .insert(seasons)
          .values([
            {
              name: 'Test Season',
            },
          ])
          .returning(),
      );

      const [week1, week2] = yield* Effect.promise(() =>
        db
          .insert(weeks)
          .values([
            {
              seasonId: season.id,
              startDate: new Date('2025-01-01'),
              endDate: new Date('2025-01-07'),
            },
            {
              seasonId: season.id,
              startDate: new Date('2025-01-08'),
              endDate: new Date('2025-01-14'),
            },
          ])
          .returning(),
      );

      yield* Effect.promise(() =>
        db
          .insert(userSeasonPoints)
          .values([
            {
              userId: userA.id,
              seasonId: season.id,
              weekId: week1.id,
              points: '100',
              referralPoints: '100',
            },
            {
              userId: userA.id,
              seasonId: season.id,
              weekId: week2.id,
              points: '100',
              referralPoints: '100',
            },
          ])
          .returning(),
      );

      const result = yield* service.getUserReferralStats({
        userId: userA.id,
        seasonId: season.id,
      });

      expect(result).toHaveProperty('numberOfReferrals', 10);
      expect(result).toHaveProperty('referralPoints', '200.000000');
      expect(result).toHaveProperty('percentage', 0.05);
      expect(result).toHaveProperty('referralCode', 'abc123');
    }).pipe(Effect.provide(dbClientLive), Effect.provide(Logger.pretty)),
  );
});
