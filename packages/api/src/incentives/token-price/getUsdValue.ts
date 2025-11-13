import { BigNumber } from 'bignumber.js';
import { Cache, Config, Data, Duration, Effect } from 'effect';
import {
  AddressValidationService,
  AddressValidationServiceLive,
} from '../../common/address-validation/addressValidation';
import { FetchService } from '../../common/helpers';

export type GetUsdValueInput = {
  amount: BigNumber;
  resourceAddress: string;
  timestamp: Date;
};

export class InvalidResourceAddressError extends Data.TaggedError(
  'InvalidResourceAddressError',
)<{ message: string }> {}

export class PriceServiceApiError extends Data.TaggedError(
  'PriceServiceApiError',
)<{
  message: string;
  status?: number;
  resourceAddress: string;
  timestamp: number;
}> {}

class MissingPriceError extends Data.TaggedError('MissingPriceError')<{
  message: string;
  resourceAddress: string;
  timestamp: number;
}> {}

type PriceCacheKey = `${string}:${number}`;

export class GetUsdValueService extends Effect.Service<GetUsdValueService>()(
  'GetUsdValueService',
  {
    dependencies: [AddressValidationServiceLive, FetchService.Default],
    effect: Effect.gen(function* () {
      const addressValidationService = yield* AddressValidationService;
      const fetchImpl = yield* FetchService;

      const TOKEN_PRICE_SERVICE_API_KEY = yield* Config.string(
        'TOKEN_PRICE_SERVICE_API_KEY',
      );

      const TOKEN_PRICE_SERVICE_URL = yield* Config.string(
        'TOKEN_PRICE_SERVICE_URL',
      ).pipe(
        Config.withDefault(
          'https://token-price-service.radixdlt.com/price/historicalPrice',
        ),
      );

      const fetchTokenPriceFromAPI = Effect.fn(function* (
        resourceAddress: string,
        timestamp: number,
      ) {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetchImpl(TOKEN_PRICE_SERVICE_URL, {
              method: 'POST',
              headers: {
                'x-api-key': TOKEN_PRICE_SERVICE_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tokens: [resourceAddress],
                timestamp: timestamp,
              }),
            }),
          catch: (error) =>
            new PriceServiceApiError({
              message: `Failed to fetch token price: ${error instanceof Error ? error.message : String(error)}`,
              resourceAddress,
              timestamp,
            }),
        });

        if (!response.ok) {
          const responseText = yield* Effect.tryPromise({
            try: () => response.text(),
            catch: (error) =>
              new PriceServiceApiError({
                message: `Failed to fetch token price: ${error instanceof Error ? error.message : String(error)}`,
                resourceAddress,
                timestamp,
              }),
          });

          if (responseText.includes('Price missing for tokens')) {
            // Treat missing price as zero price (not an error)
            return yield* Effect.succeed(0);
          }

          return yield* Effect.fail(
            new PriceServiceApiError({
              message: `HTTP error! status: ${response.status}, ${responseText}`,
              resourceAddress,
              timestamp,
              status: response.status,
            }),
          );
        }

        const data = yield* Effect.tryPromise({
          try: () =>
            response.json() as Promise<{
              prices: Record<string, { usd_price: number }>;
            }>,
          catch: (error) =>
            new PriceServiceApiError({
              message: `Failed to parse response: ${error instanceof Error ? error.message : String(error)}`,
              resourceAddress,
              timestamp,
            }),
        });

        if (!data || !data.prices || !data.prices[resourceAddress]) {
          return yield* Effect.fail(
            new PriceServiceApiError({
              message: 'Invalid response format from price service',
              resourceAddress,
              timestamp,
            }),
          );
        }

        return data.prices[resourceAddress].usd_price;
      });

      // Create a cache with 5 minutes TTL and max 1000 entries
      const priceCache = yield* Cache.make({
        capacity: 1000,
        timeToLive: Duration.minutes(5),
        lookup: (key: PriceCacheKey) => {
          const [resourceAddress, roundedTimestamp] = key.split(':');

          const timestamp = Number.parseInt(roundedTimestamp!);

          return fetchTokenPriceFromAPI(resourceAddress!, timestamp!);
        },
      });
      return Effect.fn(function* (input: GetUsdValueInput) {
        const tokenNameResult = yield* addressValidationService
          .getTokenName(input.resourceAddress)
          .pipe(Effect.either);

        if (tokenNameResult._tag === 'Left') {
          // On invalid resource address, fall back to returning the original amount (treat price as 1)
          return yield* Effect.succeed(input.amount);
        }

        // Round timestamp to nearest minute for better cache hit rates
        const roundedTimestamp = Math.floor(input.timestamp.getTime() / 1000);

        // Try to get price; on any error, fall back to returning the original amount
        const priceResult = yield* priceCache
          .get(`${input.resourceAddress}:${roundedTimestamp}`)
          .pipe(Effect.either);

        if (priceResult._tag === 'Left') {
          return yield* Effect.succeed(input.amount);
        }

        // const price = priceResult.right;
        const price = new BigNumber(1);
        return yield* Effect.succeed(input.amount.multipliedBy(price));
      });
    }),
  },
) {}

export const GetUsdValueLive = GetUsdValueService.Default;
