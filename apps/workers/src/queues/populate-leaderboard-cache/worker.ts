import { dependencyLayer } from 'api/incentives';
import type { Job } from 'bullmq';
import { Exit } from 'effect';
import {
  populateLeaderboardCacheSchema,
  type PopulateLeaderboardCacheInput,
} from './schemas';

export const populateLeaderboardCacheWorker = async (
  input: Job<PopulateLeaderboardCacheInput>,
) => {
  const parsedInput = populateLeaderboardCacheSchema.parse(input.data);

  const result = await dependencyLayer.populateLeaderboardCache(parsedInput);

  if (Exit.isFailure(result)) {
    if (result.cause._tag === 'Fail') {
      const error = result.cause.error;
      const enhancedError = new Error(
        typeof error === 'object' && error !== null && '_tag' in error
          ? (error._tag as string)
          : 'Unknown error',
      );
      console.error(error);

      if (
        typeof error === 'object' &&
        error !== null &&
        'stack' in error &&
        typeof error.stack === 'string'
      ) {
        enhancedError.stack = error.stack;
      }

      enhancedError.cause =
        typeof error === 'object' && error !== null && '_tag' in error
          ? (error._tag as string)
          : 'unknown';
      throw enhancedError;
    }

    if (result.cause._tag === 'Die') {
      const defect = result.cause.defect;
      const enhancedError = new Error(
        typeof defect === 'object' &&
          defect !== null &&
          'message' in defect &&
          typeof defect.message === 'string'
          ? defect.message
          : 'Unhandled error',
      );

      if (
        typeof defect === 'object' &&
        defect !== null &&
        'stack' in defect &&
        typeof defect.stack === 'string'
      ) {
        enhancedError.stack = defect.stack;
      }

      enhancedError.cause = 'unhandled error';
      throw enhancedError;
    }

    throw new Error(JSON.stringify(result.cause, null, 2));
  }
};
