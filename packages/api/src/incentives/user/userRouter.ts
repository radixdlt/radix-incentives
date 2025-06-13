import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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
});
