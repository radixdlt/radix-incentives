export const QueueName = {
  calculateActivityPoints: "calculateActivityPoints",
  calculateSeasonPoints: "calculateSeasonPoints",
  seasonPointsMultiplier: "seasonPointsMultiplier",
  scheduledSnapshot: "scheduledSnapshot",
  event: "event",
  orchestrator: "orchestrator",
  snapshot: "snapshot",
  snapshotDateRange: "snapshotDateRange",
} as const;

export type QueueName = (typeof QueueName)[keyof typeof QueueName];
