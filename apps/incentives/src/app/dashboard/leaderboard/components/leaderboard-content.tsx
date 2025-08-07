'use client';

import { Podium } from './podium';
import { UserStats } from './user-stats';

interface User {
  userId: string;
  label: string | null;
  totalPoints: string;
  rank: number;
}

interface UserStatsData {
  rank: number;
  totalPoints: string;
  percentile: number;
  activityBreakdown?: Array<{
    activityId: string;
    activityName: string;
    points: string;
  }>;
}

interface GlobalStats {
  totalUsers: number;
  median: string;
  average: string;
}

interface LeaderboardContentProps {
  topUsers: User[];
  userStats: UserStatsData | null;
  globalStats: GlobalStats;
  pointsLabel: string;
  emptyMessage: string;
  isUserConnected?: boolean;
}

export function LeaderboardContent({
  topUsers,
  userStats,
  globalStats,
  pointsLabel,
  emptyMessage,
  isUserConnected = false,
}: LeaderboardContentProps) {
  if (topUsers.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Podium */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold text-lg">Top Performers</h3>
        <Podium
          users={topUsers}
          pointsLabel={pointsLabel}
          userStats={
            userStats
              ? {
                  rank: userStats.rank,
                  totalPoints: userStats.totalPoints,
                }
              : null
          }
        />
      </div>

      {/* User Stats - Always show */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold text-lg">Your Performance</h3>
        <UserStats
          stats={userStats}
          globalStats={globalStats}
          pointsLabel={pointsLabel}
          isUserConnected={isUserConnected}
        />
      </div>
    </div>
  );
}
