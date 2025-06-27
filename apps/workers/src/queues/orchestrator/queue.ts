import { createQueue } from "../createQueue";
import { redisClient } from "../../redis";
import { orchestratorWorker } from "./worker";
import type { OrchestratorJob } from "./schemas";
import { Effect } from "effect";
import { QueueName } from "../types";

export const orchestratorQueue = createQueue<OrchestratorJob, void>({
  name: QueueName.orchestrator,
  redisClient,
  worker: orchestratorWorker,
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
