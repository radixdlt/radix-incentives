import { ActivityId } from "./activityId";
import { activitiesData } from "./activities";

const verifyActivity = (): void => {
  for (const activityId of Object.values(ActivityId)) {
    const activity = activitiesData.find(
      (activity) => activity.id === activityId
    );
    if (!activity) {
      throw new Error(`Activity ${activityId} not found`);
    }
  }
  console.log("All activities verified");
};

verifyActivity();
