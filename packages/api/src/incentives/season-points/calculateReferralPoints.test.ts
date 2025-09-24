import { layer } from '@effect/vitest';
import { BigNumber } from 'bignumber.js';
import { Effect } from 'effect';
import { CalculateReferralPoints } from './calculateReferralPoints';

layer(CalculateReferralPoints.Default)('calculateReferralPoints', (it) => {
  it.effect('should calculate referral points correctly', () =>
    Effect.gen(function* () {
      const service = yield* CalculateReferralPoints;

      const input = [
        {
          userId: 'userA',
          seasonId: 'season1',
          points: new BigNumber(0),
          weekId: 'week1',
        },
        {
          referredBy: 'userA',
          userId: 'userB',
          points: new BigNumber(1000),
          seasonId: 'season1',
          weekId: 'week1',
        },
        {
          referredBy: 'userB',
          userId: 'userC',
          points: new BigNumber(500),
          seasonId: 'season1',
          weekId: 'week1',
        },
      ];

      const actual = yield* service(input);

      expect(actual).toEqual([
        // userA has no points, so should have no referral points
        {
          userId: 'userA',
          referredBy: undefined,
          seasonId: 'season1',
          points: new BigNumber(0),
          referralPoints: new BigNumber(0),
          weekId: 'week1',
        },
        // userB has 1000 points, so should have 25 referral points
        {
          userId: 'userB',
          referredBy: 'userA',
          seasonId: 'season1',
          points: new BigNumber(1025),
          referralPoints: new BigNumber(25),
          weekId: 'week1',
        },
        // userC has 500 points but no referrals so should have no referral points
        {
          userId: 'userC',
          referredBy: 'userB',
          seasonId: 'season1',
          points: new BigNumber(500),
          referralPoints: new BigNumber(0),
          weekId: 'week1',
        },
      ]);
    }),
  );
});
