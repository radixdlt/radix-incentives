import { Effect } from 'effect';
import { ResourceRewardService } from '../resource-reward/resourceReward';

export class CalculateResourceRewardPointsService extends Effect.Service<CalculateResourceRewardPointsService>()(
  'CalculateResourceRewardPointsService',
  {
    dependencies: [ResourceRewardService.Default],
    effect: Effect.gen(function* () {
      const resourceRewardService = yield* ResourceRewardService;
      return Effect.fn(function* (input: {
        users: {
          referredBy?: string;
          userId: string;
          seasonId: string;
          points: BigNumber;
          weekId: string;
          data: Record<string, string>;
        }[];
        weekId: string;
      }) {
        const resourceRewards =
          yield* resourceRewardService.getAggregatedResourceRewardClaimsByWeekId(
            {
              weekId: input.weekId,
            },
          );

        const resourceRewardsMap = new Map<string, BigNumber>();
        for (const resourceReward of resourceRewards) {
          resourceRewardsMap.set(
            resourceReward.userId,
            new BigNumber(resourceReward.points ?? 0),
          );
        }

        return input.users.map((user) => {
          if (!user.points.isGreaterThan(0)) return user;
          const resourceReward = resourceRewardsMap.get(user.userId);

          const updatedData = { ...user.data };

          if (resourceReward?.isGreaterThan(0)) {
            updatedData.resourceRewards = resourceReward
              .decimalPlaces(6)
              .toString();
          }

          return {
            ...user,
            resourceRewardPoints: resourceReward,
            points: resourceReward
              ? user.points.plus(resourceReward)
              : user.points,
            data: updatedData,
          };
        });
      });
    }),
  },
) {}
