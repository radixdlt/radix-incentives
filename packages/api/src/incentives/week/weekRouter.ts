import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";
import { z } from "zod";

export const weekRouter = createTRPCRouter({
  getWeeks: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getAvailableWeeks({
      seasonId: undefined,
    });

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      },
    });
  }),
});

export const weekAdminRouter = createTRPCRouter({
  getWeekDetails: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getWeekDetails({
        weekId: input.weekId,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        },
      });
    }),
  updatePointsPool: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
        activityCategoryId: z.string(),
        pointsPool: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateCategoryWeekPointsPool({
        weekId: input.weekId,
        activityCategoryId: input.activityCategoryId,
        pointsPool: input.pointsPool,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        },
      });
    }),
  updateActivityWeekMultiplier: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
        activityId: z.string(),
        multiplier: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateActivityWeekMultiplier({
        weekId: input.weekId,
        activityId: input.activityId,
        multiplier: input.multiplier,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        },
      });
    }),
});
