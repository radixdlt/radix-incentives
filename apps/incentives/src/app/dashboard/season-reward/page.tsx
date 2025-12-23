'use client';

import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { EmptyState } from './components/empty-state';
import PageHeader from './components/header';
import { LoadingSkeleton } from './components/loading-skeleton';
import { SeasonRewardCard } from './components/season-reward-card';

export default function SeasonRewardPage() {
  const { data: seasons, isLoading: seasonsLoading } =
    api.season.getSeasons.useQuery();
  const { data: userSeasonRewards, isLoading: rewardsLoading } =
    api.seasonReward.getUserSeasonRewards.useQuery();
  const { data: allClaims, isLoading: claimsLoading } =
    api.seasonReward.getAllUserSeasonRewardClaims.useQuery();
  const router = useRouter();

  const isLoading = seasonsLoading || rewardsLoading || claimsLoading;

  const rewardsWithSeasonInfo = userSeasonRewards
    ?.map((reward) => {
      const season = seasons?.find((s) => s.id === reward.seasonId);
      const claims =
        allClaims?.filter((c) => c.seasonId === reward.seasonId) ?? [];
      return {
        ...reward,
        seasonName: season?.name ?? 'Unknown Season',
        claims,
      };
    })
    .filter((reward) => reward.seasonName !== 'Unknown Season');

  const hasRewards = rewardsWithSeasonInfo && rewardsWithSeasonInfo.length > 0;

  return (
    <div>
      <PageHeader>Season Rewards</PageHeader>

      <div className="mt-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : hasRewards ? (
          <div className="grid gap-4 md:grid-cols-2">
            {rewardsWithSeasonInfo.map((reward) => (
              <SeasonRewardCard
                key={reward.seasonId}
                seasonName={reward.seasonName}
                amount={reward.amount}
                claims={reward.claims}
                onClaim={() => {
                  router.push(`/dashboard/season-reward/${reward.seasonId}`);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
