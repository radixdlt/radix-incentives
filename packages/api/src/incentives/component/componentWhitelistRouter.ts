import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Exit, Cause } from "effect";

const csvUploadSchema = z.object({
  csvData: z.string(),
});

export const adminComponentWhitelistRouter = createTRPCRouter({
  uploadCsv: publicProcedure
    .input(csvUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.uploadComponentWhitelistCsv(
        input.csvData
      );

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (cause) => {
          console.error("Failed to upload CSV:", cause);

          const failure = Cause.failureOption(cause);
          if (
            failure._tag === "Some" &&
            failure.value?._tag === "CsvParsingError"
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: failure.value.message,
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload CSV to database",
          });
        },
      });
    }),

  getWhitelistStats: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getComponentWhitelistCount();

    return Exit.match(result, {
      onSuccess: (count) => ({
        count,
      }),
      onFailure: (error) => {
        console.error("Failed to get whitelist stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get whitelist stats",
        });
      },
    });
  }),
});
