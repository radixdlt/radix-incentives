'use client';

import { useState, useEffect } from 'react';
import { api } from '~/trpc/react';
import { usePersona } from '~/lib/hooks/usePersona';
import { ActivitySelectors } from './activity-selectors';
import { ActivityInfo } from './activity-info';
import { LeaderboardContent } from './leaderboard-content';
import { LoadingState } from './loading-state';
import { EmptyState } from './empty-state';

export function ActivityLeaderboard() {
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const persona = usePersona();

  // Fetch available weeks and activities
  const { data: weeks, isLoading: weeksLoading } =
    api.leaderboard.getAvailableWeeks.useQuery({});
  const { data: activities, isLoading: activitiesLoading } =
    api.leaderboard.getAvailableActivities.useQuery();

  // Set defaults when data loads
  useEffect(() => {
    if (weeks && weeks.length > 0 && !selectedWeekId) {
      // Default to the most recent active or completed week
      const activeWeek = weeks[0];
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
      { enabled: !!selectedActivityId && !!selectedWeekId },
    );

  if (weeksLoading || activitiesLoading) {
    return <LoadingState message="Loading data..." />;
  }

  if (!weeks || weeks.length === 0) {
    return <EmptyState message="No weeks available yet." />;
  }

  if (!activities || activities.length === 0) {
    return <EmptyState message="No activities available yet." />;
  }

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);
  const selectedActivity = activities.find((a) => a.id === selectedActivityId);

  return (
    <div className="space-y-6">
      {/* Week and Activity Selectors */}
      <ActivitySelectors
        weeks={weeks}
        activities={activities}
        selectedWeekId={selectedWeekId}
        selectedActivityId={selectedActivityId}
        onWeekChange={setSelectedWeekId}
        onActivityChange={setSelectedActivityId}
      />

      {/* Selected Week and Activity Info */}
      {selectedWeek && selectedActivity && (
        <ActivityInfo week={selectedWeek} activity={selectedActivity} />
      )}

      {leaderboardLoading ? (
        <LoadingState message="Loading leaderboard..." />
      ) : leaderboardData ? (
        <LeaderboardContent
          topUsers={leaderboardData.topUsers}
          userStats={leaderboardData.userStats}
          globalStats={leaderboardData.globalStats}
          pointsLabel="activity points"
          emptyMessage="No activity data available for this week and activity combination."
          isUserConnected={!!persona}
        />
      ) : (
        <EmptyState message="No activity data available for this week and activity combination." />
      )}
    </div>
  );
}
