import { getDatesBetweenIntervals } from 'api/common';
import {
  type SnapshotDateRangeJob,
  snapshotDateRangeJobSchema,
} from 'api/incentives';
import type { Job } from 'bullmq';
import { SnapshotPriority } from '../snapshot/constants';
import { snapshotQueue } from '../snapshot/queue';

export const snapshotDateRangeWorker = async (
  input: Job<SnapshotDateRangeJob>,
) => {
  throw new Error('[TEST] Snapshot date range worker intentionally failing for alerting test');
  
  const parsedInput = snapshotDateRangeJobSchema.safeParse(input.data);
  if (!parsedInput.success) {
    throw new Error(parsedInput.error.message);
  }
  const dates = getDatesBetweenIntervals(
    new Date(input.data.fromTimestamp),
    new Date(input.data.toTimestamp),
    (date) => {
      date.setHours(date.getHours() + parsedInput.data.intervalInHours);
    },
  );

  for (const date of dates) {
    await snapshotQueue.queue.add(
      'manualSnapshot',
      {
        timestamp: date.toISOString(),
        addresses: input.data.addresses,
        addDummyData: input.data.addDummyData,
        includeActivityIds: input.data.includeActivityIds,
        usdThreshold: input.data.usdThreshold,
        batchSize: input.data.batchSize,
      },
      {
        priority: SnapshotPriority.Scheduled,
      },
    );
  }
};
