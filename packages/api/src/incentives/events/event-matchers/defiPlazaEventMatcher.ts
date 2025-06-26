import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
import {
  AddLiquidityEvent,
  RemoveLiquidityEvent,
  SwapEvent,
} from "../../../common/dapps/defiplaza/schemas";
import {
  parseEventData,
  type CapturedEvent,
  createEventMatcher,
} from "./createEventMatcher";
import { DefiPlaza } from "../../../common/dapps/defiplaza/constants";

export type DefiPlazaSwapEvent = {
  readonly type: "SwapEvent";
  data: SwapEvent;
};

export type DefiPlazaEmittableEvents =
  | { readonly type: "AddLiquidityEvent"; data: AddLiquidityEvent }
  | { readonly type: "RemoveLiquidityEvent"; data: RemoveLiquidityEvent }
  | DefiPlazaSwapEvent;

export type CapturedDefiPlazaEvent = CapturedEvent<DefiPlazaEmittableEvents>;

const isWhiteListedComponent = (componentAddress: string) =>
  ([DefiPlaza.xUSDCPool.componentAddress] as string[]).includes(
    componentAddress
  );

export const defiPlazaEventMatcherFn = (input: TransformedEvent) =>
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
    }

    yield* Effect.log(
      `No match found for event: defiplaza.${input?.event.name}`
    );

    return yield* Effect.succeed(null);
  });

export const defiPlazaEventMatcher = createEventMatcher(
  {
    dApp: "DefiPlaza",
    category: "DEX",
  },
  defiPlazaEventMatcherFn
);
