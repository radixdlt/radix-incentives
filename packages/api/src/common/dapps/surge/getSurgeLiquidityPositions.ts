import { Effect } from "effect";

import type { GetFungibleBalanceServiceError } from "../../gateway/getFungibleBalance";

import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from "../../gateway/getFungibleBalance";

import { BigNumber } from "bignumber.js";
import {
  GetComponentStateService,
  type InvalidComponentStateError,
} from "../../gateway/getComponentState";
import { MarginPool } from "./schemas";
import { SurgeConstants } from "./constants";
import { Assets } from "../../assets/constants";
import type { GetEntityDetailsError } from "../../gateway/getEntityDetails";
import type { AtLedgerState } from "../../gateway/schemas";

export class FailedToParseMarginPoolSchemaError {
  readonly _tag = "FailedToParseMarginPoolSchemaError";
  constructor(readonly marginPool: unknown) {}
}

export class SlpNotFoundError {
  readonly _tag = "SlpNotFoundError";
  constructor(readonly error: unknown) {}
}

type AssetBalance = {
  resourceAddress: string;
  amount: BigNumber;
};

export type GetSurgeLiquidityPositionsOutput = {
  address: string;
  liquidityPosition: AssetBalance;
}[];

export class GetSurgeLiquidityPositionsService extends Effect.Service<GetSurgeLiquidityPositionsService>()(
  "GetSurgeLiquidityPositionsService",
  {
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      const getComponentStateService = yield* GetComponentStateService;

      return {
        getSurgeLiquidityPositions: (input: {
          accountAddresses: string[];
          at_ledger_state: AtLedgerState;
          fungibleBalance?: GetFungibleBalanceOutput;
        }): Effect.Effect<
          GetSurgeLiquidityPositionsOutput,
          | GetEntityDetailsError
          | GetFungibleBalanceServiceError
          | InvalidComponentStateError
          | FailedToParseMarginPoolSchemaError
          | SlpNotFoundError
        > =>
          Effect.gen(function* () {
            const accountBalances = input.fungibleBalance
              ? input.fungibleBalance
              : yield* getFungibleBalanceService({
                  addresses: input.accountAddresses,
                  at_ledger_state: input.at_ledger_state,
                });

            // Get margin pool component state
            const [marginPoolComponentState] = yield* getComponentStateService({
              addresses: [SurgeConstants.marginPool.componentAddress],
              schema: MarginPool,
              at_ledger_state: input.at_ledger_state,
            });

            if (!marginPoolComponentState) {
              return yield* Effect.fail(
                new SlpNotFoundError(
                  "Margin pool component not found at state version"
                )
              );
            }

            // Get SLP total supply and sUSD balance of margin pool
            const balanceAddresses = [
              SurgeConstants.slp.resourceAddress, // For total supply
              SurgeConstants.marginPool.componentAddress, // For sUSD balance
            ];

            const balanceResults = yield* getFungibleBalanceService({
              addresses: balanceAddresses,
              at_ledger_state: input.at_ledger_state,
            });

            const slpResourceResult = balanceResults.find(
              (result) => result.address === SurgeConstants.slp.resourceAddress
            );

            const marginPoolBalanceResult = balanceResults.find(
              (result) =>
                result.address === SurgeConstants.marginPool.componentAddress
            );

            if (
              !slpResourceResult?.details ||
              slpResourceResult.details.type !== "FungibleResource"
            ) {
              return yield* Effect.fail(
                new SlpNotFoundError("SLP resource not found or invalid type")
              );
            }

            if (
              !marginPoolBalanceResult?.details ||
              marginPoolBalanceResult.details.type !== "Component"
            ) {
              return yield* Effect.fail(
                new SlpNotFoundError(
                  "Margin pool component not found or invalid type"
                )
              );
            }

            // Get SLP total supply
            const slpTotalSupply = new BigNumber(
              slpResourceResult.details.total_supply
            );

            // Get sUSD balance held by margin pool component
            const sUsdBalance = marginPoolBalanceResult.fungibleResources.find(
              (item) =>
                item.resourceAddress === SurgeConstants.sUSD.resourceAddress
            );

            const sUsdAmount = sUsdBalance?.amount || new BigNumber(0);

            // Calculate pool value in xUSDC
            const poolValueXUsdc = sUsdAmount
              .plus(
                new BigNumber(marginPoolComponentState.state.virtual_balance)
              )
              .plus(
                new BigNumber(
                  marginPoolComponentState.state.unrealized_pool_funding
                )
              )
              .plus(new BigNumber(marginPoolComponentState.state.pnl_snap));

            // Calculate xUSDC value of 1 SLP
            const slpValueXUsdc = slpTotalSupply.isZero()
              ? new BigNumber(0)
              : poolValueXUsdc.dividedBy(slpTotalSupply);

            // Process each account
            const results: GetSurgeLiquidityPositionsOutput = [];

            for (const accountBalance of accountBalances) {
              if (input.accountAddresses.includes(accountBalance.address)) {
                const slpBalance = accountBalance.fungibleResources.find(
                  (item) =>
                    item.resourceAddress === SurgeConstants.slp.resourceAddress
                );

                const slpAmount = slpBalance?.amount || new BigNumber(0);
                const liquidityValueXUsdc =
                  slpAmount.multipliedBy(slpValueXUsdc);

                results.push({
                  address: accountBalance.address,
                  liquidityPosition: {
                    resourceAddress: Assets.Fungible.xUSDC,
                    amount: liquidityValueXUsdc,
                  },
                });
              }
            }

            return results;
          }),
      };
    }),
  }
) {}

export const GetSurgeLiquidityPositionsLive =
  GetSurgeLiquidityPositionsService.Default;
