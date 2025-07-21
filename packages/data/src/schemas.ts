import { z } from "zod";
import { activitiesData } from "./activities";

export const ActivityIdSchema = z.enum(
  activitiesData.map((activity) => activity.id) as [string, ...string[]]
);
