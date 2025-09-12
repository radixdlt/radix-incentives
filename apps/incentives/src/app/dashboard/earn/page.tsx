'use client';
import { api, type RouterOutputs } from '~/trpc/react';
import { ActivityCardSkeleton } from './advanced/components';
import { ActivityCardDynamic } from './components/ActivityCardDynamic';

type ActivityCategory =
  RouterOutputs['activity']['getActivityCategories'][number];

export default function EarnPage() {
  const { data: earnPageCategories, isLoading: categoriesLoading } =
    api.activity.getEarnPageCategories.useQuery();

  if (categoriesLoading)
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
      {earnPageCategories?.map((category) => (
        <ActivityCardDynamic key={category.id} category={category} />
      )) ?? []}
    </div>
  );
}
