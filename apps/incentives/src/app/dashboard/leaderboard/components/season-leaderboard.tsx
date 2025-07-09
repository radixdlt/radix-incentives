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

  // Fetch available seasons
  const { data: seasons, isLoading: seasonsLoading } =
    api.leaderboard.getAvailableSeasons.useQuery();

  // Set default season when seasons load
  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeasonId) {
      // Default to the most recent active or completed season
      const activeSeason =
        seasons.find((s) => s.status === "active") || seasons[0];
      if (activeSeason) {
        setSelectedSeasonId(activeSeason.id);
      }
    }
  }, [seasons, selectedSeasonId]);

  // Fetch season leaderboard data
  const { data: leaderboardData, isLoading: leaderboardLoading } =
    api.leaderboard.getSeasonLeaderboard.useQuery(
      { seasonId: selectedSeasonId },
      { enabled: !!selectedSeasonId }
    );

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
      ) : leaderboardData ? (
        <LeaderboardContent
          topUsers={leaderboardData.topUsers}
          userStats={leaderboardData.userStats}
          globalStats={leaderboardData.globalStats}
          pointsLabel="season points"
          emptyMessage="No data available for this season."
          isUserConnected={!!persona}
        />
      ) : (
        <EmptyState message="No data available for this season." />
      )}
    </div>
  );
}
