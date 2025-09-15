'use client';
import { api } from '~/trpc/react';
import { ActivityCardSkeleton } from './advanced/components';
import { ActivityCardEasy } from './components/ActivityCardEasy';

export default function EarnPage() {
  const { data: earnPageData, isLoading } =
    api.activityCategory.getEarnPageData.useQuery();

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
      {earnPageData?.map((category) => (
        <ActivityCardEasy
          key={category.id}
          activity={{
            id: category.id,
            name: category.name,
            description: category.description || '',
            dapp: '',
            component_addresses: '',
            AP:
              (typeof category.seasonPointsPerWeek === 'number'
                ? category.seasonPointsPerWeek
                : Number(category.seasonPointsPerWeek)) > 0,
            multiplier: category.multiplier ?? false,
            seasonPointsPerWeek:
              typeof category.seasonPointsPerWeek === 'number'
                ? category.seasonPointsPerWeek
                : Number(category.seasonPointsPerWeek),
            icon: category.icon || undefined,
            color: category.color || undefined,
            dappLogos: category.dappLogos,
          }}
        />
      ))}
    </div>
  );
}
