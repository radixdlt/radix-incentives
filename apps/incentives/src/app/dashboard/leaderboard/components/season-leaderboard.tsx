'use client';

import { useEffect, useState } from 'react';
import { usePersona } from '~/lib/hooks/usePersona';
import { api } from '~/trpc/react';
import { EmptyState } from './empty-state';
import { LeaderboardBuildingState } from './leaderboard-building-state';
import { LeaderboardContent } from './leaderboard-content';
import { LoadingState } from './loading-state';
import { SeasonSelector } from './season-selector';
import { WeekInProgressState } from './week-in-progress-state';

export function SeasonLeaderboard() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const persona = usePersona();
  const utils = api.useUtils();

  // Fetch available seasons
  const { data: seasons, isLoading: seasonsLoading } =
    api.leaderboard.getAvailableSeasons.useQuery();

  // Fetch weeks for the selected season to check current week status
  const { data: weeks } = api.leaderboard.getAvailableWeeks.useQuery(
    { seasonId: selectedSeasonId },
    { enabled: !!selectedSeasonId },
  );

  const { data: referralStats, isLoading: referralStatsLoading } =
    api.user.getUserReferralStats.useQuery(
      { seasonId: selectedSeasonId },
      { enabled: !!selectedSeasonId },
    );

  // Set default season when seasons load and prefetch other seasons with cache
  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeasonId) {
      // Default to the most recent active or completed season
      const activeSeason =
        seasons.find((s) => s.status === 'active') || seasons[0];
      if (activeSeason) {
        setSelectedSeasonId(activeSeason.id);

        // Prefetch leaderboard data for other recent seasons
        const otherRecentSeasons = seasons
          .slice(0, 3)
          .filter((s) => s.id !== activeSeason.id);
        for (const season of otherRecentSeasons) {
          // Directly prefetch - if cache isn't available, it will fail gracefully
          utils.leaderboard.getSeasonLeaderboard
            .prefetch({ seasonId: season.id })
            .catch(() => {
              // Silently ignore prefetch errors (cache not available)
            });
        }
      }
    }
  }, [seasons, selectedSeasonId, utils]);

  // Fetch season leaderboard data directly - cache check now happens in backend
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = api.leaderboard.getSeasonLeaderboard.useQuery(
    { seasonId: selectedSeasonId },
    {
      enabled: !!selectedSeasonId,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry if it's a cache building error
        if (error?.data?.code === 'PRECONDITION_FAILED') {
          return false;
        }
        return failureCount < 2;
      },
    },
  );

  // Refetch leaderboard data when persona changes to ensure fresh data
  useEffect(() => {
    // Force invalidation and refetch when user connects/disconnects
    if (selectedSeasonId) {
      utils.leaderboard.getSeasonLeaderboard.invalidate().then(() => {
        refetchLeaderboard();
      });
    }
  }, [refetchLeaderboard, selectedSeasonId, utils]);

  if (seasonsLoading) {
    return <LoadingState message="Loading seasons..." />;
  }

  if (!seasons || seasons.length === 0) {
    return <EmptyState message="No seasons available yet." />;
  }

  return (
    <div className="space-y-6">
      {/* Season Selector */}
      <SeasonSelector
        seasons={seasons}
        selectedSeasonId={selectedSeasonId}
        onSeasonChange={setSelectedSeasonId}
      />

      {leaderboardLoading ? (
        <LoadingState message="Loading leaderboard..." />
      ) : leaderboardError ? (
        (() => {
          const isPreconditionFailed =
            leaderboardError.data?.code === 'PRECONDITION_FAILED';

          if (isPreconditionFailed) {
            // Check if we have weeks and if we're in the first week of the season
            const now = new Date();
            const sortedWeeks = weeks?.sort(
              (a, b) => a.startDate.getTime() - b.startDate.getTime(),
            );
            const firstWeek = sortedWeeks?.[0];
            const currentWeek = weeks?.find(
              (week) => now >= week.startDate && now <= week.endDate,
            );

            // Show week in progress only if we're in the first week of the season
            if (currentWeek && firstWeek && currentWeek.id === firstWeek.id) {
              return (
                <WeekInProgressState
                  message="This season's leaderboard will be available after the first week ends."
                  weekStart={currentWeek.startDate}
                  weekEnd={currentWeek.endDate}
                />
              );
            }

            // Otherwise it's just being built (for subsequent weeks or other cases)
            return (
              <LeaderboardBuildingState
                message={
                  leaderboardError.message ||
                  'Season leaderboard data is being processed. Please check back in a few minutes.'
                }
                title="Season Leaderboard Being Built"
              />
            );
          }

          return (
            <EmptyState message="Failed to load leaderboard data. Please try again later." />
          );
        })()
      ) : leaderboardData ? (
        <LeaderboardContent
          topUsers={leaderboardData.topUsers}
          userStats={leaderboardData.userStats}
          globalStats={leaderboardData.globalStats}
          pointsLabel="season points"
          emptyMessage="Leaderboard data is being processed. Please check back later."
          isUserConnected={!!persona}
          referralCode={referralStats?.referralCode}
          numberOfReferrals={referralStats?.numberOfReferrals}
          referralPoints={referralStats?.referralPoints}
          isReferralStatsLoading={referralStatsLoading}
          referralPercentage={referralStats?.percentage}
        />
      ) : (
        <LoadingState message="Loading leaderboard..." />
      )}
    </div>
  );
}
