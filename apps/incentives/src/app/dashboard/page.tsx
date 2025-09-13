'use client';

import {
  Clock,
  DollarSign,
  MoveUpRight,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { MetricCard } from '~/components/dashboard';
import { EmptyState } from '~/components/ui/empty-state';
import { usePersona } from '~/lib/hooks/usePersona';
import { getNextUpdateTime } from '~/lib/utils';
import { api } from '~/trpc/react';
import { EnhancedCategoryBreakdown } from './components/enhanced-category-breakdown';

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
  const persona = usePersona();

  const [currentWeek, setCurrentWeek] = useState<string | null>(null);

  const accounts = api.account.getAccounts.useQuery(undefined, {
    refetchOnMount: true,
    enabled: !!persona,
    retry: false,
  });

  const weeks = api.week.getWeeks.useQuery(undefined, {
    refetchOnMount: true,
  });

  // Set current week to the most recent week when weeks data is loaded
  useEffect(() => {
    if (weeks.data && weeks.data.length > 0 && !currentWeek) {
      // Sort weeks by start date descending and select the most recent
      const sortedWeeks = [...weeks.data].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
      if (sortedWeeks[0]) {
        setCurrentWeek(sortedWeeks[0].id);
      }
    }
  }, [weeks.data, currentWeek]);

  const userStats = api.user.getUserStats.useQuery(
    { weekId: currentWeek ?? '' },
    {
      refetchOnMount: true,
      enabled: accounts.isSuccess && accounts.data?.length > 0 && !!currentWeek,
      retry: false,
    },
  );

  // Get category breakdown to calculate total from cache
  const categoryData = api.user.getUserCategoryBreakdown.useQuery(
    { weekId: currentWeek ?? '' },
    {
      enabled: !!persona && !!currentWeek,
      retry: false,
    },
  );

  // Get categories with user investment data
  const categoriesWithUserData =
    api.activity.getEarnPageCategoriesWithUserData.useQuery(undefined, {
      enabled: !!persona,
      retry: false,
    });

  // Get all-time SP data (mock for now - would need proper API)
  // const allTimeSeasonPoints = api.user.getAllTimeSeasonPoints.useQuery(undefined, {
  //   enabled: !!persona,
  //   retry: false,
  // });

  if (accounts.isLoading || weeks.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (accounts.isError || weeks.isError) {
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

  // Calculate total points from category breakdown (from cache)
  const latestWeeklyPoints =
    categoryData.data?.reduce(
      (total, category) => total + category.points,
      0,
    ) ?? 0;

  // Calculate total investment across all categories
  const totalInvestment =
    categoriesWithUserData.data?.reduce(
      (total, category) => total + (category.userInvestment || 0),
      0,
    ) ?? 0;

  // Mock all-time SP data (would come from proper API)
  const allTimeSeasonPoints = latestWeeklyPoints * 4; // Mock: assume 4x current week

  // Check if the current week is completed
  const currentWeekData = weeks.data?.find((week) => week.id === currentWeek);
  const _isWeekCompleted = currentWeekData
    ? new Date(currentWeekData.endDate) < new Date()
    : false;

  return (
    <div className="space-y-6">
      <NextUpdateNotification />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Activity Points"
          value={latestWeeklyPoints.toLocaleString()}
          icon={MoveUpRight}
          description="For this week"
          iconColor="text-green-500"
        />

        <MetricCard
          title="Tracked Capital"
          value={`$${totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          description="Tracked capital deployed in DeFi"
          iconColor="text-blue-500"
        />

        <MetricCard
          title="Season Points"
          value={allTimeSeasonPoints.toLocaleString()}
          icon={Trophy}
          description="Season Points earned in current season"
          iconColor="text-purple-500"
        />

        <MetricCard
          title="SP Multiplier"
          value={
            userStats.data?.multiplier?.value
              ? Number(userStats.data.multiplier.value).toLocaleString()
              : '0'
          }
          icon={Zap}
          description="Season Point multiplier"
          iconColor="text-amber-500"
        />
      </div>

      {currentWeek && <EnhancedCategoryBreakdown weekId={currentWeek} />}
    </div>
  );
}
