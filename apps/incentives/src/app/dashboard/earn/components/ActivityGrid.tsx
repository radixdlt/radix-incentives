import type { ActivityCategory, Dapp } from 'api/incentives';
import type { RouterOutputs } from '~/trpc/react';
import { ActivityCard } from './ActivityCard';

export const ActivityGrid = ({
  activities,
  dapps,
  activityCategories,
}: {
  activities: RouterOutputs['activity']['getActivityData'];
  dapps: Dapp[];
  activityCategories: ActivityCategory[];
}) => {
  const dappMap = dapps.reduce(
    (acc, dapp) => {
      acc[dapp.id] = dapp;
      return acc;
    },
    {} as Record<string, Dapp>,
  );

  const activityCategoryMap = activityCategories.reduce(
    (acc, category) => {
      acc[category.id] = category;
      return acc;
    },
    {} as Record<string, ActivityCategory>,
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          dappMap={dappMap}
          activityCategoryMap={activityCategoryMap}
        />
      ))}
    </div>
  );
};
