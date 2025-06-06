import { createQueue } from "../queue/createQueue";
import { redisClient } from "../redis";
import { calculateActivityPointsWorker } from "./worker";
import type { CalculateActivityPointsJob } from "./schemas";
import { Effect } from "effect";

export const calculateActivityPointsQueue = createQueue<
  CalculateActivityPointsJob,
  void
>({
  name: "calculateActivityPoints",
  redisClient,
  worker: calculateActivityPointsWorker,
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
