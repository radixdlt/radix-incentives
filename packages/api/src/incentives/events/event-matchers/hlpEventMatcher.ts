import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
import { HLPSwapEvent } from "../../../common/dapps/caviarnine/schemas";
import {
  parseEventData,
  type CapturedEvent,
  createEventMatcher,
} from "./createEventMatcher";
import { isHlpPoolComponent } from "../../../common/address-validation/addressValidation";

export type HLPEmittableEvents = {
  readonly type: "SwapEvent";
  data: HLPSwapEvent;
};

export type CapturedHLPEvent = CapturedEvent<HLPEmittableEvents>;

export const hlpEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    // Use HLP-specific validation
    if (!isHlpPoolComponent(input.emitter.globalEmitter)) {
      return yield* Effect.succeed(null);
    }

    switch (input?.event.name) {
      case "SwapEvent":
        return yield* parseEventData(input, HLPSwapEvent);
      // ignore these events
      case "SetFeeShareEvent":
      case "LiquidityChangeEvent": // No need to do anything, handled by deposit/withdraw events
      case "NewPoolEvent":
      case "ProtocolFeeEvent":
      case "LiquidityFeeEvent":
        return yield* Effect.succeed(null);
    }

    yield* Effect.log(`HLP Unknown Event: ${input?.event.name}`);

    return yield* Effect.succeed(null);
  });

export const hlpEventMatcher = createEventMatcher(
  {
    dApp: "HLP",
    category: "DEX",
  },
  hlpEventMatcherFn
);
