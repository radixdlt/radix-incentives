import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Exit } from "effect";

const csvUploadSchema = z.object({
  csvData: z.string(),
});

export const componentWhitelistRouter = createTRPCRouter({
  uploadCsv: publicProcedure
    .input(csvUploadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse csv data
        const lines = input.csvData.trim().split("\n");
        const componentAddresses: string[] = [];

        if (lines.length === 0 || (lines.length === 1 && !lines[0]?.trim())) {
          // Empty csv, clear whitelist
        } else {
          const header = lines[0];

          if (!header?.includes("matched_component")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Invalid CSV format. Expected 'matched_component' column",
            });
          }

          // Find the column index for matched_component
          const headers = header.split(",").map((h) => h.trim());
          const componentIndex = headers.findIndex(
            (h) => h === "matched_component" || h === '"matched_component"'
          );

          if (componentIndex === -1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Component address column not found",
            });
          }

          // Parse addresses from csv
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i]?.trim();
            if (!line) continue;

            const columns = line
              .split(",")
              .map((col) => col.trim().replace(/"/g, ""));
            const componentAddress = columns[componentIndex];

            if (componentAddress?.startsWith("component_")) {
              componentAddresses.push(componentAddress);
            }
          }
        }

        // Upload to database
        const result =
          await ctx.dependencyLayer.uploadComponentWhitelistCsv(
            componentAddresses
          );

        if (Exit.isFailure(result)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload CSV to database",
          });
        }

        const message =
          componentAddresses.length === 0
            ? "Successfully cleared component whitelist"
            : `Successfully updated whitelist with ${componentAddresses.length} components`;

        return {
          success: true,
          count: componentAddresses.length,
          message,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process CSV upload",
        });
      }
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
