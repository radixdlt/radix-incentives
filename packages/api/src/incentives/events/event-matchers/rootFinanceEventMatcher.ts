import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";

import {
  CDPUpdatedEvent,
  type CDPUpdatedEvent as CDPUpdatedEventType,
  type CDPLiquidableEvent as CDPLiquidableEventType,
  type LendingPoolUpdatedEvent as LendingPoolUpdatedEventType,
} from "../../../common/dapps/rootFinance/schema";
import {
  parseEventData,
  type CapturedEvent,
  createEventMatcher,
} from "./createEventMatcher";
import { isRootFinanceComponent } from "../../../common/address-validation/addressValidation";

export type RootFinanceEmittableEvents =
  | { readonly type: "CDPUpdatedEvent"; data: CDPUpdatedEventType }
  | { readonly type: "CDPLiquidableEvent"; data: CDPLiquidableEventType }
  | {
      readonly type: "LendingPoolUpdatedEvent";
      data: LendingPoolUpdatedEventType;
    };

export type CapturedRootFinanceEvent =
  CapturedEvent<RootFinanceEmittableEvents>;

export const rootFinanceEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    if (
      !isRootFinanceComponent(
        input.emitter.globalEmitter,
        input.package.address
      )
    ) {
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
  },
  rootFinanceEventMatcherFn
);
