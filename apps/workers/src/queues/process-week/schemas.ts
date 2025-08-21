import { z } from 'zod';

export const ProcessWeekJobSchema = z.object({
  weekId: z.string(),
});

export type ProcessWeekJob = z.infer<typeof ProcessWeekJobSchema>;
