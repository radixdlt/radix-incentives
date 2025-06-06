import { dependencyLayer } from "api/incentives";
import type { CalculateActivityPointsJob } from "./schemas";
import type { Job } from "bullmq";
import { Exit } from "effect";

export const calculateActivityPointsWorker = async (
  input: Job<CalculateActivityPointsJob>
) => {
  const result = await dependencyLayer.calculateActivityPoints({
    weekId: input.data.weekId,
    addresses: input.data.addresses,
  });

  if (Exit.isFailure(result)) {
    if (result.cause._tag === "Fail") {
      const enhancedError = new Error(result.cause.error._tag);
      console.error(result.cause.error);
      if ("stack" in result.cause.error)
        enhancedError.stack = `${result.cause.error.stack}`;

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
