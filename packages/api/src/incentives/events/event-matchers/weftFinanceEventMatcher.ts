import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
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
  type FlashAddCollateralEvent,
  type FlashRemoveCollateralEvent,
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
  | { readonly type: "AddCollateralEvent"; data: AddCollateralEvent }
  | { readonly type: "BorrowEvent"; data: BorrowEvent }
  | { readonly type: "RepayEvent"; data: RepayEvent }
  | { readonly type: "RemoveCollateralEvent"; data: RemoveCollateralEvent }
  | { readonly type: "AddNFTCollateralEvent"; data: AddNFTCollateralEvent }
  | {
      readonly type: "RemoveNFTCollateralEvent";
      data: RemoveNFTCollateralEvent;
    }
  | {
      readonly type: "CDPRepayForLiquidationEvent";
      data: CDPRepayForLiquidationEvent;
    }
  | {
      readonly type: "CDPRepayForNFTLiquidationEvent";
      data: CDPRepayForNFTLiquidationEvent;
    }
  | {
      readonly type: "CDPRepayForRefinanceEvent";
      data: CDPRepayForRefinanceEvent;
    }
  | {
      readonly type: "CDPRemoveCollateralForLiquidation";
      data: CDPRemoveCollateralForLiquidation;
    }
  | { readonly type: "FlashAddCollateralEvent"; data: FlashAddCollateralEvent }
  | {
      readonly type: "FlashRemoveCollateralEvent";
      data: FlashRemoveCollateralEvent;
    }
  | { readonly type: "CDPCreationFeeEvent"; data: CDPCreationFeeEvent };

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
      case "CDPRepayForNFTLiquidationEvent":
        return yield* parseEventData(input, CDPRepayForNFTLiquidationEvent);
      case "CDPCreationFeeEvent":
        return yield* parseEventData(input, CDPCreationFeeEvent);
      case "FlashAddCollateralEvent":
      case "FlashRemoveCollateralEvent":
        return yield* Effect.succeed(null);
    }

    yield* Effect.log(
      `No match found for event: weftFinance.${input?.event.name}`
    );

    return yield* Effect.succeed(null);
  });

export const weftFinanceEventMatcher = createEventMatcher(
  {
    dApp: "WeftFinance",
    category: "Lending",
  },
  weftFinanceEventMatcherFn
);
