import { z } from "zod";

export const populateLeaderboardCacheSchema = z.object({
  weekId: z.string().uuid().optional(),
});

export type PopulateLeaderboardCacheInput = z.infer<typeof populateLeaderboardCacheSchema>;