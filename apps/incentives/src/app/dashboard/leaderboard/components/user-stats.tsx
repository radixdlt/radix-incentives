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
}

export function UserStats({
  stats,
  globalStats,
  pointsLabel = "points",
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

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold">
            {stats ? formatPoints(stats.totalPoints) : "N/A"}
          </div>
          <div className="text-sm text-muted-foreground">
            Your {pointsLabel}
          </div>
        </div>

        <div className="text-center p-4 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold text-primary">
            {stats
              ? `#${stats.rank} of ${globalStats.totalUsers.toLocaleString()}`
              : `0 of ${globalStats.totalUsers.toLocaleString()}`}
          </div>
          <div className="text-sm text-muted-foreground">Ranking</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold text-green-600">
            {stats ? `${stats.percentile}%` : "N/A"}
          </div>
          <div className="text-sm text-muted-foreground">Percentile</div>
        </div>
      </div>

      {/* Performance Comparison and Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-2">vs. Average</h4>
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold">
              {stats ? formatPoints(stats.totalPoints) : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">vs</div>
            <div className="text-lg">{formatPoints(globalStats.average)}</div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {stats
              ? Number.parseFloat(stats.totalPoints) >
                Number.parseFloat(globalStats.average)
                ? "Above average"
                : Number.parseFloat(stats.totalPoints) ===
                    Number.parseFloat(globalStats.average)
                  ? "At average"
                  : "Below average"
              : "Not participating"}
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-2">vs. Median</h4>
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold">
              {stats ? formatPoints(stats.totalPoints) : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">vs</div>
            <div className="text-lg">{formatPoints(globalStats.median)}</div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {stats
              ? Number.parseFloat(stats.totalPoints) >
                Number.parseFloat(globalStats.median)
                ? "Above median"
                : Number.parseFloat(stats.totalPoints) ===
                    Number.parseFloat(globalStats.median)
                  ? "At median"
                  : "Below median"
              : "Not participating"}
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-2">Participants</h4>
          <div className="text-lg font-semibold">
            {globalStats.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Total users</div>
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
