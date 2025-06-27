import { z } from "zod";

export const snapshotJobSchema = z.object({
  addresses: z.array(z.string()).optional(),
  timestamp: z.string(),
  addDummyData: z.boolean().optional(),
});

export type SnapshotJob = z.infer<typeof snapshotJobSchema>;
