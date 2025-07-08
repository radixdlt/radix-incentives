"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Podium } from "./podium";
import { UserStats } from "./user-stats";

export function ActivityLeaderboard() {
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");

  // Fetch available weeks and activities
  const { data: weeks, isLoading: weeksLoading } =
    api.leaderboard.getAvailableWeeks.useQuery({});
  const { data: activities, isLoading: activitiesLoading } =
    api.leaderboard.getAvailableActivities.useQuery();

  // Set defaults when data loads
  useEffect(() => {
    if (weeks && weeks.length > 0 && !selectedWeekId) {
      // Default to the most recent active or completed week
      const activeWeek = weeks.find((w) => w.status === "active") || weeks[0];
      if (activeWeek) {
        setSelectedWeekId(activeWeek.id);
      }
    }
  }, [weeks, selectedWeekId]);

  useEffect(() => {
    if (activities && activities.length > 0 && !selectedActivityId) {
      // Default to first activity
      // biome-ignore lint/style/noNonNullAssertion: always activities
      setSelectedActivityId(activities[0]!.id);
    }
  }, [activities, selectedActivityId]);

  // Fetch activity leaderboard data
  const { data: leaderboardData, isLoading: leaderboardLoading } =
    api.leaderboard.getActivityLeaderboard.useQuery(
      {
        activityId: selectedActivityId,
        weekId: selectedWeekId,
      },
      { enabled: !!selectedActivityId && !!selectedWeekId }
    );

  if (weeksLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading data...</div>
      </div>
    );
  }

  if (!weeks || weeks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">No weeks available yet.</div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          No activities available yet.
        </div>
      </div>
    );
  }

  const formatActivityName = (name: string | null, id?: string) => {
    if (!name) {
      // Fall back to ID if name is null
      return id ? id.replace(/_/g, " ").toUpperCase() : "UNKNOWN ACTIVITY";
    }
    return name.replace(/_/g, " ").toUpperCase();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPoints = (points: string) => {
    const num = Number.parseFloat(points);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);
  const selectedActivity = activities.find((a) => a.id === selectedActivityId);

  return (
    <div className="space-y-6">
      {/* Week and Activity Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="week-select" className="text-sm font-medium">
            Week:
          </label>
          <select
            id="week-select"
            value={selectedWeekId}
            onChange={(e) => setSelectedWeekId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {weeks.map((week) => (
              <option key={week.id} value={week.id}>
                {formatDate(week.startDate)} - {formatDate(week.endDate)} (
                {week.seasonName})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="activity-select" className="text-sm font-medium">
            Activity:
          </label>
          <select
            id="activity-select"
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {formatActivityName(activity.name, activity.id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Week and Activity Info */}
      {selectedWeek && selectedActivity && (
        <div className="p-4 rounded-lg bg-muted/50">
          <h3 className="font-medium">
            {formatActivityName(selectedActivity.name, selectedActivity.id)} -
            Week of {formatDate(selectedWeek.startDate)}
          </h3>
          {selectedActivity.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {selectedActivity.description}
            </p>
          )}
        </div>
      )}

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
              pointsLabel="activity points"
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
              pointsLabel="activity points"
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No activity data available for this week and activity combination.
          </div>
        </div>
      )}
    </div>
  );
}
