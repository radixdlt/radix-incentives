import { createQueue } from "../queue/createQueue";
import { redisClient } from "../redis";
import { scheduledSnapshotWorker } from "./worker";

export const scheduledSnapshotQueue = createQueue({
  name: "scheduledSnapshot",
  redisClient,
  worker: scheduledSnapshotWorker,
  onError: async (err) => {
    console.error(err);
  },
});

scheduledSnapshotQueue.queue.upsertJobScheduler("every_hour", {
  pattern: "0 * * * *",
});
