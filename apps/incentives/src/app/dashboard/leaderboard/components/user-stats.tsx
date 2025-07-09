interface UserStatsProps {
  stats: {
    rank: number;
    totalPoints: string;
    percentile: number;
    accountContributions?: Array<{
      accountAddress: string;
      accountLabel: string;
      points: string;
    }>;
  } | null;
  globalStats: {
    totalUsers: number;
    median: string;
    average: string;
  };
  pointsLabel?: string;
  isUserConnected?: boolean;
}

export function UserStats({
  stats,
  globalStats,
  pointsLabel = "points",
  isUserConnected = false,
}: UserStatsProps) {
  const formatPoints = (points: string) => {
    const num = Number.parseFloat(points);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-6)}`;
  };

  const getRankSuffix = (rank: number) => {
    if (rank >= 11 && rank <= 13) return "th";
    switch (rank % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  // If no stats, show appropriate message based on connection status
  if (!stats) {
    const title = isUserConnected 
      ? "No Points Yet" 
      : "Not Currently Participating";
    
    const description = isUserConnected
      ? `You haven't earned any ${pointsLabel} in this category yet. Start participating to see your stats here!`
      : `Connect your wallet and start earning ${pointsLabel} to see your performance stats here.`;

    return (
      <div className="space-y-6">
        <div className="text-center p-6 rounded-lg border bg-card">
          <div className="text-lg font-medium mb-2">{title}</div>
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
          <div className="text-xs text-muted-foreground">
            Total participants: {globalStats.totalUsers.toLocaleString()}
          </div>
        </div>

        {/* Still show global stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Community Average</h4>
            <div className="text-lg font-semibold">
              {formatPoints(globalStats.average)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {pointsLabel} per participant
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Community Median</h4>
            <div className="text-lg font-semibold">
              {formatPoints(globalStats.median)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50 col-span-2 sm:col-span-1">
          <div className="text-lg sm:text-2xl font-bold">
            {formatPoints(stats.totalPoints)}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Your {pointsLabel}
          </div>
        </div>

        <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50">
          <div className="text-lg sm:text-2xl font-bold text-primary">
            #{stats.rank} of {globalStats.totalUsers.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Ranking</div>
        </div>

        <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {stats.percentile}%
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Percentile</div>
        </div>
      </div>

      {/* Performance Comparison and Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-2 text-sm sm:text-base">vs. Average</h4>
          <div className="flex items-center gap-2">
            <div className="text-base sm:text-lg font-semibold">
              {formatPoints(stats.totalPoints)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">vs</div>
            <div className="text-base sm:text-lg">{formatPoints(globalStats.average)}</div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
            {Number.parseFloat(stats.totalPoints) >
            Number.parseFloat(globalStats.average)
              ? "Above average"
              : Number.parseFloat(stats.totalPoints) ===
                  Number.parseFloat(globalStats.average)
                ? "At average"
                : "Below average"}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-2 text-sm sm:text-base">vs. Median</h4>
          <div className="flex items-center gap-2">
            <div className="text-base sm:text-lg font-semibold">
              {formatPoints(stats.totalPoints)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">vs</div>
            <div className="text-base sm:text-lg">{formatPoints(globalStats.median)}</div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
            {Number.parseFloat(stats.totalPoints) >
            Number.parseFloat(globalStats.median)
              ? "Above median"
              : Number.parseFloat(stats.totalPoints) ===
                  Number.parseFloat(globalStats.median)
                ? "At median"
                : "Below median"}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg border bg-card sm:col-span-2 lg:col-span-1">
          <h4 className="font-medium mb-2 text-sm sm:text-base">Participants</h4>
          <div className="text-base sm:text-lg font-semibold">
            {globalStats.totalUsers.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1">Total users</div>
        </div>
      </div>

      {/* Account Contributions (for activity leaderboard) */}
      {stats?.accountContributions && stats.accountContributions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Your Account Contributions</h4>
          <div className="space-y-2">
            {stats.accountContributions.map((account) => (
              <div
                key={account.accountAddress}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <div className="font-medium text-sm">
                    {account.accountLabel}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {truncateAddress(account.accountAddress)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatPoints(account.points)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pointsLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
