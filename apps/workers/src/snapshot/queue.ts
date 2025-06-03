import { createQueue } from "../queue/createQueue";
import { redisClient } from "../redis";
import { snapshotWorker } from "./worker";
import type { SnapshotJob } from "./schemas";
import { Effect } from "effect";

export const snapshotQueue = createQueue<SnapshotJob, void>({
  name: "snapshot",
  redisClient,
  worker: snapshotWorker,
  onError: async (job, error) => {
    Effect.runSync(
      Effect.gen(function* () {
        yield* Effect.logError({
          jobId: job?.id,
          jobName: job?.name,
          input: job?.data,
          error: error.message,
          stack: error.stack,
          failedReason: error.cause,
        });
      })
    );
  },
});
