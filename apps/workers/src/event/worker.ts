import type { Job } from "bullmq";

import type { EventQueueJob } from "./schemas";
import { dependencyLayer } from "api/incentives";
import { Exit } from "effect";
import { snapshotQueue } from "../snapshot/queue";

export const eventQueueWorker = async (job: Job<EventQueueJob>) => {
  console.log("eventQueueWorker", job.data);
  const result = await dependencyLayer.deriveAccountFromEvent(job.data);

  if (Exit.isFailure(result)) {
    console.error("error in eventQueueWorker", result.cause);
    throw result.cause;
  }

  for (const accountAddress of result.value) {
    console.log("adding snapshot", accountAddress);
    await snapshotQueue.queue.add("snapshot", {
      timestamp: accountAddress.timestamp,
      addresses: [accountAddress.address],
    });
  }
};
