import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import { processWeekWorker } from './worker';

export const processWeekQueue = createQueue({
  name: QueueName.processWeek,
  redisClient,
  worker: processWeekWorker,
  onError: async (_, error) => {
    console.error(error);
  },
});
