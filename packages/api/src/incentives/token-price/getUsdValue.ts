import { Context, Effect, Layer } from "effect";
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

export class ApiError {
  readonly _tag = "ApiError";
  constructor(readonly message: string) {}
}

export class GetUsdValueService extends Context.Tag("GetUsdValueService")<
  GetUsdValueService,
  (
    input: GetUsdValueInput
  ) => Effect.Effect<BigNumber, InvalidResourceAddressError | ApiError>
>() {}

const TOKEN_PRICE_SERVICE_URL = "https://token-price-service.radixdlt.com/price/historicalPrice";
const API_KEY = "SsNUTBBoJKg5tINqUKv9";

const getTokenPrice = async (resourceAddress: string, timestamp: Date): Promise<number> => {
  const response = await fetch(TOKEN_PRICE_SERVICE_URL, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tokens: [resourceAddress],
      timestamp: Math.floor(timestamp.getTime() / 1000)
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data || !data.prices || !data.prices[resourceAddress]) {
    throw new Error("Invalid response format from price service");
  }

  return data.prices[resourceAddress];
};

export const GetUsdValueLive = Layer.effect(
  GetUsdValueService,
  Effect.gen(function* () {
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

        const price = yield* Effect.tryPromise({
          try: () => getTokenPrice(input.resourceAddress, input.timestamp),
          catch: (error) => new ApiError(
            `Failed to get USD value: ${error instanceof Error ? error.message : String(error)}`
          )
        });
          
        return yield* Effect.succeed(
          new BigNumber(price).multipliedBy(input.amount)
        );
      });
    };
  })
);
