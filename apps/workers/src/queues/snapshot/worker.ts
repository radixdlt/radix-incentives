import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import { SnapshotV2Worker } from 'api/incentives/snapshot/v2/snapshotV2Worker';
import type { Job } from 'bullmq';
import { Cause, Effect, Exit } from 'effect';
import type { SnapshotJob } from './schemas';

export const snapshotWorker = async (input: Job<SnapshotJob>) => {
  const result = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const snapshotService = yield* SnapshotV2Worker;
      return yield* snapshotService({
        jobId: input.id!,
        addresses: input.data.addresses,
        timestamp: new Date(input.data.timestamp),
        addDummyData: input.data.addDummyData,
        includeActivityIds: input.data.includeActivityIds,
        usdThreshold: input.data.usdThreshold,
        batchSize: input.data.batchSize,
      });
    }),
  );

  Exit.match(result, {
    onSuccess: (value) => value,
    onFailure: (cause) => {
      if (Cause.isFailType(cause)) {
        const enhancedError = new Error(cause.error._tag);
        enhancedError.stack = Cause.pretty(cause);
        enhancedError.cause = cause.error._tag;
        throw enhancedError;
      }

      const enhancedError = new Error('unhandled error');
      enhancedError.cause = cause._tag;
      enhancedError.stack = Cause.pretty(cause);
      throw enhancedError;
    },
  });
};
