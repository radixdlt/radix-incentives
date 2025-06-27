import { createQueue } from "../createQueue";
import { redisClient } from "../../redis";
import { calculateSeasonPointsWorker } from "./worker";
import type { CalculateSeasonPointsJob } from "./schemas";
import { Effect } from "effect";
import { QueueName } from "../types";

export const calculateSeasonPointsQueue = createQueue<
  CalculateSeasonPointsJob,
  void
>({
  name: QueueName.calculateSeasonPoints,
  redisClient,
  worker: calculateSeasonPointsWorker,
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
