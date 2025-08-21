import { z } from 'zod';

export const ProcessWeekJobSchema = z.object({
  weekId: z.string(),
  force: z.boolean().optional(),
});

export type ProcessWeekJob = z.infer<typeof ProcessWeekJobSchema>;
