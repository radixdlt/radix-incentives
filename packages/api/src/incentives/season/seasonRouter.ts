import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";
import { CreateSeasonSchema, EditSeasonSchema } from "./season";

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
});

export const adminSeasonRouter = createTRPCRouter({
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

  createSeason: publicProcedure
    .input(CreateSeasonSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.createSeason(input);

      return Exit.match(result, {
        onSuccess: (value) => {
          return value;
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

  editSeason: publicProcedure
    .input(EditSeasonSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.editSeason(input);

      return Exit.match(result, {
        onSuccess: (value) => {
          return value;
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

  addCalculateSeasonPointsJob: publicProcedure
    .input(
      z.object({
        weekId: z.string(),
        force: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${process.env.WORKERS_API_BASE_URL}/queues/scheduled-calculations/add`,
        {
          method: "POST",
          body: JSON.stringify({
            weekId: input.weekId,
            force: input.force,
            markAsProcessed: true,
            includeSPCalculations: true,
          }),
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
        processed: z.boolean(),
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
