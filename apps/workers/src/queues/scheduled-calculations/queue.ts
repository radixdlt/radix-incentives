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

if (process.env.DISABLE_SCHEDULED_CALCULATIONS === 'true') {
  const scheduler = await scheduledCalculationsQueue.queue.getJobScheduler("every_two_hours")
  if (scheduler) {
    await scheduledCalculationsQueue.queue.removeJobScheduler("every_two_hours")
  }
} else {
  scheduledCalculationsQueue.queue.upsertJobScheduler("every_two_hours", {
    pattern: "0 */2 * * *",
  });
}
