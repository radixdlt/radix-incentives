'use client';
import { api, type RouterOutputs } from '~/trpc/react';
import { ActivityCardSkeleton } from './advanced/components';
import { easyViewData } from './advanced/data/easyViewData';
import { ActivityCardEasy } from './components/ActivityCardEasy';

type ActivityCategory =
  RouterOutputs['activity']['getActivityCategories'][number];

export default function EarnPage() {
  const { data: activityCategories, isLoading } =
    api.activity.getActivityCategories.useQuery();

  const activityCategoryMap =
    activityCategories?.reduce<Record<string, ActivityCategory>>(
      (acc, category) => {
        acc[category.id] = category;
        return acc;
      },
      {},
    ) ?? {};

  if (isLoading)
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ActivityCardSkeleton key="skeleton-1" />
        <ActivityCardSkeleton key="skeleton-2" />
        <ActivityCardSkeleton key="skeleton-3" />
        <ActivityCardSkeleton key="skeleton-4" />
        <ActivityCardSkeleton key="skeleton-5" />
        <ActivityCardSkeleton key="skeleton-6" />
      </div>
    );
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {easyViewData.map((activity) => (
        <ActivityCardEasy
          key={activity.id}
          activity={activity}
          activityCategoryMap={activityCategoryMap}
        />
      ))}
    </div>
  );
}
