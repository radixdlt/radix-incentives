import { createQueue } from "../createQueue";
import { redisClient } from "../../redis";
import { snapshotDateRangeWorker } from "./worker";
import { QueueName } from "../types";

export const snapshotDateRangeQueue = createQueue({
  name: QueueName.snapshotDateRange,
  redisClient,
  worker: snapshotDateRangeWorker,
  onError: async (_, error) => {
    console.error(error);
  },
});
