import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";

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
