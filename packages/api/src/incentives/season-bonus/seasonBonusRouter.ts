import { Effect } from 'effect';
import { z } from 'zod';
import { resolveEffect } from '../runtime';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { ResponseError } from '../trpc/helpers';
import { parseCsvSeasonBonus } from './parseCsvSeasonBonus';
import { SeasonBonusService } from './seasonBonusService';

const csvUploadSchema = z.object({
  csvData: z.string(),
});

const getSeasonBonusSchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
});

export const adminSeasonBonusRouter = createTRPCRouter({
  uploadCsv: publicProcedure
    .input(csvUploadSchema)
    .mutation(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          // Parse CSV first
          const parseResult = yield* parseCsvSeasonBonus({
            csvData: input.csvData,
          });

          // Upload to database
          const service = yield* SeasonBonusService;
          yield* service.uploadCsv(parseResult.entries);

          return {
            success: true,
            count: parseResult.count,
            message: `Successfully uploaded ${parseResult.count} season bonus ${parseResult.count === 1 ? 'entry' : 'entries'}`,
          };
        }).pipe(
          Effect.catchTags({
            CsvParsingError: (error) =>
              new ResponseError({
                code: 'BAD_REQUEST',
                message: error.message,
              }),
          }),
        ),
      ),
    ),

  getSeasonBonusStats: publicProcedure.query(async () =>
    resolveEffect(
      Effect.gen(function* () {
        const service = yield* SeasonBonusService;
        const count = yield* service.getCount();
        return { count };
      }),
    ),
  ),

  getSeasonBonus: publicProcedure
    .input(getSeasonBonusSchema)
    .query(async ({ input }) =>
      resolveEffect(
        Effect.gen(function* () {
          const service = yield* SeasonBonusService;
          return yield* service.getSeasonBonus(input.userId, input.seasonId);
        }),
      ),
    ),
});
