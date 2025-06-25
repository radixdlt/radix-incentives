import { Context, Effect, Layer, Cache, Duration } from "effect";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";

export type GetUsdValueInput = {
  amount: BigNumber;
  resourceAddress: string;
  timestamp: Date;
};

export class InvalidResourceAddressError {
  readonly _tag = "InvalidResourceAddressError";
  constructor(readonly message: string) {}
}

export class PriceServiceApiError {
  readonly _tag = "PriceServiceApiError";
  constructor(readonly message: string) {}
}

export type GetUsdValueServiceError =
  | InvalidResourceAddressError
  | PriceServiceApiError;

export class GetUsdValueService extends Context.Tag("GetUsdValueService")<
  GetUsdValueService,
  (input: GetUsdValueInput) => Effect.Effect<BigNumber, GetUsdValueServiceError>
>() {}

const TOKEN_PRICE_SERVICE_URL =
  process.env.TOKEN_PRICE_SERVICE_URL ||
  "https://token-price-service.radixdlt.com/price/historicalPrice";
const TOKEN_PRICE_SERVICE_API_KEY =
  process.env.TOKEN_PRICE_SERVICE_API_KEY || "dummy";

type PriceCacheKey = `${string}:${number}`;

const fetchTokenPriceFromAPI = (
  resourceAddress: string,
  timestamp: number
): Effect.Effect<number, PriceServiceApiError> =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(TOKEN_PRICE_SERVICE_URL, {
          method: "POST",
          headers: {
            "x-api-key": TOKEN_PRICE_SERVICE_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokens: [resourceAddress],
            timestamp: timestamp,
          }),
        }),
      catch: (error) =>
        new PriceServiceApiError(
          `Failed to fetch token price: ${error instanceof Error ? error.message : String(error)}`
        ),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new PriceServiceApiError(`HTTP error! status: ${response.status}`)
      );
    }

    const data = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) =>
        new PriceServiceApiError(
          `Failed to parse response: ${error instanceof Error ? error.message : String(error)}`
        ),
    });

    if (!data || !data.prices || !data.prices[resourceAddress]) {
      return yield* Effect.fail(
        new PriceServiceApiError("Invalid response format from price service")
      );
    }

    return data.prices[resourceAddress].usd_price;
  });

export const GetUsdValueLive = Layer.effect(
  GetUsdValueService,
  Effect.gen(function* () {
    // Create a cache with 5 minutes TTL and max 1000 entries
    const priceCache = yield* Cache.make({
      capacity: 1000,
      timeToLive: Duration.minutes(5),
      lookup: (key: PriceCacheKey) => {
        const [resourceAddress, roundedTimestamp] = key.split(":");
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const timestamp = Number.parseInt(roundedTimestamp!);
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        return fetchTokenPriceFromAPI(resourceAddress!, timestamp!);
      },
    });

    return (input) => {
      return Effect.gen(function* () {
        const isXUSDC = Assets.Fungible.xUSDC === input.resourceAddress;
        const isXRD = Assets.Fungible.XRD === input.resourceAddress;

        if (!isXUSDC && !isXRD) {
          return yield* Effect.fail(
            new InvalidResourceAddressError(
              `Invalid resource address: ${input.resourceAddress}`
            )
          );
        }

        // Round timestamp to nearest minute for better cache hit rates
        const roundedTimestamp = Math.floor(input.timestamp.getTime() / 1000);

        const price = yield* priceCache.get(
          `${input.resourceAddress}:${roundedTimestamp}`
        );

        return yield* Effect.succeed(
          new BigNumber(price).multipliedBy(input.amount)
        );
      });
    };
  })
);
