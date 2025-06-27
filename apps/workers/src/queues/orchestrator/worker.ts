import { dependencyLayer } from "api/incentives";
import type { OrchestratorJob } from "./schemas";
import type { Job } from "bullmq";
import { Exit } from "effect";

export const orchestratorWorker = async (input: Job<OrchestratorJob>) => {
  /**
   * -
   */
};
