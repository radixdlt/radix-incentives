'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMostRecentWeek } from '~/lib/hooks/useMostRecentWeek';
import { usePersona } from '~/lib/hooks/usePersona';
import { api } from '~/trpc/react';
import { EarnPageItemCategoryCard } from '../components/EarnPageItemCategoryCard';
import { EarnPageItemHeader } from '../components/EarnPageItemHeader';
import {
  ResourceRewardList,
  type ResourceRewardListProps,
} from './components/ResourceRewardList';

const categoryId = 'resourceRewards';

export default function ResourceRewardsPage() {
  const utils = api.useUtils();
  const [resourceRewards, setResourceRewards] = useState<
    ResourceRewardListProps['resourceRewards']
  >([]);
  const [totalPointsEarned, setTotalPointsEarned] = useState<
    string | undefined
  >(undefined);
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

  useMemo(() => {
    if (resourceRewardsData) {
      const items = resourceRewardsData?.map((item) => ({
        name: item.name!,
        iconUrl: item.iconUrl!,
        address: item.address!,
        points: item.points,
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
            (total, item) => total + item.claims.length * item.points,
            0,
          )
        : 0;

      setResourceRewards(items);
      setTotalPointsEarned(totalPointsEarned.toString());
    } else {
      setResourceRewards([]);
      setTotalPointsEarned(undefined);
    }
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
