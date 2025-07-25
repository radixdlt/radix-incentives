import { createQueue } from "../createQueue";
import { redisClient } from "../../redis";
import { populateLeaderboardCacheWorker } from "./worker";
import type { PopulateLeaderboardCacheInput } from "./schemas";
import { Effect } from "effect";
import { QueueName } from "../types";

export const populateLeaderboardCacheQueue = createQueue<
  PopulateLeaderboardCacheInput,
  void
>({
  name: QueueName.populateLeaderboardCache,
  redisClient,
  worker: populateLeaderboardCacheWorker,
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
    concurrency: 1, // Process one job at a time to prevent overload
  },
});
