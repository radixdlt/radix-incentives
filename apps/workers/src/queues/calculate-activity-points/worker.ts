import { dependencyLayer } from "api/incentives";
import type { CalculateActivityPointsJob } from "./schemas";
import type { Job } from "bullmq";
import { Exit } from "effect";
import { populateLeaderboardCacheQueue } from "../populate-leaderboard-cache/queue";

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

  // Succesfully calculated AP,
  // queue leaderboard cache population for this week's activity categories
  await populateLeaderboardCacheQueue.queue.add(
    "cache-after-activity-points",
    {
      weekId: input.data.weekId,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
};
