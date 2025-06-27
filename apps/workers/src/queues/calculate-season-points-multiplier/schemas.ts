import { z } from "zod";

export const seasonPointsMultiplierJobSchema = z.object({
  weekId: z.string(),
  userIds: z.array(z.string()).optional(),
});

export type SeasonPointsMultiplierJob = z.infer<
  typeof seasonPointsMultiplierJobSchema
>;
