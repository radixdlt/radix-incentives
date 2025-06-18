import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
import { RootFinance } from "../../../common/dapps/rootFinance/constants";
import { 
  CDPUpdatedEvent, 
  CDPLiquidableEvent,
  LendingPoolUpdatedEvent,
  type CDPUpdatedEvent as CDPUpdatedEventType,
  type CDPLiquidableEvent as CDPLiquidableEventType,
  type LendingPoolUpdatedEvent as LendingPoolUpdatedEventType 
} from "../../../common/dapps/rootFinance/schema";
import {
  parseEventData,
  type CapturedEvent,
  createEventMatcher,
} from "./createEventMatcher";

export type RootFinanceEmittableEvents =
  | { readonly type: "CDPUpdatedEvent"; data: CDPUpdatedEventType }
  | { readonly type: "CDPLiquidableEvent"; data: CDPLiquidableEventType }
  | { readonly type: "LendingPoolUpdatedEvent"; data: LendingPoolUpdatedEventType };

export type CapturedRootFinanceEvent = CapturedEvent<RootFinanceEmittableEvents>;

export const rootFinanceEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    const isRootFinanceEvent =
      input.emitter.globalEmitter === RootFinance.componentAddress;

    const isExpectedPackage =
      input.package.address === RootFinance.packageAddress;

    if (!isRootFinanceEvent || !isExpectedPackage) {
      return yield* Effect.succeed(null);
    }

    switch (input?.event.name) {
      case "CDPUpdatedEvent":
        return yield* parseEventData(input, CDPUpdatedEvent);
      case "CDPLiquidableEvent":
      case "LendingPoolUpdatedEvent":
        return yield* Effect.succeed(null);
    }

    yield* Effect.log(
      `No match found for event: rootFinance.${input?.event.name}`
    );

    return yield* Effect.succeed(null);
  });

export const rootFinanceEventMatcher = createEventMatcher(
  {
    dApp: "RootFinance",
    category: "Lending",
    activityId: "lending",
  },
  rootFinanceEventMatcherFn
);