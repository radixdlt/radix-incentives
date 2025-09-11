'use client';

import type { FC } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import { api } from '~/trpc/react';
import AdminWeekDetails from './components/adminWeekDetailsPage';

type WeekPageProps = {
  params: Promise<{
    seasonId: string;
    weekId: string;
  }>;
};

const WeekPage: FC<WeekPageProps> = ({ params: paramsPromise }) => {
  const params = use(paramsPromise);
  const addProcessWeekJob = api.season.addProcessWeekJob.useMutation();
  const updatePointsPool = api.week.updatePointsPool.useMutation();
  const updateMultiplier = api.week.updateActivityWeekMultiplier.useMutation();
  const updateLowerBoundsPercentage =
    api.week.updateCategoryWeekLowerBoundsPercentage.useMutation();
  const updateOutlierThresholdPercentage =
    api.week.updateCategoryWeekOutlierThresholdPercentage.useMutation();
  const updateEnableOutlierDetection =
    api.week.updateCategoryWeekEnableOutlierDetection.useMutation();
  const {
    data: seasonData,
    refetch: refetchSeason,
    isLoading: isSeasonLoading,
    error: seasonError,
  } = api.season.getSeasonById.useQuery({
    id: params.seasonId,
  });

  const addSeasonPointsMultiplierJob =
    api.admin.queues.addSeasonPointsMultiplierJob.useMutation();

  const {
    data: weekData,
    refetch: refetchWeek,
    isLoading: isWeekLoading,
    error: weekError,
  } = api.week.getWeekDetails.useQuery({
    weekId: params.weekId,
  });

  const { data: activityCount } = api.admin.activity.userCount.useQuery({
    weekId: params.weekId,
  });

  const triggerActivityPointsCalculation =
    api.admin.activity.triggerActivityPointsCalculation.useMutation();

  const season = seasonData?.season;
  const week = weekData;

  const handleProcessWeek = async () => {
    await addProcessWeekJob.mutateAsync({
      weekId: params.weekId,
      force: true,
    });

    toast.info('Processing week job started', {
      description: 'This may take a moment to complete',
    });

    await Promise.all([refetchSeason(), refetchWeek()]);
  };

  const handleUpdatePointsPool = async (
    categoryId: string,
    newPointsPool: number,
  ) => {
    try {
      await updatePointsPool.mutateAsync({
        weekId: params.weekId,
        activityCategoryId: categoryId,
        pointsPool: newPointsPool,
      });
      await refetchWeek();
    } catch (error) {
      console.error('Failed to update points pool:', error);
    }
  };

  const handleUpdateMultiplier = async (
    activityId: string,
    newMultiplier: number,
  ) => {
    try {
      await updateMultiplier.mutateAsync({
        weekId: params.weekId,
        activityId: activityId,
        multiplier: newMultiplier,
      });
      await refetchWeek();
    } catch (error) {
      console.error('Failed to update multiplier:', error);
    }
  };

  const handleUpdateLowerBoundsPercentage = async (
    categoryId: string,
    newLowerBoundsPercentage: string,
  ) => {
    try {
      await updateLowerBoundsPercentage.mutateAsync({
        weekId: params.weekId,
        activityCategoryId: categoryId,
        lowerBoundsPercentage: newLowerBoundsPercentage,
      });
      await refetchWeek();
      toast.success('Lower bounds percentage updated successfully');
    } catch (error) {
      console.error('Failed to update lower bounds percentage:', error);
      toast.error('Failed to update lower bounds percentage');
    }
  };

  const handleUpdateOutlierThresholdPercentage = async (
    categoryId: string,
    newOutlierThresholdPercentage: string,
  ) => {
    try {
      await updateOutlierThresholdPercentage.mutateAsync({
        weekId: params.weekId,
        activityCategoryId: categoryId,
        outlierThresholdPercentage: newOutlierThresholdPercentage,
      });
      await refetchWeek();
      toast.success('Outlier threshold percentage updated successfully');
    } catch (error) {
      console.error('Failed to update outlier threshold percentage:', error);
      toast.error('Failed to update outlier threshold percentage');
    }
  };

  const handleUpdateEnableOutlierDetection = async (
    categoryId: string,
    enableOutlierDetection: boolean,
  ) => {
    try {
      await updateEnableOutlierDetection.mutateAsync({
        weekId: params.weekId,
        activityCategoryId: categoryId,
        enableOutlierDetection: enableOutlierDetection,
      });
      await refetchWeek();
      toast.success(
        `Outlier detection ${enableOutlierDetection ? 'enabled' : 'disabled'} successfully`,
      );
    } catch (error) {
      console.error('Failed to update outlier detection setting:', error);
      toast.error('Failed to update outlier detection setting');
    }
  };

  const handleTriggerActivityPoints = async () => {
    try {
      await triggerActivityPointsCalculation.mutateAsync({
        weekId: params.weekId,
      });

      toast.info('Activity points calculation started', {
        description: 'This may take a few minutes to complete',
      });
    } catch (error) {
      console.error('Failed to trigger activity points calculation:', error);
      toast.error('Failed to start activity points calculation');
    }
  };

  const handleCalculateMultiplier = async () => {
    try {
      await addSeasonPointsMultiplierJob.mutateAsync({
        weekId: params.weekId,
      });

      toast.info('Season points multiplier calculation started', {
        description: 'This may take a few minutes to complete',
      });
    } catch (error) {
      console.error('Failed to trigger multiplier calculation:', error);
      toast.error('Failed to start multiplier calculation');
    }
  };

  // Handle loading states
  if (isSeasonLoading || isWeekLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl space-y-6 p-6">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-200" />
              </div>
            </div>

            {/* Controls skeleton */}
            <div className="mb-6 rounded-lg border bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-36 rounded bg-gray-200" />
                  <div className="h-4 w-64 rounded bg-gray-200" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-32 rounded bg-gray-200" />
                  <div className="h-10 w-28 rounded bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Categories skeleton */}
            <div className="space-y-4">
              <div className="h-8 w-48 rounded bg-gray-200" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-6 w-40 rounded bg-gray-200" />
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="rounded border p-3">
                      <div className="h-4 w-full rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle errors
  if (seasonError || weekError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-2 font-bold text-2xl text-red-600">
            Error Loading Week
          </h1>
          <p className="mb-4 text-gray-600">
            {seasonError?.message ||
              weekError?.message ||
              'An unexpected error occurred'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (seasonError) refetchSeason();
              if (weekError) refetchWeek();
            }}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle not found
  if (!week || !season) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-2 font-bold text-2xl text-gray-900">
            {!week ? 'Week Not Found' : 'Season Not Found'}
          </h1>
          <p className="text-gray-600">
            {!week
              ? 'The requested week could not be found.'
              : 'The requested season could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminWeekDetails
        seasonId={params.seasonId}
        weekId={params.weekId}
        weekData={week}
        activityUserCounts={activityCount}
        onProcessWeek={handleProcessWeek}
        onTriggerActivityPoints={handleTriggerActivityPoints}
        onUpdatePointsPool={handleUpdatePointsPool}
        onUpdateMultiplier={handleUpdateMultiplier}
        onUpdateLowerBoundsPercentage={handleUpdateLowerBoundsPercentage}
        onUpdateOutlierThresholdPercentage={
          handleUpdateOutlierThresholdPercentage
        }
        onUpdateEnableOutlierDetection={handleUpdateEnableOutlierDetection}
        onCalculateMultiplier={handleCalculateMultiplier}
      />
    </div>
  );
};

export default WeekPage;
