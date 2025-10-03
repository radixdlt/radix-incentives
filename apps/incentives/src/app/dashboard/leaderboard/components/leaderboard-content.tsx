'use client';

import { LayoutList, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { LeaderboardListView } from './leaderboard-list-view';
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
  seasonId?: string;
  categoryId?: string;
  weekId?: string;
}

type ViewMode = 'podium' | 'list';

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
  seasonId,
  categoryId,
  weekId,
}: LeaderboardContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('podium');

  if (topUsers.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Ranking Section with View Toggle */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Ranking</h3>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'podium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('podium')}
              className="!px-4 flex h-8 items-center gap-1 py-1 text-xs"
            >
              <Trophy className="h-3 w-3" />
              Podium
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="!px-4 flex h-8 items-center gap-1 py-1 text-xs"
            >
              <LayoutList className="h-3 w-3" />
              List
            </Button>
          </div>
        </div>

        {viewMode === 'podium' ? (
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
        ) : (
          <LeaderboardListView
            seasonId={seasonId}
            categoryId={categoryId}
            weekId={weekId}
            pointsLabel={pointsLabel}
            highlightUserId={
              userStats && isUserConnected
                ? Object.values(topUsers).find((u) => u.rank === userStats.rank)
                    ?.userId
                : undefined
            }
            currentUserRank={
              userStats && isUserConnected ? userStats.rank : undefined
            }
            isSeasonView={!!seasonId}
          />
        )}
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
