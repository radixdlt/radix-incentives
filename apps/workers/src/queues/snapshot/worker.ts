import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import { SnapshotV2Worker } from 'api/incentives/snapshot/v2/snapshotV2Worker';
import type { Job } from 'bullmq';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';
import type { SnapshotJob } from './schemas';

export const snapshotWorker = async (input: Job<SnapshotJob>) => {
  throw new Error('[TEST] Snapshot worker intentionally failing for alerting test');
  
  const exit = await workerRuntime.runPromiseExit(
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

  return handleExit(exit);
};
