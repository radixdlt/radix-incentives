"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { usePersona } from "~/lib/hooks/usePersona";
import { SeasonSelector } from "./season-selector";
import { LeaderboardContent } from "./leaderboard-content";
import { LoadingState } from "./loading-state";
import { EmptyState } from "./empty-state";

export function SeasonLeaderboard() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const persona = usePersona();
  const utils = api.useUtils();

  // Fetch available seasons
  const { data: seasons, isLoading: seasonsLoading } =
    api.leaderboard.getAvailableSeasons.useQuery();

  // Set default season when seasons load and prefetch other seasons with cache
  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeasonId) {
      // Default to the most recent active or completed season
      const activeSeason =
        seasons.find((s) => s.status === "active") || seasons[0];
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
        if (error?.data?.code === "PRECONDITION_FAILED") {
          return false;
        }
        return failureCount < 2;
      },
    }
  );

  // Refetch leaderboard data when persona changes to ensure fresh data
  useEffect(() => {
    // Force invalidation and refetch when user connects/disconnects
    if (selectedSeasonId) {
      utils.leaderboard.getSeasonLeaderboard.invalidate().then(() => {
        refetchLeaderboard();
      });
    }
  }, [persona, refetchLeaderboard, selectedSeasonId, utils]);

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
        <EmptyState
          message={
            leaderboardError.data?.code === "PRECONDITION_FAILED"
              ? leaderboardError.message ||
                "Leaderboard data is being processed. Please check back in a few minutes."
              : "Failed to load leaderboard data. Please try again later."
          }
        />
      ) : leaderboardData ? (
        <LeaderboardContent
          topUsers={leaderboardData.topUsers}
          userStats={leaderboardData.userStats}
          globalStats={leaderboardData.globalStats}
          pointsLabel="season points"
          emptyMessage="Leaderboard data is being processed. Please check back later."
          isUserConnected={!!persona}
        />
      ) : (
        <LoadingState message="Loading leaderboard..." />
      )}
    </div>
  );
}