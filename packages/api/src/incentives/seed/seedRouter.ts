import { seedActivities } from "db/incentives";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const adminSeedRouter = createTRPCRouter({
  seedAll: publicProcedure.mutation(async () => {
    try {
      await seedActivities();

      return {
        success: true,
        message: "Database seeded successfully",
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to seed database: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),
});
