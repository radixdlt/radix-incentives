import { createQueue } from "../queue/createQueue";
import { redisClient } from "../redis";
import { snapshotWorker } from "./worker";
import type { SnapshotJob } from "./schemas";

export const snapshotQueue = createQueue<SnapshotJob, void>({
  name: "snapshot",
  redisClient,
  worker: snapshotWorker,
  onError: async (err) => {
    console.error(err);
  },
});
