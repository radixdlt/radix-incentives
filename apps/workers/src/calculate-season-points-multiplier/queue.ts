import { createQueue } from "../queue/createQueue";
import { redisClient } from "../redis";
import { seasonPointsMultiplierWorker } from "./worker";
import type { SeasonPointsMultiplierJob } from "./schemas";
import { Effect } from "effect";

export const seasonPointsMultiplierQueue = createQueue<
  SeasonPointsMultiplierJob,
  void
>({
  name: "seasonPointsMultiplier",
  redisClient,
  worker: seasonPointsMultiplierWorker,
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
