import { z } from "zod";

export const orchestratorJobSchema = z.object({});

export type OrchestratorJob = z.infer<typeof orchestratorJobSchema>;
