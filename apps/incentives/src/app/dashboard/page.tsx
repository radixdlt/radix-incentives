'use client';

import { MoveUpRight, Award, Zap, Wallet } from 'lucide-react';
import {
  MetricCard,
  ActivityBreakdown,
  RecentActivity,
} from '~/components/dashboard';
import { api } from '~/trpc/react';
import { ConnectedState } from './components/ConnectedState';
import { EmptyState } from '~/components/ui/empty-state';
import { usePersona } from '~/lib/hooks/usePersona';
import { useDappToolkit } from '~/lib/hooks/useRdt';

export default function DashboardPage() {
  const persona = usePersona();
  const rdt = useDappToolkit();

  const accounts = api.account.getAccounts.useQuery(undefined, {
    refetchOnMount: true,
    enabled: !!persona,
    retry: false,
  });

  const userStats = api.user.getUserStats.useQuery(undefined, {
    refetchOnMount: true,
    enabled: accounts.isSuccess && accounts.data?.length > 0,
    retry: false,
  });

  if (accounts.isLoading || userStats.isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (accounts.isError || userStats.isError) {
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Current Week"
        value={latestWeeklyPoints.toLocaleString()}
        icon={MoveUpRight}
        description="Activity Points earned this week"
        iconColor="text-green-500"
      />

      <MetricCard
        title="Current Season"
        value={Number(totalSeasonPoints).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}
        icon={MoveUpRight}
        description="Points earned this season"
        iconColor="text-green-500"
      />

      <MetricCard
        title="Multiplier"
        subtitle="Based on holdings"
        value={userStats.data?.multiplier?.value ?? '0'}
        icon={Zap}
        description="Current points multiplier"
        iconColor="text-amber-500"
      />

      <MetricCard
        title="Weekly Ranking"
        subtitle="Global"
        value={
          userStats.data?.multiplier?.weeklyRanking.toLocaleString() ?? 'n/a'
        }
        icon={Award}
        description="Global leaderboard position"
        iconColor="text-blue-500"
      />

      <ActivityBreakdown activities={activityBreakdownData} />
    </div>
  );
}
