import { Effect } from "effect";
import type { TransformedEvent } from "../../transaction-stream/transformEvent";
import { CaviarNineConstants } from "../../../common/dapps/caviarnine/constants";
import { type CapturedEvent, createEventMatcher } from "./createEventMatcher";

import { parseWithdrawEvent } from "./parseWithdrawEvent";
import { parseDepositEvent } from "./parseDepositEvent";
import { WeftFinance } from "../../../common/dapps/weftFinance/constants";
import { Assets } from "../../../common/assets/constants";
import { RootFinance } from "../../../common/dapps/rootFinance/constants";
import { DefiPlaza } from "../../../common/dapps/defiplaza/constants";

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

const isWhiteListedResourceAddress = (resourceAddress: string) =>
  (
    [
      CaviarNineConstants.shapeLiquidityPools.XRD_xUSDC.liquidity_receipt,
      WeftFinance.v2.w2xUSDC.resourceAddress,
      WeftFinance.v2.w2XRD.resourceAddress,
      Assets.Fungible.XRD,
      CaviarNineConstants.LSULP.resourceAddress,
      RootFinance.receiptResourceAddress,
      DefiPlaza.xUSDCPool.lpResourceAddress,
    ] as string[]
  ).includes(resourceAddress);

export const withdrawDepositEventMatcherFn = (input: TransformedEvent) =>
  Effect.gen(function* () {
    const withdrawNonFungibleEventResult = parseWithdrawEvent(input, {
      isWhiteListedResourceAddress,
    });

    if (withdrawNonFungibleEventResult)
      return yield* Effect.succeed(withdrawNonFungibleEventResult);

    const depositEventResult = parseDepositEvent(input, {
      isWhiteListedResourceAddress,
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
