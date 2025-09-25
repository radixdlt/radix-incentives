import { Data, Effect } from 'effect';
import { z } from 'zod';

/**
 * DefiLlama historical TVL response schema
 */
export const DefiLlamaTvlResponse = z.array(
  z.object({
    date: z.number(),
    tvl: z.number(),
  }),
);

export type DefiLlamaTvlData = z.infer<typeof DefiLlamaTvlResponse>;

/**
 * TVL Service Error types
 */
class TvlFetchError extends Data.TaggedError('TvlFetchError')<{
  message: string;
  cause?: unknown;
}> {}

class TvlParseError extends Data.TaggedError('TvlParseError')<{
  message: string;
  cause?: unknown;
}> {}

class TvlValidationError extends Data.TaggedError('TvlValidationError')<{
  message: string;
  cause?: unknown;
}> {}

class TvlNoDataError extends Data.TaggedError('TvlNoDataError')<{
  message: string;
}> {}

export type TvlServiceError =
  | TvlFetchError
  | TvlParseError
  | TvlValidationError
  | TvlNoDataError;

/**
 * Service for fetching Total Value Locked (TVL) data from DefiLlama
 */
export class TvlService extends Effect.Service<TvlService>()('TvlService', {
  effect: Effect.gen(function* () {
    /**
     * Fetch the latest TVL data for Radix from DefiLlama
     * @returns The latest TVL value in USD
     */
    const getLatestRadixTvl = Effect.gen(function* () {
      const response = yield* Effect.tryPromise({
        try: () => fetch('https://api.llama.fi/v2/historicalChainTvl/radix'),
        catch: (error) =>
          new TvlFetchError({
            message: 'Failed to fetch TVL data from DefiLlama API',
            cause: error,
          }),
      });

      if (!response.ok) {
        return yield* Effect.fail(
          new TvlFetchError({
            message: `DefiLlama API returned status: ${response.status}`,
          }),
        );
      }

      const rawData = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: (error) =>
          new TvlParseError({
            message: 'Failed to parse TVL response as JSON',
            cause: error,
          }),
      });

      const data = yield* Effect.try({
        try: () => DefiLlamaTvlResponse.parse(rawData),
        catch: (error) =>
          new TvlValidationError({
            message: 'Invalid TVL data format from DefiLlama',
            cause: error,
          }),
      });

      if (data.length === 0) {
        return yield* Effect.fail(
          new TvlNoDataError({
            message: 'No TVL data available from DefiLlama',
          }),
        );
      }

      // Sort by date descending and get the latest entry
      const sortedData = data.sort((a, b) => b.date - a.date);
      const latestTvl = sortedData[0];

      if (!latestTvl) {
        return yield* Effect.fail(
          new TvlNoDataError({
            message: 'No valid TVL data found after sorting',
          }),
        );
      }

      return {
        value: latestTvl.tvl,
        timestamp: new Date(latestTvl.date * 1000),
      };
    });

    return {
      getLatestRadixTvl,
    } as const;
  }),
}) {}

export const TvlServiceLive = TvlService.Default;
