import { Effect, Layer } from "effect";
import type { Job } from "bullmq";
import { Exit } from "effect";
import {
  populateLeaderboardCacheSchema,
  type PopulateLeaderboardCacheInput,
} from "./schemas";
import { LeaderboardCacheService, createDbClientLive } from "api/incentives";
import { db } from "db/incentives";

export const populateLeaderboardCacheWorker = async (
  input: Job<PopulateLeaderboardCacheInput>
) => {
  const parsedInput = populateLeaderboardCacheSchema.parse(input.data);

  const dbClientLive = createDbClientLive(db);
  const leaderboardCacheServiceLive = LeaderboardCacheService.Default.pipe(
    Layer.provide(dbClientLive)
  );

  const program = Effect.provide(
    Effect.gen(function* () {
      const leaderboardCacheService = yield* LeaderboardCacheService;
      return yield* leaderboardCacheService.populateAll(parsedInput);
    }),
    leaderboardCacheServiceLive
  );

  const result = await Effect.runPromiseExit(program);

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