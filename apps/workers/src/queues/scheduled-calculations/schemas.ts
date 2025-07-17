import { z } from "zod";

export const scheduledCalculationsJobSchema = z.object({
  weekId: z.string().optional(),
  force: z.boolean().optional(),
  markAsProcessed: z.boolean().optional(),
});

export type ScheduledCalculationsJob = z.infer<
  typeof scheduledCalculationsJobSchema
>;
