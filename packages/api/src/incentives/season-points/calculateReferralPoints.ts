import { BigNumber } from 'bignumber.js';
import { Effect } from 'effect';
import { ConfigService } from '../config/configService';

export class CalculateReferralPoints extends Effect.Service<CalculateReferralPoints>()(
  'CalculateReferralPoints',
  {
    dependencies: [ConfigService.Default],
    effect: Effect.gen(function* () {
      const config = yield* ConfigService;
      return Effect.fnUntraced(function* (
        users: {
          referredBy?: string;
          userId: string;
          seasonId: string;
          points: BigNumber;
          weekId: string;
        }[],
      ) {
        const referralPercentage = yield* config.getReferralPercentage();

        const referralPointsMap = new Map<string, BigNumber>();

        for (const user of users) {
          if (user.referredBy) {
            const referralPoints = user.points.multipliedBy(referralPercentage);

            const currentReferralPoints =
              referralPointsMap.get(user.referredBy) ?? new BigNumber(0);

            referralPointsMap.set(
              user.referredBy,
              currentReferralPoints.plus(referralPoints),
            );
          }
        }

        return users.map((user) => ({
          ...user,
          referralPoints:
            referralPointsMap.get(user.userId) ?? new BigNumber(0),
        }));
      });
    }),
  },
) {}
