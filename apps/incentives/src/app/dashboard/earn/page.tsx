'use client';

import { useState } from 'react';
import {
  EarnPageHeader,
  ActivityGrid,
  ActivityCardSkeleton,
} from './components';
import { api } from '~/trpc/react';

export default function EarnPage() {
  const { data: activityData, isLoading } =
    api.activity.getActivityData.useQuery();

  const { data: activityCategories } =
    api.activity.getActivityCategories.useQuery();

  const { data: dapps } = api.dapps.getDapps.useQuery();

  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'passive' | 'active'
  >('all');
  const [selectedType, setSelectedType] = useState<
    'all' | 'holding' | 'trading' | 'liquidity' | 'lending' | 'network'
  >('all');

  const activities = activityData?.list || [];

  const filteredActivities = activities.filter((activity) => {
    if (activity.data?.showOnEarnPage === false) {
      return false;
    }

    const categoryMatch =
      selectedCategory === 'all' ||
      (selectedCategory === 'passive' &&
        ['maintainXrdBalance', 'lendingStables'].includes(activity.category)) ||
      (selectedCategory === 'active' &&
        [
          'tradingVolume',
          'provideBlueChipLiquidityToDex',
          'provideNativeLiquidityToDex',
          'provideStablesLiquidityToDex',
          'componentCalls',
          'transactionFees',
        ].includes(activity.category));

    const typeMatch =
      selectedType === 'all' ||
      (selectedType === 'holding' &&
        ['maintainXrdBalance'].includes(activity.category)) ||
      (selectedType === 'trading' &&
        ['tradingVolume'].includes(activity.category)) ||
      (selectedType === 'liquidity' &&
        [
          'provideBlueChipLiquidityToDex',
          'provideNativeLiquidityToDex',
          'provideStablesLiquidityToDex',
        ].includes(activity.category)) ||
      (selectedType === 'lending' &&
        ['lendingStables'].includes(activity.category)) ||
      (selectedType === 'network' &&
        ['componentCalls', 'transactionFees'].includes(activity.category));

    return categoryMatch && typeMatch;
  });

  const passiveCount = activities.filter((a) =>
    ['maintainXrdBalance', 'lendingStables'].includes(a.category),
  ).length;
  const activeCount = activities.filter((a) =>
    [
      'tradingVolume',
      'provideBlueChipLiquidityToDex',
      'provideNativeLiquidityToDex',
      'provideStablesLiquidityToDex',
      'componentCalls',
      'transactionFees',
    ].includes(a.category),
  ).length;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <EarnPageHeader
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        onCategoryChange={setSelectedCategory}
        onTypeChange={setSelectedType}
        passiveCount={passiveCount}
        activeCount={activeCount}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActivityCardSkeleton key="skeleton-1" />
          <ActivityCardSkeleton key="skeleton-2" />
          <ActivityCardSkeleton key="skeleton-3" />
          <ActivityCardSkeleton key="skeleton-4" />
          <ActivityCardSkeleton key="skeleton-5" />
          <ActivityCardSkeleton key="skeleton-6" />
        </div>
      ) : (
        <ActivityGrid
          activities={filteredActivities}
          dapps={dapps ?? []}
          activityCategories={activityCategories ?? []}
        />
      )}
    </div>
  );
}
