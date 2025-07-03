import { z } from "zod";

export const calculateSeasonPointsJobSchema = z.object({
  seasonId: z.string(),
  weekId: z.string(),
  force: z.boolean().optional(),
  endOfWeek: z.boolean().optional(),
});

export type CalculateSeasonPointsJob = z.infer<
  typeof calculateSeasonPointsJobSchema
>;
