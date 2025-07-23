'use client';

import { useParams, useRouter } from 'next/navigation';

import { Separator } from '~/components/ui/separator';
import { SeasonHeader } from '~/components/season-header';
import { SeasonInfoCard } from '~/components/season-info-card';
import { WeeksSection } from '~/components/weeks-section';
import { api } from '~/trpc/react';

function SeasonDetailPage() {
  const params = useParams();
  const router = useRouter(); // Use router for navigation
  const seasonId = params.seasonId as string; // Get seasonId from URL

  const { data } = api.season.getSeasonById.useQuery({
    id: seasonId,
  });

  const season = data?.season;
  const weeks = data?.weeks;
  const activityWeeks = data?.activityWeeks || [];

  const handleWeekRowClick = (weekId: string) => {
    console.log(`Navigate to week: ${weekId} for season ${seasonId}`);
    router.push(`/seasons/${seasonId}/weeks/${weekId}`);
  };

  if (!season) {
    return <div className="p-6">Season not found.</div>;
  }

  return (
    <div className="container mx-auto py-6 pl-6 pr-6">
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
