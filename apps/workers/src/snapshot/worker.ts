import { dependencyLayer } from "api/incentives";
import type { SnapshotJob } from "./schemas";
import type { Job } from "bullmq";
import { Exit } from "effect";

export const snapshotWorker = async (input: Job<SnapshotJob>) => {
  try {
    console.log(`Starting snapshot job ${input.id} for timestamp ${input.data.timestamp}`);
    
    const result = await dependencyLayer.snapshot({
      addresses: input.data.addresses,
      timestamp: new Date(input.data.timestamp),
    });

    if (Exit.isFailure(result)) {
      if (result.cause._tag === "Fail") {
        const enhancedError = new Error(result.cause.error._tag);
        enhancedError.stack = `${JSON.stringify(result.cause.error, null, 2)}`;
        enhancedError.cause = result.cause.error._tag;
        console.error(`Snapshot job ${input.id} failed:`, enhancedError);
        throw enhancedError;
      }

      const error = new Error(JSON.stringify(result.cause, null, 2));
      console.error(`Snapshot job ${input.id} failed:`, error);
      throw error;
    }

    console.log(`Successfully completed snapshot job ${input.id}`);
    return result;
  } catch (error) {
    console.error(`Unexpected error in snapshot job ${input.id}:`, error);
    throw error;
  }
};
