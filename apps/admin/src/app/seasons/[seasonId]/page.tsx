'use client';

import { useParams, useRouter } from 'next/navigation';

import { SeasonHeader } from '~/components/season-header';
import { SeasonInfoCard } from '~/components/season-info-card';
import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';
import { WeeksSection } from '~/components/weeks-section';
import { api } from '~/trpc/react';

function SeasonDetailPage() {
  const params = useParams();
  const router = useRouter(); // Use router for navigation
  const seasonId = params.seasonId as string; // Get seasonId from URL

  const { data, isLoading } = api.season.getSeasonById.useQuery({
    id: seasonId,
  });

  const season = data?.season;
  const weeks = data?.weeks;
  const _activityWeeks = data?.activityWeeks || [];

  const handleWeekRowClick = (weekId: string) => {
    console.log(`Navigate to week: ${weekId} for season ${seasonId}`);
    router.push(`/seasons/${seasonId}/weeks/${weekId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 pr-6 pl-6">
        {/* Header Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Separator className="my-6" />

        {/* Season Info Card Skeleton */}
        <div className="mb-6 rounded-lg border p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Weeks Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-32" />
          <div className="rounded-lg border">
            <div className="p-4">
              <Skeleton className="h-5 w-full" />
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`week-skeleton-row-${index + 1}`}
                className="border-t p-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!season) {
    return <div className="p-6">Season not found.</div>;
  }

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      <SeasonHeader seasonName={season.name} seasonId={seasonId} />

      <Separator className="my-6" />

      <SeasonInfoCard season={season} />

      <WeeksSection
        seasonId={seasonId}
        weeks={weeks}
        onWeekRowClick={handleWeekRowClick}
      />
    </div>
  );
}

export default SeasonDetailPage;
