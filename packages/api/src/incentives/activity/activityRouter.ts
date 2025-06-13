import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";

export const activityRouter = createTRPCRouter({
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
});
