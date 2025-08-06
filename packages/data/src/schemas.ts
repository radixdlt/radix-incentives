import { z } from 'zod';
import { activityData } from './output/activities';

export const ActivityIdSchema = z.enum(
  activityData.map((activity) => activity.activityId) as [string, ...string[]],
);
