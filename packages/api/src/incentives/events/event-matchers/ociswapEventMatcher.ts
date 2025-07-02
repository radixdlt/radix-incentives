import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
import { SwapEvent } from "../../../common/dapps/ociswap/schemas";
import {
  parseEventData,
  type CapturedEvent,
  createEventMatcher,
} from "./createEventMatcher";
import { isOciswapPoolComponent } from "../../../common/address-validation/addressValidation";

export type OciswapSwapEvent = {
  readonly type: "SwapEvent";
  data: SwapEvent;
};

export type OciswapEmittableEvents = OciswapSwapEvent;

export type CapturedOciswapEvent = CapturedEvent<OciswapEmittableEvents>;

export const ociswapEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    if (!isOciswapPoolComponent(input.emitter.globalEmitter))
      return yield* Effect.succeed(null);

    switch (input?.event.name) {
      case "SwapEvent":
        return yield* parseEventData(input, SwapEvent);
      case "ClaimFeesEvent":
      case "FlashLoanEvent":
      case "InstantiateEvent":
      case "AddLiquidityEvent":
      case "RemoveLiquidityEvent":
        return yield* Effect.succeed(null);
    }

    yield* Effect.log(
      `No match found for event: ociswap.${input?.event.name}`
    );

    return yield* Effect.succeed(null);
  });

export const ociswapEventMatcher = createEventMatcher(
  {
    dApp: "Ociswap",
    category: "DEX",
  },
  ociswapEventMatcherFn
);