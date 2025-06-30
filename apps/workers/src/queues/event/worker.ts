import type { Job } from "bullmq";

import type { EventQueueJob } from "./schemas";
import { dependencyLayer } from "api/incentives";
import { Exit } from "effect";
import { snapshotQueue } from "../snapshot/queue";
import { SnapshotPriority } from "../snapshot/constants";

export const eventQueueWorker = async (job: Job<EventQueueJob>) => {
  const result = await dependencyLayer.eventWorkerHandler({
    items: job.data,
    addToSnapshotQueue: async (input) => {
      await snapshotQueue.queue.add("eventSnapshot", input, {
        priority: SnapshotPriority.Event,
      });
    },
  });

  if (Exit.isFailure(result)) {
    console.error(
      "error in eventQueueWorker",
      JSON.stringify(result.cause, null, 2)
    );
    throw result.cause;
  }
};
