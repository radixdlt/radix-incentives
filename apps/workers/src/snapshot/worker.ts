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
      const enhancedError = new Error(result.cause.error._tag);
      enhancedError.stack = `${JSON.stringify(result.cause.error, null, 2)}`;
      enhancedError.cause = result.cause.error._tag;
      throw enhancedError;
    }

    if (result.cause._tag === "Die") {
      // @ts-ignore
      const enhancedError = new Error(result.cause.defect.message);
      // @ts-ignore
      enhancedError.stack = result.cause.defect.stack as string;
      enhancedError.cause = "unhandled error";
      throw enhancedError;
    }

    throw new Error(JSON.stringify(result.cause, null, 2));
  }
};
