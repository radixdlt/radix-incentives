import { z } from 'zod';

export const snapshotJobSchema = z.object({
  addresses: z.array(z.string()).optional(),
  timestamp: z.string(),
  addDummyData: z.boolean().optional(),
  includeActivityIds: z.array(z.string()).optional(),
  usdThreshold: z.string().optional(),
  batchSize: z.number().optional(),
});

export type SnapshotJob = z.infer<typeof snapshotJobSchema>;
