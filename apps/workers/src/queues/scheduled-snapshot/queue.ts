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

// Enable scheduled snapshots by default, disable only if explicitly set to 'true'
if (process.env.DISABLE_SCHEDULED_SNAPSHOT !== 'true') {
  scheduledSnapshotQueue.queue.upsertJobScheduler("every_hour", {
    pattern: "0 * * * *",
  });
}

