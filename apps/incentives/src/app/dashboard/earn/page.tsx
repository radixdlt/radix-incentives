'use client';
import { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import { ActivityCardSkeleton } from './advanced/components';
import { ActivityCardEasy } from './components/ActivityCardEasy';

export default function EarnPage() {
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');

  const { data: weeks } = api.week.getWeeks.useQuery();

  // Set default selected week to the most recent week when weeks data is loaded
  useEffect(() => {
    if (weeks && weeks.length > 0 && !selectedWeekId) {
      // Sort weeks by start date descending and select the most recent
      const sortedWeeks = [...weeks].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
      if (sortedWeeks[0]) {
        setSelectedWeekId(sortedWeeks[0].id);
      }
    }
  }, [weeks, selectedWeekId]);

  const { data: earnPageData, isLoading } =
    api.activityCategory.getEarnPageData.useQuery(
      { weekId: selectedWeekId },
      { enabled: !!selectedWeekId },
    );

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
