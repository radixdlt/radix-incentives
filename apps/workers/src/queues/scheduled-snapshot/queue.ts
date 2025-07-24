import { createQueue } from "../createQueue";
import { redisClient } from "../../redis";
import { scheduledSnapshotWorker } from "./worker";
import { QueueName } from "../types";

export const scheduledSnapshotQueue = createQueue({
  name: QueueName.scheduledSnapshot,
  redisClient,
  worker: scheduledSnapshotWorker,
  onError: async (_, error) => {
    console.error(error);
  },
});

if (process.env.DISABLE_SCHEDULED_SNAPSHOT === 'true') {
  const scheduler = await scheduledSnapshotQueue.queue.getJobScheduler("every_hour")
  if (scheduler) {
    await scheduledSnapshotQueue.queue.removeJobScheduler("every_hour")
    console.log("Disabled scheduled snapshots")
  }
} else {
  scheduledSnapshotQueue.queue.upsertJobScheduler("every_hour", {
    pattern: "0 * * * *",
  });
  console.log("Enabled scheduled snapshots")
}

