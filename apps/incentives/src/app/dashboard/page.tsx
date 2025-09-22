'use client';

import { Clock, MoveUpRight, Wallet, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MetricCard } from '~/components/dashboard';
import { EmptyState } from '~/components/ui/empty-state';
import { useIsAuthenticated } from '~/lib/hooks/useIsAuthenticated';
import { usePersona } from '~/lib/hooks/usePersona';
import {
  EXCLUDED_CATEGORIES,
  formatActivityPoints,
  getNextUpdateTime,
} from '~/lib/utils';
import { api } from '~/trpc/react';
import { DashboardActivityBreakdown } from './components/DashboardActivityBreakdown';

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
    <div className="mb-6 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
  const { persona } = usePersona();
  void useIsAuthenticated();

  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const accounts = api.account.getAccounts.useQuery(undefined, {
    refetchOnMount: true,
    enabled: !!persona,
    retry: false,
  });

  const weeks = api.week.getWeeks.useQuery(undefined, {
    refetchOnMount: true,
  });

  // Always use the most recent week (current week)
  useEffect(() => {
    if (weeks.data && weeks.data.length > 0) {
      // Sort weeks by start date descending and select the most recent
      const sortedWeeks = [...weeks.data].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
      if (sortedWeeks[0]) {
        setSelectedWeek(sortedWeeks[0].id);
      }
    }
  }, [weeks.data]);

  const userStats = api.user.getUserStats.useQuery(
    { weekId: selectedWeek ?? '' },
    {
      refetchOnMount: true,
      enabled:
        accounts.isSuccess && accounts.data?.length > 0 && !!selectedWeek,
      retry: false,
    },
  );

  // Activity points are now obtained from userStats query above (more efficient)

  // Get user's capital at work data for the total capital card
  const { data: userCapitalData } = api.user.getUserCapitalAtWork.useQuery(
    { weekId: selectedWeek ?? '' },
    {
      enabled: !!selectedWeek && !!persona,
      retry: false,
    },
  );

  if (accounts.isLoading || weeks.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if ((persona && accounts.isError) || weeks.isError) {
    return (
      <div className="flex h-96 items-center justify-center">
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

  // Calculate total AP from the same data source as the breakdown (leaderboard cache)
  const latestWeeklyPoints = (userCapitalData || [])
    .filter(
      (category) =>
        !EXCLUDED_CATEGORIES.includes(
          category.categoryId as (typeof EXCLUDED_CATEGORIES)[number],
        ),
    )
    .reduce((total, category) => total + parseFloat(category.earnedAP), 0);

  // Check if the selected week is completed
  const selectedWeekData = weeks.data?.find((week) => week.id === selectedWeek);
  const isWeekCompleted = selectedWeekData
    ? new Date(selectedWeekData.endDate) < new Date()
    : false;

  return (
    <div className="space-y-6">
      <NextUpdateNotification />

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <MetricCard
          title={
            isWeekCompleted
              ? 'Activity Points Earned'
              : 'Activity Points Earned So Far'
          }
          value={formatActivityPoints(latestWeeklyPoints)}
          icon={MoveUpRight}
          description={
            isWeekCompleted
              ? 'Activity Points earned this week'
              : 'Activity Points earned so far this week'
          }
          iconColor="text-green-500"
        />

        <MetricCard
          title="Capital at Work"
          value={
            persona && userCapitalData
              ? userCapitalData
                  .reduce(
                    (total, category) =>
                      total + parseFloat(category.capitalAtWork),
                    0,
                  )
                  .toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
              : '-'
          }
          icon={Wallet}
          description="Total USD value contributing to activities"
          iconColor="text-blue-500"
        />

        <MetricCard
          title="Multiplier"
          value={
            userStats.data?.multiplier?.value
              ? Number(userStats.data.multiplier.value).toLocaleString()
              : '0'
          }
          icon={Zap}
          description="Current points multiplier"
          iconColor="text-amber-500"
        />
      </div>

      {selectedWeek && (
        <DashboardActivityBreakdown
          weekId={selectedWeek}
          isAnonymous={!persona}
          multiplierData={userStats.data?.multiplier}
        />
      )}
    </div>
  );
}
