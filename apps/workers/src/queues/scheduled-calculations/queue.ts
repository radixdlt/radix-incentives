import { createQueue } from "../createQueue";
import { redisClient } from "../../redis";
import { scheduledCalculationsWorker } from "./worker";
import { QueueName } from "../types";

export const scheduledCalculationsQueue = createQueue({
  name: QueueName.scheduledCalculations,
  redisClient,
  worker: scheduledCalculationsWorker,
  onError: async (_, error) => {
    console.error(error);
  },
});

scheduledCalculationsQueue.queue.upsertJobScheduler("every_two_hours", {
  pattern: "0 */2 * * *",
});
