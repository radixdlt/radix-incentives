import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
import {
  SwapEvent,
  BasicPoolSwapEvent,
  FlexPoolSwapEvent,
} from "../../../common/dapps/ociswap/schemas";
import {
  parseEventData,
  type CapturedEvent,
  createEventMatcher,
} from "./createEventMatcher";
import {
  isOciswapPrecisionPoolComponent,
  isOciswapFlexPoolComponent,
  isOciswapBasicPoolComponent,
} from "../../../common/address-validation/addressValidation";

export type OciswapPrecisionPoolSwapEvent = {
  readonly type: "SwapEvent";
  data: SwapEvent;
};

export type OciswapFlexPoolSwapEvent = {
  readonly type: "SwapEvent";
  data: FlexPoolSwapEvent;
};

export type OciswapBasicPoolSwapEvent = {
  readonly type: "SwapEvent";
  data: BasicPoolSwapEvent;
};

export type OciswapSwapEvent =
  | OciswapPrecisionPoolSwapEvent
  | OciswapFlexPoolSwapEvent
  | OciswapBasicPoolSwapEvent;

export type OciswapEmittableEvents = OciswapSwapEvent;

export type CapturedOciswapEvent = CapturedEvent<OciswapEmittableEvents>;

export const ociswapEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    const componentAddress = input.emitter.globalEmitter;

    // Check which type of Ociswap pool this event is from
    const isPrecisionPool = isOciswapPrecisionPoolComponent(componentAddress);
    const isFlexPool = isOciswapFlexPoolComponent(componentAddress);
    const isBasicPool = isOciswapBasicPoolComponent(componentAddress);

    if (!isPrecisionPool && !isFlexPool && !isBasicPool) {
      return yield* Effect.succeed(null);
    }

    switch (input?.event.name) {
      case "SwapEvent":
        // Parse with the appropriate schema based on pool type
        if (isPrecisionPool) {
          return yield* parseEventData(input, SwapEvent);
        }
        if (isFlexPool) {
          return yield* parseEventData(input, FlexPoolSwapEvent);
        }
        if (isBasicPool) {
          return yield* parseEventData(input, BasicPoolSwapEvent);
        }
        yield* Effect.log(
          `Unknown Ociswap pool type for component: ${componentAddress}`
        );
        return yield* Effect.succeed(null);
      case "ClaimFeesEvent":
      case "FlashLoanEvent":
      case "InstantiateEvent":
      case "AddLiquidityEvent":
      case "RemoveLiquidityEvent":
        return yield* Effect.succeed(null);
    }

    yield* Effect.log(`No match found for event: ociswap.${input?.event.name}`);

    return yield* Effect.succeed(null);
  });

export const ociswapEventMatcher = createEventMatcher(
  {
    dApp: "Ociswap",
    category: "DEX",
  },
  ociswapEventMatcherFn
);
