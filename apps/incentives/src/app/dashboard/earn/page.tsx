'use client';
import { Grid, List } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { usePersona } from '~/lib/hooks/usePersona';
import { api } from '~/trpc/react';
import { ActivityCardSkeleton } from './advanced/components';
import { ActivityCardEasy } from './components/ActivityCardEasy';
import { DappCard } from './components/DappCard';

type ViewMode = 'categories' | 'dapps';

export default function EarnPage() {
  const { persona, isInitialized } = usePersona();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const viewParam = searchParams.get('view') as ViewMode | null;
  const [viewMode, setViewMode] = useState<ViewMode>(
    viewParam === 'dapps' ? 'dapps' : 'categories',
  );

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

  const { data: earnPageData, isLoading: isLoadingCategories } =
    api.activityCategory.getEarnPageData.useQuery(
      { weekId: selectedWeekId },
      { enabled: !!selectedWeekId },
    );

  const { data: dappsData, isLoading: isLoadingDapps } =
    api.dapps.getDappsWithCategories.useQuery(undefined, {
      enabled: viewMode === 'dapps',
    });

  const { data: userCapitalData } = api.user.getUserCapitalAtWork.useQuery(
    { weekId: selectedWeekId },
    {
      enabled: isInitialized && !!selectedWeekId && !!persona,
    },
  );

  const { data: userMultiplier } = api.user.getMultiplierByUserId.useQuery(
    { weekId: selectedWeekId },
    {
      enabled: !!persona && !!selectedWeekId,
    },
  );

  const isLoading =
    viewMode === 'categories' ? isLoadingCategories : isLoadingDapps;

  // Transform dapps data to include unique categories and filter by showOnEarnPage
  const transformedDappsData = dappsData
    ?.filter((dapp) => dapp.showOnEarnPage)
    .map((dapp) => {
      // Get unique categories from activities
      const uniqueCategories = new Map();
      dapp.activities?.forEach((activity) => {
        if (activity.activityCategories) {
          uniqueCategories.set(
            activity.activityCategories.id,
            activity.activityCategories,
          );
        }
      });

      return {
        ...dapp,
        categories: Array.from(uniqueCategories.values()),
      };
    });

  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ActivityCardSkeleton key="skeleton-1" />
          <ActivityCardSkeleton key="skeleton-2" />
          <ActivityCardSkeleton key="skeleton-3" />
          <ActivityCardSkeleton key="skeleton-4" />
          <ActivityCardSkeleton key="skeleton-5" />
          <ActivityCardSkeleton key="skeleton-6" />
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/10 bg-muted/30 p-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Participate in any category to earn a share of the Season Points (SP)
          allocated each week. Toggle between viewing by category or by DApp to
          find activities that match your interests.
        </p>
      </div>

      <div className="flex justify-end">
        <div className="inline-flex gap-2 rounded-lg bg-muted p-1">
          <Button
            type="button"
            variant={viewMode === 'categories' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setViewMode('categories');
              router.push('/dashboard/earn');
            }}
            className="gap-2"
          >
            <Grid className="h-4 w-4" />
            Categories
          </Button>
          <Button
            type="button"
            variant={viewMode === 'dapps' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setViewMode('dapps');
              router.push('/dashboard/earn?view=dapps');
            }}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            DApps
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {viewMode === 'categories'
          ? earnPageData?.map((category) => {
              // Find user capital data for this category
              const capitalData = userCapitalData?.find(
                (data) => data.categoryId === category.id,
              );

              return (
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
                  capitalData={persona ? capitalData : undefined}
                  multiplierData={persona ? userMultiplier : undefined}
                />
              );
            })
          : transformedDappsData?.map((dapp) => (
              <DappCard key={dapp.id} dapp={dapp} />
            ))}
      </div>
    </div>
  );
}
