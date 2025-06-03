import { createQueue } from "../queue/createQueue";
import { redisClient } from "../redis";
import { snapshotDateRangeWorker } from "./worker";

export const snapshotDateRangeQueue = createQueue({
  name: "snapshotDateRange",
  redisClient,
  worker: snapshotDateRangeWorker,
  onError: async (_, error) => {
    console.error(error);
  },
});
