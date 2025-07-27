import { z } from "zod";

export const populateLeaderboardCacheSchema = z.object({
  seasonId: z.string().uuid().optional(),
  weekId: z.string().uuid().optional(),
});

export type PopulateLeaderboardCacheInput = z.infer<typeof populateLeaderboardCacheSchema>;