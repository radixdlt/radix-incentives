import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
import {
  AddLiquidityEvent,
  RemoveLiquidityEvent,
  SwapEvent,
  HLPSwapEvent,
  SimplePoolSwapEvent,
} from "../../../common/dapps/caviarnine/schemas";
import {
  parseEventData,
  type CapturedEvent,
  createEventMatcher,
} from "./createEventMatcher";
import {
  isCaviarNinePrecisionPoolComponent,
  isCaviarNineHyperstakePoolComponent,
  isCaviarNineSimplePoolComponent,
} from "../../../common/address-validation/addressValidation";

export type CaviarninePrecisionPoolSwapEvent = {
  readonly type: "SwapEvent";
  data: SwapEvent;
};

export type CaviarnineHyperstakePoolSwapEvent = {
  readonly type: "SwapEvent";
  data: HLPSwapEvent;
};

export type CaviarnineSimplePoolSwapEvent = {
  readonly type: "SwapEvent";
  data: SimplePoolSwapEvent;
};

export type CaviarnineSwapEvent =
  | CaviarninePrecisionPoolSwapEvent
  | CaviarnineHyperstakePoolSwapEvent
  | CaviarnineSimplePoolSwapEvent;

export type CaviarnineEmittableEvents =
  | { readonly type: "AddLiquidityEvent"; data: AddLiquidityEvent }
  | { readonly type: "RemoveLiquidityEvent"; data: RemoveLiquidityEvent }
  | CaviarnineSwapEvent;

export type CapturedCaviarnineEvent = CapturedEvent<CaviarnineEmittableEvents>;

export const caviarnineEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    const componentAddress = input.emitter.globalEmitter;

    // Check which type of CaviarNine pool this event is from
    const isPrecisionPool =
      isCaviarNinePrecisionPoolComponent(componentAddress);
    const isHyperstakePool =
      isCaviarNineHyperstakePoolComponent(componentAddress);
    const isSimplePool = isCaviarNineSimplePoolComponent(componentAddress);

    if (!isPrecisionPool && !isHyperstakePool && !isSimplePool) {
      return yield* Effect.succeed(null);
    }

    switch (input?.event.name) {
      case "AddLiquidityEvent":
        // Only precision pools have AddLiquidity/RemoveLiquidity events
        if (isPrecisionPool) {
          return yield* parseEventData(input, AddLiquidityEvent);
        }
        break;
      case "RemoveLiquidityEvent":
        // Only precision pools have AddLiquidity/RemoveLiquidity events
        if (isPrecisionPool) {
          return yield* parseEventData(input, RemoveLiquidityEvent);
        }
        break;
      case "SwapEvent":
        // Parse with the appropriate schema based on pool type
        if (isPrecisionPool) {
          return yield* parseEventData(input, SwapEvent);
        }
        if (isHyperstakePool) {
          return yield* parseEventData(input, HLPSwapEvent);
        }
        if (isSimplePool) {
          return yield* parseEventData(input, SimplePoolSwapEvent);
        }
        yield* Effect.log(
          `Unknown CaviarNine pool type for component: ${componentAddress}`
        );
        return yield* Effect.succeed(null);
      // ignore these events
      case "WithdrawEvent":
      case "DepositEvent":
      case "ProtocolFeeEvent":
      case "ValuationEvent":
      case "LiquidityFeeEvent":
      case "BurnLiquidityReceiptEvent":
      case "MintLiquidityReceiptEvent":
      case "SetFeeShareEvent":
      case "LiquidityChangeEvent":
      case "NewPoolEvent":
        return yield* Effect.succeed(null);
    }

    yield* Effect.log(
      `No match found for event: caviarnine.${input?.event.name}`
    );

    return yield* Effect.succeed(null);
  });

export const caviarnineEventMatcher = createEventMatcher(
  {
    dApp: "Caviarnine",
    category: "DEX",
  },
  caviarnineEventMatcherFn
);
