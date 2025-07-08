"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Podium } from "./podium";
import { UserStats } from "./user-stats";

export function SeasonLeaderboard() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");

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
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    refetch: refetchLeaderboard,
  } = api.leaderboard.getSeasonLeaderboard.useQuery(
    { seasonId: selectedSeasonId },
    { enabled: !!selectedSeasonId }
  );

  if (seasonsLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading seasons...</div>
      </div>
    );
  }

  if (!seasons || seasons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">No seasons available yet.</div>
      </div>
    );
  }

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
  };

  const formatPoints = (points: string) => {
    const num = Number.parseFloat(points);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Season Selector */}
      <div className="flex items-center gap-4">
        <label htmlFor="season-select" className="text-sm font-medium">
          Season:
        </label>
        <select
          id="season-select"
          value={selectedSeasonId}
          onChange={(e) => handleSeasonChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name} ({season.status})
            </option>
          ))}
        </select>
      </div>

      {leaderboardLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-muted-foreground">Loading leaderboard...</div>
        </div>
      ) : leaderboardData && leaderboardData.topUsers.length > 0 ? (
        <div className="space-y-8">
          {/* Podium */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
            <Podium
              users={leaderboardData.topUsers}
              pointsLabel="season points"
              userStats={
                leaderboardData.userStats
                  ? {
                      rank: leaderboardData.userStats.rank,
                      totalPoints: leaderboardData.userStats.totalPoints,
                    }
                  : null
              }
            />
          </div>

          {/* User Stats - Always show */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Your Performance</h3>
            <UserStats
              stats={leaderboardData.userStats}
              globalStats={leaderboardData.globalStats}
              pointsLabel="season points"
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No data available for this season.
          </div>
        </div>
      )}
    </div>
  );
}
