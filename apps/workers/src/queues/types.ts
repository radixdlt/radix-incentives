export const QueueName = {
  calculateActivityPoints: "calculateActivityPoints",
  calculateSeasonPoints: "calculateSeasonPoints",
  seasonPointsMultiplier: "seasonPointsMultiplier",
  scheduledSnapshot: "scheduledSnapshot",
  event: "event",
  snapshot: "snapshot",
  snapshotDateRange: "snapshotDateRange",
  scheduledCalculations: "scheduledCalculations",
} as const;

export type QueueName = (typeof QueueName)[keyof typeof QueueName];
