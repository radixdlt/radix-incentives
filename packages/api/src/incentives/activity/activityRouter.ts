import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";
import { UpdateActivitySchema } from "./activity";

export const adminActivityRouter = createTRPCRouter({
  getActivities: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getActivities();

    if (result._tag === "Failure") {
      console.error(result.cause);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    return result.value;
  }),
  getActivityById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getActivityById({
        id: input.id,
      });

      return Exit.match(result, {
        onSuccess: (value) => {
          return value;
        },
        onFailure: (error) => {
          if (error._tag === "Fail") {
            if (error.error._tag === "NotFoundError") {
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

  updateActivity: publicProcedure
    .input(UpdateActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.updateActivity(input);

      return Exit.match(result, {
        onSuccess: (value) => {
          return value;
        },
        onFailure: (error) => {
          console.error(error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          });
        },
      });
    }),

  getActivityCategories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getActivityCategories();

    return Exit.match(result, {
      onSuccess: (value) => {
        return value;
      },
      onFailure: (error) => {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        });
      },
    });
  }),
});

export const activityRouter = createTRPCRouter({
  getActivityData: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getActivityData();

    return Exit.match(result, {
      onSuccess: (value) => {
        return value;
      },
      onFailure: (error) => {
        console.error(error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        });
      },
    });
  }),
});
