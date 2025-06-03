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

export class GetUsdValueService extends Context.Tag("GetUsdValueService")<
  GetUsdValueService,
  (
    input: GetUsdValueInput
  ) => Effect.Effect<BigNumber, InvalidResourceAddressError>
>() {}

export const GetUsdValueLive = Layer.effect(
  GetUsdValueService,
  Effect.gen(function* () {
    return (input) => {
      return Effect.gen(function* () {
        const isXUSDC = Assets.Fungible.xUSDC === input.resourceAddress;
        const isXRD = Assets.Fungible.XRD === input.resourceAddress;

        if (isXUSDC) {
          return yield* Effect.succeed(
            new BigNumber(1).multipliedBy(input.amount)
          );
        }

        if (isXRD) {
          return yield* Effect.succeed(
            new BigNumber("0.01").multipliedBy(input.amount)
          );
        }

        return yield* Effect.fail(
          new InvalidResourceAddressError(
            `Invalid resource address: ${input.resourceAddress}`
          )
        );
      });
    };
  })
);
