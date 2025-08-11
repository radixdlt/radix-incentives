import { z } from 'zod';

export const snapshotDateRangeJobSchema = z.object({
  addresses: z.array(z.string()).optional(),
  fromTimestamp: z.string(),
  toTimestamp: z.string(),
  intervalInHours: z.number().optional().default(1),
  addDummyData: z.boolean().optional().default(false),
  includeActivityIds: z.array(z.string()).optional(),
  usdThreshold: z.string().optional(),
  batchSize: z.number().optional(),
});

export type SnapshotDateRangeJob = z.infer<typeof snapshotDateRangeJobSchema>;
