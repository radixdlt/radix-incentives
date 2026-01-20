'use client';

import BigNumber from 'bignumber.js';
import { Gift, Hash, Trophy, Wallet } from 'lucide-react';
import { MetricCard } from '~/components/dashboard';
import { EmptyState } from '~/components/ui/empty-state';
import { usePersona } from '~/lib/hooks/usePersona';
import { formatActivityPoints } from '~/lib/utils';
import { api } from '~/trpc/react';
import { SeasonCompleteBanner } from './season-complete-banner';

type Season = {
  id: string;
  name: string;
  status: string;
};

type SeasonOverDashboardProps = {
  seasons: Season[];
};

export const SeasonOverDashboard = ({ seasons }: SeasonOverDashboardProps) => {
  const { persona } = usePersona();

  // Get the most recently completed season
  const completedSeason = seasons.find((s) => s.status === 'completed');

  // Fetch leaderboard data for user's rank and points
  const { data: leaderboardData, isLoading: leaderboardLoading } =
    api.leaderboard.getSeasonLeaderboard.useQuery(
      { seasonId: completedSeason?.id ?? '' },
      { enabled: !!completedSeason && !!persona },
    );

  // Fetch user's season reward
  const { data: userSeasonRewards, isLoading: rewardsLoading } =
    api.seasonReward.getUserSeasonRewards.useQuery(undefined, {
      enabled: !!persona,
    });

  const seasonReward = userSeasonRewards?.find(
    (r) => r.seasonId === completedSeason?.id,
  );

  const isLoading = leaderboardLoading || rewardsLoading;

  if (!completedSeason) {
    return null;
  }

  if (!persona) {
    return (
      <div className="space-y-6">
        <SeasonCompleteBanner seasonName={completedSeason.name} />
        <EmptyState
          title={`<a class="text-lg hover:underline" href="/dashboard/accounts">No connected accounts</a>`}
          description="Please connect your wallet to see your season results and claim rewards."
          icon={Wallet}
          className="max-w-full"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SeasonCompleteBanner seasonName={completedSeason.name} />
        <div className="flex h-48 items-center justify-center">
          <div className="text-xl">Loading your results...</div>
        </div>
      </div>
    );
  }

  const userRank = leaderboardData?.userStats?.rank;
  const userPoints = leaderboardData?.userStats?.totalPoints;
  const rewardAmount = seasonReward?.amount;

  return (
    <div className="space-y-6">
      <SeasonCompleteBanner seasonName={completedSeason.name} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Final Rank"
          value={userRank ? `#${userRank.toLocaleString()}` : '-'}
          icon={Hash}
          description={`Your position in ${completedSeason.name}`}
          iconColor="text-purple-500"
          noHover
        />

        <MetricCard
          title="Season Points"
          value={userPoints ? formatActivityPoints(userPoints) : '-'}
          icon={Trophy}
          description="Total points earned"
          iconColor="text-amber-500"
          noHover
        />

        {rewardAmount && new BigNumber(rewardAmount).gt(0) ? (
          <MetricCard
            title="Reward Amount"
            value={formatActivityPoints(rewardAmount)}
            icon={Gift}
            description="Your reward"
            iconColor="text-green-500"
            noHover
          />
        ) : (
          <MetricCard
            title="Reward Amount"
            value="-"
            icon={Gift}
            description="No reward (below threshold)"
            iconColor="text-gray-500"
            noHover
          />
        )}
      </div>
    </div>
  );
};
