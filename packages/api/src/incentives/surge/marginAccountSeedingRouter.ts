import { TRPCError } from '@trpc/server';
import { Cause, Exit } from 'effect';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

const csvUploadSchema = z.object({
  csvData: z.string(),
});

export const adminMarginAccountSeedingRouter = createTRPCRouter({
  uploadCsv: publicProcedure
    .input(csvUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.dependencyLayer.uploadMarginAccountSeedingCsv(
        input.csvData,
      );

      return Exit.match(result, {
        onSuccess: (value) => value,
        onFailure: (cause) => {
          console.error('Failed to upload margin account CSV:', cause);

          const failure = Cause.failureOption(cause);
          if (
            failure._tag === 'Some' &&
            failure.value?._tag === 'CsvParsingError'
          ) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: failure.value.message,
            });
          }

          if (
            failure._tag === 'Some' &&
            failure.value?._tag === 'MarginAccountSeedingError'
          ) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: failure.value.message,
            });
          }

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to process margin account CSV',
          });
        },
      });
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.dependencyLayer.getMarginAccountCount();

    return Exit.match(result, {
      onSuccess: (count) => ({
        count,
      }),
      onFailure: (error) => {
        console.error('Failed to get margin account stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get margin account stats',
        });
      },
    });
  }),
});
