'use client';

import { MoveUpRight, Award, Zap, Wallet, Clock } from 'lucide-react';
import {
  MetricCard,
  ActivityBreakdown,
  AccountBalances,
} from '~/components/dashboard';
import { WeekSelector } from '~/components/dashboard/WeekSelector';
import { api } from '~/trpc/react';
import { EmptyState } from '~/components/ui/empty-state';
import { usePersona } from '~/lib/hooks/usePersona';
import { useDappToolkit } from '~/lib/hooks/useRdt';
import { useState, useEffect } from 'react';
import { getNextUpdateTime } from '~/lib/utils';

const NextUpdateNotification = () => {
  const [timeUntilUpdate, setTimeUntilUpdate] = useState('');

  useEffect(() => {
    setTimeUntilUpdate(getNextUpdateTime());

    const interval = setInterval(() => {
      setTimeUntilUpdate(getNextUpdateTime());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>
          Points calculations update every 2 hours. Next update in{' '}
          <span className="font-semibold text-foreground">
            {timeUntilUpdate}
          </span>
        </span>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const persona = usePersona();

  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const accounts = api.account.getAccounts.useQuery(undefined, {
    refetchOnMount: true,
    enabled: !!persona,
    retry: false,
  });

  const weeks = api.week.getWeeks.useQuery(undefined, {
    refetchOnMount: true,
  });

  // Set default selected week to the most recent week when weeks data is loaded
  useEffect(() => {
    if (weeks.data && weeks.data.length > 0 && !selectedWeek) {
      // Sort weeks by start date descending and select the most recent
      const sortedWeeks = [...weeks.data].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
      if (sortedWeeks[0]) {
        setSelectedWeek(sortedWeeks[0].id);
      }
    }
  }, [weeks.data, selectedWeek]);

  const userStats = api.user.getUserStats.useQuery(
    { weekId: selectedWeek ?? '' },
    {
      refetchOnMount: true,
      enabled:
        accounts.isSuccess && accounts.data?.length > 0 && !!selectedWeek,
      retry: false,
    },
  );

  const accountBalances = api.account.getLatestAccountBalances.useQuery(
    undefined,
    {
      refetchOnMount: true,
      enabled: accounts.isSuccess && accounts.data?.length > 0,
      retry: false,
    },
  );

  if (accounts.isLoading || weeks.isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (accounts.isError || weeks.isError) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl text-red-500">Error loading data.</div>
      </div>
    );
  }

  if (accounts.data?.length === 0 || !persona) {
    return (
      <div className="space-y-6">
        <EmptyState
          title={`<a class=" text-lg hover:underline" href="/dashboard/accounts">No connected accounts</a>`}
          description="Please register an account to see your stats."
          icon={Wallet}
          className="max-w-full"
        />
      </div>
    );
  }

  const latestWeekActivities =
    userStats.data?.activityPoints?.slice(-1)[0]?.activities ?? [];
  const latestWeeklyPoints = latestWeekActivities.reduce(
    (acc, activity) => acc + activity.points,
    0,
  );

  const totalSeasonPoints = userStats.data?.seasonPoints ?? 0;

  const activityBreakdownData = latestWeekActivities
    .map((activity) => ({
      name: activity.activityId, // TODO: Map activityId to a display name
      points: activity.points,
      percentage: 0,
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      <NextUpdateNotification />

      {weeks.data && (
        <WeekSelector
          weeks={weeks.data}
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Estimated Current Week"
          value={latestWeeklyPoints.toLocaleString()}
          icon={MoveUpRight}
          description="Activity Points earned this week"
          iconColor="text-green-500"
        />

        <MetricCard
          title="Estimated Current Season"
          value={Number(userStats.data?.seasonPoints.points).toLocaleString(
            undefined,
            {
              maximumFractionDigits: 2,
            },
          )}
          icon={MoveUpRight}
          description="Points earned this season"
          iconColor="text-green-500"
        />

        <MetricCard
          title="Multiplier"
          value={userStats.data?.multiplier?.value ?? '0'}
          icon={Zap}
          description="Current points multiplier"
          iconColor="text-amber-500"
        />

        <MetricCard
          title="Weekly Ranking"
          subtitle="Global"
          value={userStats.data?.seasonPoints.rank.toLocaleString() ?? 'n/a'}
          icon={Award}
          description="Global leaderboard position"
          iconColor="text-blue-500"
        />

        <ActivityBreakdown activities={activityBreakdownData} />
      </div>

      <AccountBalances
        balances={accountBalances.data || []}
        selectedAccounts={accounts.data || []}
      />
    </div>
  );
}
