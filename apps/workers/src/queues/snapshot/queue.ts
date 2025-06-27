import { createQueue } from "../createQueue";
import { redisClient } from "../../redis";
import { snapshotWorker } from "./worker";
import type { SnapshotJob } from "./schemas";
import { Effect } from "effect";
import { QueueName } from "../types";

export const snapshotQueue = createQueue<SnapshotJob, void>({
  name: QueueName.snapshot,
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
  workerOptions: {
    connection: redisClient,
    stalledInterval: 180000,
    maxStalledCount: 2, // Allow 2 stalls before marking as failed
    lockDuration: 300000, // Lock jobs for 5 minutes
    concurrency: 1, // Process one job at a time to prevent overload
  },
});

// Configure queue options
Object.assign(snapshotQueue.queue.defaultJobOptions, {
  removeOnComplete: { count: 1000 }, // Keep last 1000 completed jobs
  removeOnFail: { count: 10000 }, // Keep last 10000 failed jobs
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
});
