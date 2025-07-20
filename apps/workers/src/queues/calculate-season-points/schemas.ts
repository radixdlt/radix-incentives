import { z } from "zod";

export const calculateSeasonPointsJobSchema = z.object({
  weekId: z.string(),
  force: z.boolean().optional(),
  markAsProcessed: z.boolean().optional(),
});

export type CalculateSeasonPointsJob = z.infer<
  typeof calculateSeasonPointsJobSchema
>;
