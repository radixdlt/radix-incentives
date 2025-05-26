import { dependencyLayer } from "api/incentives";
import type { SnapshotJob } from "./schemas";
import type { Job } from "bullmq";
import { Exit } from "effect";

export const snapshotWorker = async (input: Job<SnapshotJob>) => {
  const result = await dependencyLayer.snapshot({
    addresses: input.data.addresses,
    timestamp: new Date(input.data.timestamp),
  });

  if (Exit.isFailure(result)) {
    if (result.cause._tag === "Fail") {
      console.error(result.cause.error);
      throw result.cause.error;
    }
    console.error(result.cause);
    throw result.cause;
  }
};
