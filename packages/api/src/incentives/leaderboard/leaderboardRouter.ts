import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";

export const leaderboardRouter = createTRPCRouter({
  getSeasonLeaderboard: protectedProcedure
    .input(
      z.object({
        seasonId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getSeasonLeaderboard({
        seasonId: input.seasonId,
        userId: ctx.session.user.id,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        },
      });
    }),

  getActivityLeaderboard: protectedProcedure
    .input(
      z.object({
        activityId: z.string(),
        weekId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getActivityLeaderboard({
        activityId: input.activityId,
        weekId: input.weekId,
        userId: ctx.session.user.id,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        },
      });
    }),

  getAvailableSeasons: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getAvailableSeasons();

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      },
    });
  }),

  getAvailableWeeks: publicProcedure
    .input(
      z.object({
        seasonId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getAvailableWeeks({
        seasonId: input.seasonId,
      });

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (error) => {
          console.error(error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        },
      });
    }),

  getAvailableActivities: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getAvailableActivities();

    return Exit.match(result, {
      onSuccess: (value) => value,
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      },
    });
  }),
});
