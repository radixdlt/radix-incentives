'use client';

import { useParams } from 'next/navigation';

export default function ActivityPage() {
  const { activityId, weekId, seasonId } = useParams<{
    activityId: string;
    weekId: string;
    seasonId: string;
  }>();

  return (
    <div>
      ActivityPage {activityId} {weekId} {seasonId}
    </div>
  );
}
