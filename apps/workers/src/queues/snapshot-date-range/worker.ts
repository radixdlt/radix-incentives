import type { Job } from "bullmq";
import { snapshotQueue } from "../snapshot/queue";
import {
  snapshotDateRangeJobSchema,
  type SnapshotDateRangeJob,
} from "./schemas";
import { getDatesBetweenIntervals } from "api/common";
import { SnapshotPriority } from "../snapshot/constants";

export const snapshotDateRangeWorker = async (
  input: Job<SnapshotDateRangeJob>
) => {
  const parsedInput = snapshotDateRangeJobSchema.safeParse(input.data);
  if (!parsedInput.success) {
    throw new Error(parsedInput.error.message);
  }
  const dates = getDatesBetweenIntervals(
    new Date(input.data.fromTimestamp),
    new Date(input.data.toTimestamp),
    (date) => {
      date.setHours(date.getHours() + parsedInput.data.intervalInHours);
    }
  );

  for (const date of dates) {
    await snapshotQueue.queue.add(
      "manualSnapshot",
      {
        timestamp: date.toISOString(),
        addresses: input.data.addresses,
        addDummyData: false,
      },
      {
        priority: SnapshotPriority.Scheduled,
      }
    );
  }
};
