import { Context, Effect, Layer } from "effect";
import { BigNumber } from "bignumber.js";

export type GetUsdValueInput = {
  amount: BigNumber;
  resourceAddress: string;
  timestamp: Date;
};

export class GetUsdValueService extends Context.Tag("GetUsdValueService")<
  GetUsdValueService,
  (input: GetUsdValueInput) => Effect.Effect<BigNumber>
>() {}

export const GetUsdValueLive = Layer.effect(
  GetUsdValueService,
  Effect.gen(function* () {
    return (input) => Effect.succeed(new BigNumber(0));
  })
);
