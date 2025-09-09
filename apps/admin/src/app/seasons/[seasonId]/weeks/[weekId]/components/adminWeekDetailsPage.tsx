'use client';

import {
  type AdminWeekDetailsProps,
  CategoriesSection,
  WeekControls,
  WeekHeader,
} from '~/components/week-details';

const AdminWeekDetails: React.FC<AdminWeekDetailsProps> = ({
  weekData,
  seasonId,
  weekId,
  activityUserCounts,
  onProcessWeek = () => console.log('Recalculate points action triggered'),
  onTriggerActivityPoints = () =>
    console.log('Trigger activity points calculation'),
  onUpdatePointsPool = (categoryId, newPointsPool) =>
    console.log(`Update points pool for ${categoryId} to ${newPointsPool}`),
  onUpdateMultiplier = (activityId, newMultiplier) =>
    console.log(`Update multiplier for ${activityId} to ${newMultiplier}`),
  onUpdateLowerBoundsPercentage = (categoryId, newLowerBoundsPercentage) =>
    console.log(
      `Update lower bounds percentage for ${categoryId} to ${newLowerBoundsPercentage}`,
    ),
  onCalculateMultiplier = () =>
    console.log('Calculate season points multiplier'),
}) => {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <WeekHeader weekData={weekData} seasonId={seasonId} />

      <WeekControls
        weekData={weekData}
        seasonId={seasonId}
        weekId={weekId}
        onProcessWeek={onProcessWeek}
        onTriggerActivityPoints={onTriggerActivityPoints}
        onCalculateMultiplier={onCalculateMultiplier}
      />

      <CategoriesSection
        weekData={weekData}
        seasonId={seasonId}
        weekId={weekId}
        activityUserCounts={activityUserCounts}
        onUpdatePointsPool={onUpdatePointsPool}
        onUpdateMultiplier={onUpdateMultiplier}
        onUpdateLowerBoundsPercentage={onUpdateLowerBoundsPercentage}
      />
    </div>
  );
};

export default AdminWeekDetails;
