import { z } from "zod";

export const eventQueueJobSchema = z.array(
  z.object({
    transactionId: z.string(),
    eventIndex: z.number(),
  })
);

export type EventQueueJob = z.infer<typeof eventQueueJobSchema>;
