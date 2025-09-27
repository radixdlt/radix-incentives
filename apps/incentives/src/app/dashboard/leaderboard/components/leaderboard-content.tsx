'use client';

import { Podium } from './podium';
import { ReferralStats } from './referral-stats';
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
  categoryBreakdown?: Array<{
    categoryId: string;
    categoryName: string;
    points: string;
  }>;
}

interface GlobalStats {
  totalUsers: number;
  totalUsersInSystem: number;
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
  referralCode?: string;
  numberOfReferrals?: number;
  referralPoints?: string;
  isReferralStatsLoading?: boolean;
  referralPercentage?: number;
  showReferralStats?: boolean;
}

export function LeaderboardContent({
  topUsers,
  userStats,
  globalStats,
  pointsLabel,
  emptyMessage,
  isUserConnected = false,
  referralCode,
  numberOfReferrals,
  referralPoints,
  isReferralStatsLoading = false,
  referralPercentage,
  showReferralStats = false,
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

      {isUserConnected && showReferralStats && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold text-lg">Referral Stats</h3>
          <ReferralStats
            referralCode={referralCode}
            numberOfReferrals={numberOfReferrals}
            referralPoints={referralPoints}
            isLoading={isReferralStatsLoading}
            percentage={referralPercentage}
          />
        </div>
      )}
    </div>
  );
}
