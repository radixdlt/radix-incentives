'use client';

import {
  WeekHeader,
  WeekControls,
  CategoriesSection,
  type AdminWeekDetailsProps,
} from '~/components/week-details';

const AdminWeekDetails: React.FC<AdminWeekDetailsProps> = ({
  weekData,
  seasonId,
  onProcessWeek = () => console.log('Recalculate points action triggered'),
  onUpdatePointsPool = (categoryId, newPointsPool) =>
    console.log(`Update points pool for ${categoryId} to ${newPointsPool}`),
  onUpdateMultiplier = (activityId, newMultiplier) =>
    console.log(`Update multiplier for ${activityId} to ${newMultiplier}`),
}) => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <WeekHeader weekData={weekData} seasonId={seasonId} />

      <WeekControls weekData={weekData} onProcessWeek={onProcessWeek} />

      <CategoriesSection
        weekData={weekData}
        onUpdatePointsPool={onUpdatePointsPool}
        onUpdateMultiplier={onUpdateMultiplier}
      />
    </div>
  );
};

export default AdminWeekDetails;
