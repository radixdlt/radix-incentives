import { getHourStartInUTC } from '../../helpers/getHourStartInUTC';
import { SnapshotPriority } from '../snapshot/constants';
import { snapshotQueue } from '../snapshot/queue';

export const scheduledSnapshotWorker = async () => {
  throw new Error('[TEST] Scheduled snapshot worker intentionally failing for alerting test');
  
  await snapshotQueue.queue.add(
    'scheduledSnapshot',
    {
      timestamp: getHourStartInUTC().toISOString(),
    },
    {
      priority: SnapshotPriority.Scheduled,
    },
  );
};
