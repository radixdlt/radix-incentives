import { dependencyLayer } from "api/incentives";
import { FlowProducer } from "bullmq";
import { Exit } from "effect";
import { QueueName } from "../types";
import { redisClient } from "../../redis";
import type { ScheduledCalculationsJob } from "./schemas";
import type { FlowJob, Job } from "bullmq";

const flowProducer = new FlowProducer({ connection: redisClient });

export const scheduledCalculationsWorker = async (
  job: Job<ScheduledCalculationsJob>
) => {
  let weekId = job.data.weekId;

  if (!weekId) {
    const timestamp = new Date(job.timestamp);
    job.log(`no weekId provided, getting week by date ${timestamp}`);
    // If no weekId is provided, get the current week by date
    const weekResult = await dependencyLayer.getWeekByDate(timestamp);

    if (Exit.isFailure(weekResult)) {
      if (weekResult.cause._tag === "Fail") {
        const enhancedError = new Error(weekResult.cause.error._tag);
        enhancedError.stack = `${JSON.stringify(weekResult.cause.error, null, 2)}`;
        enhancedError.cause = weekResult.cause.error._tag;
        throw enhancedError;
      }

      if (weekResult.cause._tag === "Die") {
        const enhancedError = new Error("unhandled error");

        if (
          weekResult.cause.defect !== null &&
          typeof weekResult.cause.defect === "object" &&
          "stack" in weekResult.cause.defect
        ) {
          enhancedError.stack = `${weekResult.cause.defect.stack}`;
        } else {
          enhancedError.stack = JSON.stringify(
            weekResult.cause.defect,
            null,
            2
          );
        }

        enhancedError.cause = "unhandled error";
        throw enhancedError;
      }

      throw new Error(JSON.stringify(weekResult.cause, null, 2));
    }
    weekId = weekResult.value.id;
  }

  const seasonResult = await dependencyLayer.getSeasonByWeekId(weekId);

  if (Exit.isFailure(seasonResult)) {
    if (seasonResult.cause._tag === "Fail") {
      const enhancedError = new Error(seasonResult.cause.error._tag);
      enhancedError.stack = `${JSON.stringify(seasonResult.cause.error, null, 2)}`;
      enhancedError.cause = seasonResult.cause.error._tag;
      throw enhancedError;
    }

    if (seasonResult.cause._tag === "Die") {
      const enhancedError = new Error("unhandled error");
      enhancedError.stack = `${JSON.stringify(seasonResult.cause.defect, null, 2)}`;
      enhancedError.cause = "unhandled error";
      throw enhancedError;
    }

    throw new Error(JSON.stringify(seasonResult.cause, null, 2));
  }

  const seasonId = seasonResult.value.id;

  job.log(`starting scheduled calculations for weekId: ${weekId}`);

  // Create base job configuration for seasonPointsMultiplier -> calculateActivityPoints
  const baseJobConfig = {
    name: "scheduledJob",
    data: { weekId },
    queueName: QueueName.seasonPointsMultiplier,
    children: [
      {
        name: "scheduledJob",
        data: { weekId },
        opts: { failParentOnFailure: true },
        queueName: QueueName.calculateActivityPoints,
      },
    ],
  };

  let jobConfig: FlowJob;

  if (job.data.includeSPCalculations) {
    // Wrap the base config inside calculateSeasonPoints
    jobConfig = {
      name: "scheduledJob",
      data: { weekId, seasonId, markAsProcessed: job.data.markAsProcessed },
      queueName: QueueName.calculateSeasonPoints,
      children: [baseJobConfig],
    };
  } else {
    // Use the base config directly
    jobConfig = baseJobConfig;
  }

  await flowProducer.add(jobConfig);
};
