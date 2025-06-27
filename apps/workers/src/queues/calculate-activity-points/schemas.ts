import { z } from "zod";

export const calculateActivityPointsJobSchema = z.object({
  weekId: z.string(),
  addresses: z.array(z.string()).optional(),
});

export type CalculateActivityPointsJob = z.infer<
  typeof calculateActivityPointsJobSchema
>;
