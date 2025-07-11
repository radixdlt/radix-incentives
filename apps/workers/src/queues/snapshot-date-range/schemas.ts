import { z } from "zod";

export const snapshotDateRangeJobSchema = z.object({
  addresses: z.array(z.string()).optional(),
  fromTimestamp: z.string(),
  toTimestamp: z.string(),
  intervalInHours: z.number().optional().default(1),
  addDummyData: z.boolean().optional().default(false),
});

export type SnapshotDateRangeJob = z.infer<typeof snapshotDateRangeJobSchema>;
