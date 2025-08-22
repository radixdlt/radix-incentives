import { TRPCError } from '@trpc/server';
import { seedActivities } from 'db/incentives';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { Exit } from 'effect';

export const adminSeedRouter = createTRPCRouter({
  seedAll: publicProcedure.mutation(async ({ ctx }) => {
    try {
      await seedActivities();

      const result = await ctx.dependencyLayer.seedActivities();

      Exit.match(result, {
        onSuccess: () => {},
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to seed activities`,
          });
        },
      });

      return {
        success: true,
        message: 'Database seeded successfully',
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }),
});
