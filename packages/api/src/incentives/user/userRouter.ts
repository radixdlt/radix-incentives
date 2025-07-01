import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";

export const userRouter = createTRPCRouter({
  getUsersPaginated: publicProcedure
    .input(z.object({ page: z.number(), limit: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.getUsersPaginated(input);

      if (result._tag === "Failure") {
        console.error(result.cause);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return result.value;
    }),

  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getUserStats({
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
});
