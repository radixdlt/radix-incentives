import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
import { CaviarNineConstants } from "../../../common/dapps/caviarnine/constants";
import {
  AddLiquidityEvent,
  RemoveLiquidityEvent,
  SwapEvent,
} from "../../../common/dapps/caviarnine/schemas";
import {
  parseEventData,
  type CapturedEvent,
  createEventMatcher,
} from "./createEventMatcher";

export type CaviarnineSwapEvent = {
  readonly type: "SwapEvent";
  data: SwapEvent;
};

export type CaviarnineEmittableEvents =
  | { readonly type: "AddLiquidityEvent"; data: AddLiquidityEvent }
  | { readonly type: "RemoveLiquidityEvent"; data: RemoveLiquidityEvent }
  | {
      readonly type: "SwapEvent";
      data: SwapEvent;
    };

export type CapturedCaviarnineEvent = CapturedEvent<CaviarnineEmittableEvents>;

const isWhiteListedComponent = (componentAddress: string) =>
  (
    Object.values(CaviarNineConstants.shapeLiquidityPools).map(
      (pool) => pool.componentAddress
    ) as string[]
  ).includes(componentAddress);

export const caviarnineEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    if (!isWhiteListedComponent(input.emitter.globalEmitter))
      return yield* Effect.succeed(null);

    switch (input?.event.name) {
      case "AddLiquidityEvent":
        return yield* parseEventData(input, AddLiquidityEvent);
      case "RemoveLiquidityEvent":
        return yield* parseEventData(input, RemoveLiquidityEvent);
      case "SwapEvent":
        return yield* parseEventData(input, SwapEvent);
      // ignore these events
      case "WithdrawEvent":
      case "DepositEvent":
      case "ProtocolFeeEvent":
      case "ValuationEvent":
      case "LiquidityFeeEvent":
      case "BurnLiquidityReceiptEvent":
      case "MintLiquidityReceiptEvent":
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
