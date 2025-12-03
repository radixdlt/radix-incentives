'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import { useMostRecentWeek } from '~/lib/hooks/useMostRecentWeek';
import { usePersona } from '~/lib/hooks/usePersona';
import { api } from '~/trpc/react';
import { EarnPageItemCategoryCard } from '../components/EarnPageItemCategoryCard';
import { ResourceRewardList } from './components/ResourceRewardList';

const categoryId = 'resourceRewards';

export default function ResourceRewardsPage() {
  const utils = api.useUtils();

  const week = useMostRecentWeek();
  const { persona } = usePersona();

  const { data: categoryData, isLoading } =
    api.activityCategory.getById.useQuery({ id: categoryId });

  const { data: userResourceRewardsData } =
    api.resourceReward.getUserResourceRewards.useQuery(
      { weekId: week?.id ?? '' },
      { enabled: !!week && !!persona },
    );

  const { mutate: claimResourceRewards } =
    api.resourceReward.claimResourceRewards.useMutation({
      onSuccess: () => {
        utils.resourceReward.getUserResourceRewards.invalidate();
        toast.success('Resource rewards claimed successfully');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { data: resourceRewardsData, isLoading: isLoadingResourceRewards } =
    api.resourceReward.getResourceRewards.useQuery(
      { weekId: week?.id ?? '' },
      { enabled: !!week },
    );

  const isLoadingUserData = api.resourceReward.getUserResourceRewards.useQuery(
    { weekId: week?.id ?? '' },
    { enabled: !!week && !!persona },
  ).isLoading;

  const handleClaimResourceRewards = async (input: { address: string }) => {
    if (!week) {
      toast.error('Week not found, please try again later');
      return;
    }
    return claimResourceRewards({
      resourceManager: input.address,
      weekId: week.id,
      seasonId: week.seasonId,
    });
  };

  const { resourceRewards, totalPointsEarned } = useMemo(() => {
    if (!resourceRewardsData)
      return { resourceRewards: [], totalPointsEarned: undefined };

    const items = resourceRewardsData?.map((item) => ({
      name: item.name!,
      iconUrl: item.iconUrl!,
      address: item.address!,
      points: item.points,
      weeklyLimit: item.weeklyLimit ? item.weeklyLimit : undefined,
      url: item.url,
      claims: persona
        ? (userResourceRewardsData?.claims
            .filter((claim) => claim.resourceManager === item.address)
            .map((claim) => ({
              localId: claim.localId,
              claimedAt: claim.claimedAt,
            })) ?? [])
        : [],
      nfHoldings: persona
        ? (userResourceRewardsData?.nfHoldings
            .filter((holding) => holding.resourceManager === item.address)
            .flatMap((holding) => holding.nfIds) ?? [])
        : [],
    }));

    const totalPointsEarned = persona
      ? items.reduce(
          (total, item) =>
            total +
            (item.weeklyLimit
              ? Math.min(item.claims.length, item.weeklyLimit) * item.points
              : item.claims.length * item.points),
          0,
        )
      : 0;

    return {
      resourceRewards: items,
      totalPointsEarned: totalPointsEarned.toString(),
    };
  }, [resourceRewardsData, userResourceRewardsData, persona]);

  return (
    <div className="space-y-6">
      <EarnPageItemCategoryCard
        name={categoryData?.name ?? undefined}
        description={categoryData?.description ?? undefined}
        loading={isLoading}
        totalPointsEarned={totalPointsEarned}
      />

      <ResourceRewardList
        resourceRewards={resourceRewards ?? []}
        onClaim={handleClaimResourceRewards}
        isLoggedIn={!!persona}
        isLoading={isLoadingResourceRewards || (!!persona && isLoadingUserData)}
      />
    </div>
  );
}
