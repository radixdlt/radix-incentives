import { dependencyLayer } from "api/incentives";
import { FlowProducer } from "bullmq";
import { Exit } from "effect";
import { QueueName } from "../types";

export const scheduledCalculationsWorker = async () => {
  const flowProducer = new FlowProducer();
  const result = await dependencyLayer.getActiveWeek();

  if (Exit.isFailure(result)) {
    if (result.cause._tag === "Fail") {
      const enhancedError = new Error(result.cause.error._tag);
      enhancedError.stack = `${JSON.stringify(result.cause.error, null, 2)}`;
      enhancedError.cause = result.cause.error._tag;
      throw enhancedError;
    }

    if (result.cause._tag === "Die") {
      const enhancedError = new Error("unhandled error");

      if (
        result.cause.defect !== null &&
        typeof result.cause.defect === "object" &&
        "stack" in result.cause.defect
      ) {
        enhancedError.stack = `${result.cause.defect.stack}`;
      } else {
        enhancedError.stack = JSON.stringify(result.cause.defect, null, 2);
      }

      enhancedError.cause = "unhandled error";
      throw enhancedError;
    }

    throw new Error(JSON.stringify(result.cause, null, 2));
  }

  const activeWeek = result.value;

  // Order: AP calculation -> SP multiplier calculation -> SP calculation
  await flowProducer.add({
    name: "scheduledJob",
    data: { weekId: activeWeek.id, seasonId: activeWeek.seasonId },
    queueName: QueueName.calculateSeasonPoints,
    children: [
      {
        name: "scheduledJob",
        data: { weekId: activeWeek.id },
        opts: { failParentOnFailure: true },
        queueName: QueueName.seasonPointsMultiplier,
        children: [
          {
            name: "scheduledJob",
            data: { weekId: activeWeek.id },
            opts: { failParentOnFailure: true },
            queueName: QueueName.calculateActivityPoints,
          },
        ],
      },
    ],
  });
};
