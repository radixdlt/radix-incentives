import { getHourStartInUTC } from "../../helpers/getHourStartInUTC";
import { SnapshotPriority } from "../snapshot/constants";
import { snapshotQueue } from "../snapshot/queue";

export const scheduledSnapshotWorker = async () => {
  await snapshotQueue.queue.add(
    "scheduledSnapshot",
    {
      timestamp: getHourStartInUTC().toISOString(),
    },
    {
      priority: SnapshotPriority.Scheduled,
    }
  );
};
