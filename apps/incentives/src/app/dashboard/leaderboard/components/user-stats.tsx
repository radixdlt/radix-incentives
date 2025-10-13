import { StackedProgressBar } from '~/components/ui/stacked-progress-bar';

interface UserStatsProps {
  stats: {
    rank: number;
    totalPoints: string;
    percentile: number;
    activityBreakdown?: Array<{
      activityId: string;
      activityName: string;
      points: string;
    }>;
    categoryBreakdown?: Array<{
      categoryId: string;
      categoryName: string;
      points: string;
    }>;
  } | null;
  globalStats: {
    totalUsers: number;
    totalUsersInSystem: number;
    median: string;
    average: string;
  };
  pointsLabel?: string;
  isUserConnected?: boolean;
}

export function UserStats({
  stats,
  globalStats,
  pointsLabel = 'points',
  isUserConnected = false,
}: UserStatsProps) {
  const formatPoints = (points: string) => {
    const num = Number.parseFloat(points);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const _getRankSuffix = (rank: number) => {
    if (rank >= 11 && rank <= 13) return 'th';
    switch (rank % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  // If no stats, show appropriate message based on connection status
  if (!stats) {
    const title = isUserConnected
      ? 'No Points Yet'
      : 'Not Currently Participating';

    const description = isUserConnected
      ? `You haven't earned any ${pointsLabel} in this category yet. Start participating to see your stats here!`
      : `Connect your wallet and start earning ${pointsLabel} to see your performance stats here.`;

    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="mb-2 font-medium text-lg">{title}</div>
          <p className="mb-4 text-muted-foreground text-sm">{description}</p>
          <div className="text-muted-foreground text-xs">
            Total participants: {globalStats.totalUsers.toLocaleString()} of{' '}
            {globalStats.totalUsersInSystem.toLocaleString()} users
          </div>
        </div>

        {/* Still show global stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h4 className="mb-2 font-medium">Community Average</h4>
            <div className="font-semibold text-lg">
              {formatPoints(globalStats.average)}
            </div>
            <div className="mt-1 text-muted-foreground text-sm">
              {pointsLabel} per participant
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h4 className="mb-2 font-medium">Community Median</h4>
            <div className="font-semibold text-lg">
              {formatPoints(globalStats.median)}
            </div>
            <div className="mt-1 text-muted-foreground text-sm">
              {pointsLabel} per participant
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Grid - Better mobile layout */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="glass-card col-span-2 rounded-lg p-3 text-center sm:col-span-1 sm:p-4">
          <div className="mb-2 font-medium text-sm text-white/80">
            Your {pointsLabel}
          </div>
          <div className="gradient-text font-bold text-2xl text-white tracking-tight sm:text-4xl">
            {formatPoints(stats.totalPoints)}
          </div>
        </div>

        <div className="glass-card rounded-lg p-3 text-center sm:p-4">
          <div className="mb-2 font-medium text-sm text-white/80">Ranking</div>
          <div className="gradient-text font-bold text-2xl text-white tracking-tight sm:text-4xl">
            #{stats.rank}
          </div>
        </div>

        <div className="glass-card rounded-lg p-3 text-center sm:p-4">
          <div className="mb-2 font-medium text-sm text-white/80">
            Percentile
          </div>
          <div className="gradient-text font-bold text-2xl text-white tracking-tight sm:text-4xl">
            {stats.percentile}%
          </div>
        </div>
      </div>

      {/* Performance Comparison and Global Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <h4 className="mb-2 font-medium text-sm sm:text-base">vs. Average</h4>
          <div className="flex items-center gap-2">
            <div className="font-semibold text-base sm:text-lg">
              {formatPoints(stats.totalPoints)}
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">vs</div>
            <div className="text-base sm:text-lg">
              {formatPoints(globalStats.average)}
            </div>
          </div>
          <div className="mt-1 text-muted-foreground text-xs sm:text-sm">
            {Number.parseFloat(stats.totalPoints) >
            Number.parseFloat(globalStats.average)
              ? 'Above average'
              : Number.parseFloat(stats.totalPoints) ===
                  Number.parseFloat(globalStats.average)
                ? 'At average'
                : 'Below average'}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <h4 className="mb-2 font-medium text-sm sm:text-base">vs. Median</h4>
          <div className="flex items-center gap-2">
            <div className="font-semibold text-base sm:text-lg">
              {formatPoints(stats.totalPoints)}
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">vs</div>
            <div className="text-base sm:text-lg">
              {formatPoints(globalStats.median)}
            </div>
          </div>
          <div className="mt-1 text-muted-foreground text-xs sm:text-sm">
            {Number.parseFloat(stats.totalPoints) >
            Number.parseFloat(globalStats.median)
              ? 'Above median'
              : Number.parseFloat(stats.totalPoints) ===
                  Number.parseFloat(globalStats.median)
                ? 'At median'
                : 'Below median'}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 sm:col-span-2 sm:p-4 lg:col-span-1">
          <h4 className="mb-2 font-medium text-sm sm:text-base">
            Participants
          </h4>
          <div className="font-semibold text-base sm:text-lg">
            {globalStats.totalUsers.toLocaleString()} of{' '}
            {globalStats.totalUsersInSystem.toLocaleString()}
          </div>
          <div className="mt-1 text-muted-foreground text-xs sm:text-sm">
            Total users
          </div>
        </div>
      </div>

      {/* Sub-Activities Breakdown (for category leaderboard) */}
      {stats?.activityBreakdown && stats.activityBreakdown.length > 0 && (
        <div className="space-y-4">
          <StackedProgressBar
            items={stats.activityBreakdown.map((activity) => ({
              id: activity.activityId,
              name: activity.activityName || activity.activityId,
              value: Number.parseFloat(activity.points),
            }))}
            title="Your Sub-Activities"
            formatValue={(value) => formatPoints(value.toString())}
            valueSuffix=" AP"
          />
        </div>
      )}

      {/* Category Breakdown (for season leaderboard) */}
      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="space-y-4">
          <StackedProgressBar
            items={stats.categoryBreakdown.map((category) => ({
              id: category.categoryId,
              name: category.categoryName || category.categoryId,
              value: Number.parseFloat(category.points),
            }))}
            title="Your Category Breakdown"
            formatValue={(value) => formatPoints(value.toString())}
            valueSuffix=" SP"
          />
        </div>
      )}
    </div>
  );
}
