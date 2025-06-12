import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";

export const seasonRouter = createTRPCRouter({
  getSeasons: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getSeasons();

    if (result._tag === "Failure") {
      console.error(result.cause);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    return result.value;
  }),

  getSeasonById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getSeasonById({
        id: input.id,
        includeWeeks: true,
      });

      return Exit.match(result, {
        onSuccess: (value) => {
          const { weeks, activityWeeks, season } = value;

          return {
            season,
            weeks: weeks ?? [],
            activityWeeks: activityWeeks ?? [],
          };
        },
        onFailure: (error) => {
          if (error._tag === "Fail") {
            if (error.error._tag === "SeasonNotFoundError") {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: error.error.message,
              });
            }

            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "An unexpected error occurred",
            });
          }
        },
      });
    }),

  addCalculateSeasonPointsJob: publicProcedure
    .input(
      z.object({
        seasonId: z.string(),
        weekId: z.string(),
        force: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${process.env.WORKERS_API_BASE_URL}/queues/calculate-activity-points/add`,
        {
          method: "POST",
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  updateWeekStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["upcoming", "active", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateWeekStatus(input);

      return Exit.match(result, {
        onSuccess: () => {
          return { success: true };
        },
        onFailure: (error) => {
          if (error._tag === "Fail") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }
        },
      });
    }),
});
