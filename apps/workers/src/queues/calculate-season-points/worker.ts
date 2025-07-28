import { dependencyLayer } from "api/incentives";
import {
  calculateSeasonPointsJobSchema,
  type CalculateSeasonPointsJob,
} from "./schemas";
import type { Job } from "bullmq";
import { Exit } from "effect";
import { populateLeaderboardCacheQueue } from "../populate-leaderboard-cache/queue";

export const calculateSeasonPointsWorker = async (
  input: Job<CalculateSeasonPointsJob>
) => {
  const parsedInput = calculateSeasonPointsJobSchema.parse(input.data);

  const result = await dependencyLayer.calculateSeasonPoints(parsedInput);

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

  // Succesfully calculated SP, if markAsProcessed is true
  // queue season leaderboard cache population
  if (parsedInput.markAsProcessed) {
    // Get seasonId from weekId
    const seasonResult = await dependencyLayer.getSeasonByWeekId(
      parsedInput.weekId
    );

    if (Exit.isSuccess(seasonResult)) {
      await populateLeaderboardCacheQueue.queue.add(
        "cache-after-season-points",
        {
          seasonId: seasonResult.value.id,
        },
        {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );
    } else {
      console.error(
        "Failed to get season for cache population:",
        seasonResult.cause
      );
    }
  }
};
