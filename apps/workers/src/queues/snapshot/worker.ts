import { dependencyLayer } from "api/incentives";

import type { Job } from "bullmq";
import { Exit } from "effect";
import type { SnapshotJob } from "./schemas";
import { calculateActivityPointsQueue } from "../calculate-activity-points/queue";

export const snapshotWorker = async (input: Job<SnapshotJob>) => {
  const result = await dependencyLayer.snapshotWorker({
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    jobId: input.id!,
    addresses: input.data.addresses,
    timestamp: new Date(input.data.timestamp),
    addDummyData: input.data.addDummyData,
  });

  if (Exit.isFailure(result)) {
    if (result.cause._tag === "Fail") {
      const enhancedError = new Error(result.cause.error._tag);
      enhancedError.stack = `${JSON.stringify(result.cause.error, null, 2)}`;
      enhancedError.cause = result.cause.error._tag;
      throw enhancedError;
    }

    if (result.cause._tag === "Die") {
      const enhancedError = new Error("unhandled error");

      if (
        result.cause.defect !== null &&
        typeof result.cause.defect === "object" &&
        "stack" in result.cause.defect
      ) {
        enhancedError.stack = `${result.cause.defect.stack}`;
      } else {
        enhancedError.stack = JSON.stringify(result.cause.defect, null, 2);
      }

      enhancedError.cause = "unhandled error";
      throw enhancedError;
    }

    throw new Error(JSON.stringify(result.cause, null, 2));
  }

  if (result.value?.weekId) {
    await calculateActivityPointsQueue.queue.add("calculateActivityPoints", {
      weekId: result.value.weekId,
    });
  }
};
