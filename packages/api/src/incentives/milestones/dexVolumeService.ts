import { Data, Effect } from 'effect';
import { z } from 'zod';

class DexVolumeFetchError extends Data.TaggedError('DexVolumeFetchError')<{
  message: string;
  cause?: unknown;
}> {}

class DexVolumeParseError extends Data.TaggedError('DexVolumeParseError')<{
  message: string;
  cause?: unknown;
}> {}

class DexVolumeValidationError extends Data.TaggedError(
  'DexVolumeValidationError',
)<{
  message: string;
  cause?: unknown;
}> {}

/**
 * DeFiLlama DEX volume response schema
 */
export const DexVolumeResponse = z.object({
  totalDataChartBreakdown: z.array(
    z.tuple([
      z.number(),
      z.record(z.string(), z.record(z.string(), z.number())),
    ]),
  ),
});

export type DexVolumeResponseData = z.infer<typeof DexVolumeResponse>;

export interface DexVolumeData {
  totalVolume: number;
  timestamp: Date;
}

/**
 * Service for managing DEX volume data from DeFiLlama API
 */
export class DexVolumeService extends Effect.Service<DexVolumeService>()(
  'DexVolumeService',
  {
    effect: Effect.gen(function* () {
      const SEPTEMBER_8_2025_TIMESTAMP = 1757289600; // September 8, 2025 00:00:00 UTC
      const DEX_NAMES = ['ociswap', 'defiplaza', 'caviarnine'];

      const fetchDexVolumeData = Effect.fn(function* (dexName: string) {
        const url = `https://api.llama.fi/summary/dexs/${dexName}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=false`;

        const response = yield* Effect.tryPromise({
          try: () => fetch(url),
          catch: (error) =>
            new DexVolumeFetchError({
              message: `Failed to fetch DEX volume data for ${dexName}`,
              cause: error,
            }),
        });

        if (!response.ok) {
          return yield* Effect.fail(
            new DexVolumeFetchError({
              message: `HTTP ${response.status}: ${response.statusText} for ${dexName}`,
            }),
          );
        }

        const rawData = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) =>
            new DexVolumeParseError({
              message: `Failed to parse DEX volume response for ${dexName}`,
              cause: error,
            }),
        });

        const data = yield* Effect.try({
          try: () => DexVolumeResponse.parse(rawData),
          catch: (error) =>
            new DexVolumeValidationError({
              message: `Invalid DEX volume data format from DeFiLlama for ${dexName}`,
              cause: error,
            }),
        });

        return data;
      });

      const calculateTotalRadixDexVolume = Effect.fn(function* () {
        let totalVolume = 0;

        // Fetch data for all DEXs
        for (const dexName of DEX_NAMES) {
          const dexData = yield* fetchDexVolumeData(dexName);

          if (!dexData.totalDataChartBreakdown) {
            continue;
          }

          // Process each data point
          for (const [
            timestamp,
            chainData,
          ] of dexData.totalDataChartBreakdown) {
            // Only count data from September 8, 2025 onwards
            if (timestamp < SEPTEMBER_8_2025_TIMESTAMP) {
              continue;
            }

            // Sum up all Radix volume for this timestamp
            if (chainData.Radix) {
              const radixVolume = Object.values(chainData.Radix).reduce(
                (sum, volume) => sum + volume,
                0,
              );
              totalVolume += radixVolume;
            }
          }
        }

        return {
          totalVolume,
          timestamp: new Date(),
        };
      });

      return {
        /**
         * Fetch DEX volume data from DeFiLlama API for a specific DEX
         */
        fetchDexVolumeData,

        /**
         * Calculate total Radix DEX volume since September 8, 2025
         */
        calculateTotalRadixDexVolume,

        /**
         * Get current total DEX volume (wrapper for easy milestone integration)
         */
        getCurrentDexVolume: Effect.fn(function* () {
          return yield* calculateTotalRadixDexVolume();
        }),
      } as const;
    }),
  },
) {}

export const DexVolumeServiceLive = DexVolumeService.Default;
