'use client';

import type { FC } from 'react';
import { use } from 'react';
import AdminWeekDetails from './components/adminWeekDetailsPage';
import { api } from '~/trpc/react';
import { toast } from 'sonner';

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
  const updatePointsPool = api.week.updatePointsPool.useMutation();
  const updateMultiplier = api.week.updateActivityWeekMultiplier.useMutation();
  const {
    data: seasonData,
    refetch: refetchSeason,
    isLoading: isSeasonLoading,
    error: seasonError,
  } = api.season.getSeasonById.useQuery({
    id: params.seasonId,
  });

  const {
    data: weekData,
    refetch: refetchWeek,
    isLoading: isWeekLoading,
    error: weekError,
  } = api.week.getWeekDetails.useQuery({
    weekId: params.weekId,
  });

  const season = seasonData?.season;
  const week = weekData;

  const handleProcessWeek = async () => {
    await recalculatePoints.mutateAsync({
      weekId: params.weekId,
      force: week?.processed,
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

  // Handle loading states
  if (isSeasonLoading || isWeekLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
            </div>

            {/* Controls skeleton */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-36" />
                  <div className="h-4 bg-gray-200 rounded w-64" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-200 rounded w-32" />
                  <div className="h-10 bg-gray-200 rounded w-28" />
                </div>
              </div>
            </div>

            {/* Categories skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded w-40" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="border rounded p-3">
                      <div className="h-4 bg-gray-200 rounded w-full" />
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Week
          </h1>
          <p className="text-gray-600 mb-4">
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
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
        onProcessWeek={handleProcessWeek}
        onUpdatePointsPool={handleUpdatePointsPool}
        onUpdateMultiplier={handleUpdateMultiplier}
      />
    </div>
  );
};

export default WeekPage;
