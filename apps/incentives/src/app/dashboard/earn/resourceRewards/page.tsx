'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import { useMostRecentWeek } from '~/lib/hooks/useMostRecentWeek';
import { usePersona } from '~/lib/hooks/usePersona';
import { api } from '~/trpc/react';
import { EarnPageItemCategoryCard } from '../components/EarnPageItemCategoryCard';
import { EarnPageItemHeader } from '../components/EarnPageItemHeader';
import { ResourceRewardList } from './components/ResourceRewardList';

const categoryId = 'resourceRewards';

export default function ResourceRewardsPage() {
  const utils = api.useUtils();

  const week = useMostRecentWeek();
  const { persona } = usePersona();

  const { data: earnPageData, isLoading } =
    api.activityCategory.getEarnPageData.useQuery(
      { weekId: week?.id ?? '' },
      { enabled: !!week },
    );

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

  const categoryData = earnPageData?.find(
    (category) => category.id === categoryId,
  );

  const { data: resourceRewardsData } =
    api.resourceReward.getResourceRewards.useQuery();

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
      <EarnPageItemHeader />

      <EarnPageItemCategoryCard
        name={categoryData?.name}
        description={categoryData?.description}
        loading={isLoading}
        totalPointsEarned={totalPointsEarned}
      />

      <ResourceRewardList
        resourceRewards={resourceRewards ?? []}
        onClaim={handleClaimResourceRewards}
        isLoggedIn={!!persona}
      />
    </div>
  );
}
