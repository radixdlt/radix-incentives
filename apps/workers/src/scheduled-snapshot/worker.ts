import { getHourStartInUTC } from "../helpers/getHourStartInUTC";
import { snapshotQueue } from "../snapshot/queue";

export const scheduledSnapshotWorker = async () => {
  await snapshotQueue.queue.add(
    "scheduledSnapshot",
    {
      timestamp: getHourStartInUTC().toISOString(),
    },
    {}
  );
};
