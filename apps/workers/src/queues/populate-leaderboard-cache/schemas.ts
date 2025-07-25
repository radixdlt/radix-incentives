import { z } from "zod";

export const populateLeaderboardCacheSchema = z.object({
  seasonId: z.string().uuid().optional(),
  weekId: z.string().uuid().optional(),
  force: z.boolean().default(false),
});

export type PopulateLeaderboardCacheInput = z.infer<typeof populateLeaderboardCacheSchema>;