import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import { snapshotDateRangeWorker } from './worker';

export const snapshotDateRangeQueue = createQueue({
  name: QueueName.snapshotDateRange,
  redisClient,
  worker: snapshotDateRangeWorker,
  onError: async (_, error) => {
    console.error(error);
  },
});
