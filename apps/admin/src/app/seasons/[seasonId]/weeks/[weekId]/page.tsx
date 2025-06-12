'use client';

import type { FC } from 'react';
import { use } from 'react';
import AdminWeekDetails from './components/adminWeekDetailsPage';
import { api } from '~/trpc/react';
import type { Week } from 'db/incentives';

type WeekPageProps = {
  params: Promise<{
    seasonId: string;
    weekId: string;
  }>;
};

const WeekPage: FC<WeekPageProps> = ({ params: paramsPromise }) => {
  const params = use(paramsPromise);
  const recalculatePoints =
    api.season.addCalculateSeasonPointsJob.useMutation();
  const updateWeekStatus = api.season.updateWeekStatus.useMutation();
  const { data, refetch } = api.season.getSeasonById.useQuery({
    id: params.seasonId,
  });

  const handleWeekAction = async (action: Week['status']) => {
    console.log(
      `Week ${action} action triggered for season ${params.seasonId}, week ${params.weekId}`,
    );

    await updateWeekStatus.mutateAsync({
      id: params.weekId,
      status: action,
    });

    await refetch();
  };

  const handleActivityAction = (
    activityId: string,
    action: 'edit' | 'delete',
  ) => {
    console.log(`Activity ${activityId} ${action} action triggered`);
    // TODO: Implement actual activity management actions
  };

  const season = data?.season;
  const week = data?.weeks?.find((week) => week.id === params.weekId);
  const activityWeeks = data?.activityWeeks || [];

  const handleRecalculatePoints = async () => {
    console.log('Recalculate points action triggered');
    // TODO: Implement actual recalculate points action
    const result = await recalculatePoints.mutateAsync({
      seasonId: params.seasonId,
      weekId: params.weekId,
      force: week?.status === 'completed',
    });

    await refetch();
  };

  const totalPointsPool = activityWeeks.reduce(
    (acc, activityWeek) => acc + (activityWeek.pointsPool ?? 0),
    0,
  );

  if (!week) {
    return <div>Week not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminWeekDetails
        weekData={{
          id: week.id,
          weekNumber: 1,
          title: 'Week 1',
          description: 'Week 1 description',
          startDate: week.startDate.toISOString(),
          endDate: week.endDate.toISOString(),
          status: week.status,
          isProcessed: false,
          totalActivities: activityWeeks.length,
          totalParticipants: 0,
          totalPointsPool: totalPointsPool,
        }}
        activities={activityWeeks.map((activityWeek) => ({
          id: activityWeek.activityId,
          name: activityWeek.activityId,
          description: 'Activity description',
          type: 'active',
          rewardType: 'points',
          status: activityWeek.status,
          pointsPool: activityWeek.pointsPool ?? 0,
          participants: 0,
          startDate: week.startDate.toISOString(),
          endDate: week.endDate.toISOString(),
          category: 'category',
        }))}
        onWeekAction={handleWeekAction}
        onActivityAction={handleActivityAction}
        onRecalculatePoints={handleRecalculatePoints}
      />
    </div>
  );
};

export default WeekPage;
