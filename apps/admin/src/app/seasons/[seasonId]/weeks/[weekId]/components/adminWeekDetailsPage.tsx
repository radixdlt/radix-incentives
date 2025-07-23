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
  onActivityAction = (activityId, action) =>
    console.log(`Activity ${activityId} ${action} action triggered`),
  onRecalculatePoints = () =>
    console.log('Recalculate points action triggered'),
  onUpdatePointsPool = (categoryId, newPointsPool) =>
    console.log(`Update points pool for ${categoryId} to ${newPointsPool}`),
}) => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <WeekHeader weekData={weekData} seasonId={seasonId} />

      <WeekControls
        weekData={weekData}
        onRecalculatePoints={onRecalculatePoints}
      />

      <CategoriesSection
        weekData={weekData}
        onActivityAction={onActivityAction}
        onUpdatePointsPool={onUpdatePointsPool}
      />
    </div>
  );
};

export default AdminWeekDetails;
