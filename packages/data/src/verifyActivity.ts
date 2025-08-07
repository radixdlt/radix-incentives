import { activitiesData } from './activities';
import { ActivityId } from './activityId';

const verifyActivity = (): void => {
  for (const activityId of Object.values(ActivityId)) {
    const activity = activitiesData.find(
      (activity) => activity.id === activityId,
    );
    if (!activity) {
      throw new Error(`Activity ${activityId} not found`);
    }
  }
  console.log('All activities verified');
};

verifyActivity();
