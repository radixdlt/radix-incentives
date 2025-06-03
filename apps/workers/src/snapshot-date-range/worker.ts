import type { Job } from "bullmq";
import { snapshotQueue } from "../snapshot/queue";
import {
  snapshotDateRangeJobSchema,
  type SnapshotDateRangeJob,
} from "./schemas";
import { getDatesBetweenIntervals } from "api/common";

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
      date.setHours(date.getHours() + 1);
    }
  );

  await snapshotQueue.queue.addBulk(
    dates.map((date) => ({
      name: "manual-snapshot",
      data: {
        timestamp: date.toISOString(),
        addresses: input.data.addresses,
      },
    }))
  );
};
