import { Effect } from "effect";
import type { TransformedEvent } from "../transformEvent";
import { WeftFinance } from "../../../common/dapps/weftFinance/constants";
import {
  AddCollateralEvent,
  AddNFTCollateralEvent,
  BorrowEvent,
  CDPCreationFeeEvent,
  CDPRemoveCollateralForLiquidation,
  CDPRepayForLiquidationEvent,
  CDPRepayForNFTLiquidationEvent,
  CDPRepayForRefinanceEvent,
  FlashAddCollateralEvent,
  FlashRemoveCollateralEvent,
  RemoveCollateralEvent,
  RemoveNFTCollateralEvent,
  RepayEvent,
} from "../../../common/dapps/weftFinance/schemas/lendingMarket";
import {
  parseEventData,
  type CapturedEvent,
  createEventMatcher,
} from "./createEventMatcher";

export type WeftFinanceEmittableEvents =
  | AddCollateralEvent
  | BorrowEvent
  | RepayEvent
  | RemoveCollateralEvent
  | AddNFTCollateralEvent
  | RemoveNFTCollateralEvent
  | CDPRepayForLiquidationEvent
  | CDPRepayForNFTLiquidationEvent
  | CDPRepayForRefinanceEvent
  | CDPRemoveCollateralForLiquidation
  | FlashAddCollateralEvent
  | FlashRemoveCollateralEvent
  | CDPCreationFeeEvent;

export type CapturedWeftFinanceEvent =
  CapturedEvent<WeftFinanceEmittableEvents>;

export const weftFinanceEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    const isWeftV2Event =
      input.emitter.globalEmitter === WeftFinance.v2.WeftyV2.componentAddress;

    const isExpectedPackage =
      input.package.address === WeftFinance.v2.WeftyV2.packageAddress;

    if (!isWeftV2Event || !isExpectedPackage) {
      return yield* Effect.succeed(null);
    }

    switch (input?.event.name) {
      case "AddCollateralEvent":
        return yield* parseEventData(input, AddCollateralEvent);
      case "BorrowEvent":
        return yield* parseEventData(input, BorrowEvent);
      case "RepayEvent":
        return yield* parseEventData(input, RepayEvent);
      case "RemoveCollateralEvent":
        return yield* parseEventData(input, RemoveCollateralEvent);
      case "AddNFTCollateralEvent":
        return yield* parseEventData(input, AddNFTCollateralEvent);
      case "RemoveNFTCollateralEvent":
        return yield* parseEventData(input, RemoveNFTCollateralEvent);
      case "CDPRepayForLiquidationEvent":
        return yield* parseEventData(input, CDPRepayForLiquidationEvent);
      case "CDPRepayForRefinanceEvent":
        return yield* parseEventData(input, CDPRepayForRefinanceEvent);
      case "CDPRemoveCollateralForLiquidation":
        return yield* parseEventData(input, CDPRemoveCollateralForLiquidation);
      case "FlashAddCollateralEvent":
        return yield* parseEventData(input, FlashAddCollateralEvent);
      case "FlashRemoveCollateralEvent":
        return yield* parseEventData(input, FlashRemoveCollateralEvent);
      case "CDPRepayForNFTLiquidationEvent":
        return yield* parseEventData(input, CDPRepayForNFTLiquidationEvent);
      case "CDPCreationFeeEvent":
        return yield* parseEventData(input, CDPCreationFeeEvent);
    }

    yield* Effect.log(`No match found for event: ${input?.event.name}`);

    return yield* Effect.succeed(null);
  });

export const weftFinanceEventMatcher = createEventMatcher(
  {
    dApp: "WeftFinance",
    category: "Lending",
    activityId: "lending",
  },
  weftFinanceEventMatcherFn
);
