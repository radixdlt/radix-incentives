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

scheduledSnapshotQueue.queue.upsertJobScheduler("every_hour", {
  pattern: "0 * * * *",
});
