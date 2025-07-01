import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
import { type CapturedEvent, createEventMatcher } from "./createEventMatcher";

import { parseWithdrawEvent } from "./parseWithdrawEvent";
import { parseDepositEvent } from "./parseDepositEvent";
import { isValidResourceAddress } from "../../../common/address-validation/addressValidation";

export type CommonEmittableEvents =
  | {
      readonly type: "WithdrawNonFungibleEvent";
      data: {
        resourceAddress: string;
        nftIds: string[];
        accountAddress: string;
      };
    }
  | {
      readonly type: "DepositNonFungibleEvent";
      data: {
        resourceAddress: string;
        nftIds: string[];
        accountAddress: string;
      };
    }
  | {
      readonly type: "WithdrawFungibleEvent";
      data: {
        resourceAddress: string;
        amount: string;
        accountAddress: string;
      };
    }
  | {
      readonly type: "DepositFungibleEvent";
      data: {
        resourceAddress: string;
        amount: string;
        accountAddress: string;
      };
    };

export type CapturedCommonEvent = CapturedEvent<CommonEmittableEvents>;

export const withdrawDepositEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    const withdrawNonFungibleEventResult = parseWithdrawEvent(input, {
      isWhiteListedResourceAddress: isValidResourceAddress,
    });

    if (withdrawNonFungibleEventResult)
      return yield* Effect.succeed(withdrawNonFungibleEventResult);

    const depositEventResult = parseDepositEvent(input, {
      isWhiteListedResourceAddress: isValidResourceAddress,
    });

    if (depositEventResult) return yield* Effect.succeed(depositEventResult);

    return yield* Effect.succeed(null);
  });

export const commonEventMatcher = createEventMatcher(
  {
    dApp: "Common",
    category: "none",
  },
  withdrawDepositEventMatcherFn
);
