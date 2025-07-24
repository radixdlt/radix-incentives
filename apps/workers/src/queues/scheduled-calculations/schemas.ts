import { z } from "zod";

export const scheduledCalculationsJobSchema = z.object({
  weekId: z.string().optional(),
  force: z.boolean().optional(),
  markAsProcessed: z.boolean().optional(),
  includeSPCalculations: z.boolean().optional().default(false),
});

export type ScheduledCalculationsJob = z.infer<
  typeof scheduledCalculationsJobSchema
>;
