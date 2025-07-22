import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Exit } from "effect";

export const adminDappRouter = createTRPCRouter({
  getDapps: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getDapps();

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
export const dappRouter = createTRPCRouter({
  getDapps: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getDapps();

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
