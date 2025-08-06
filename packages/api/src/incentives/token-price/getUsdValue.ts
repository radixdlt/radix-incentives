import { Effect, Cache, Duration, Data } from 'effect';
import { BigNumber } from 'bignumber.js';
import { AddressValidationService } from '../../common/address-validation/addressValidation';
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

const TOKEN_PRICE_SERVICE_URL =
  process.env.TOKEN_PRICE_SERVICE_URL ||
  'https://token-price-service.radixdlt.com/price/historicalPrice';
const TOKEN_PRICE_SERVICE_API_KEY =
  process.env.TOKEN_PRICE_SERVICE_API_KEY || 'dummy';

type PriceCacheKey = `${string}:${number}`;

export class GetUsdValueService extends Effect.Service<GetUsdValueService>()(
  'GetUsdValueService',
  {
    effect: Effect.gen(function* () {
      const addressValidationService = yield* AddressValidationService;
      const fetchImpl = yield* FetchService;

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
            return yield* Effect.fail(
              new MissingPriceError({
                message: 'Price missing for tokens',
                resourceAddress,
                timestamp,
              }),
            );
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
          return yield* Effect.fail(
            new InvalidResourceAddressError({
              message: `Invalid resource address: ${input.resourceAddress}`,
            }),
          );
        }

        // Round timestamp to nearest minute for better cache hit rates
        const roundedTimestamp = Math.floor(input.timestamp.getTime() / 1000);

        const price = yield* priceCache.get(
          `${input.resourceAddress}:${roundedTimestamp}`,
        );

        return yield* Effect.succeed(
          new BigNumber(price).multipliedBy(input.amount),
        );
      });
    }),
  },
) {}

export const GetUsdValueLive = GetUsdValueService.Default;
