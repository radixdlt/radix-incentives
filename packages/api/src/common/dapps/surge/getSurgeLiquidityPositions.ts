import { Effect } from "effect";

import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from "../../gateway/getFungibleBalance";

import { BigNumber } from "bignumber.js";
import { GetComponentStateService } from "../../gateway/getComponentState";
import { MarginPool } from "./schemas";
import { DappConstants, Assets } from "data";
import type { AtLedgerState } from "../../gateway/schemas";

const SurgeConstants = DappConstants.Surge.constants;

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
        getSurgeLiquidityPositions: Effect.fn(
          (input: {
            accountAddresses: string[];
            at_ledger_state: AtLedgerState;
            fungibleBalance?: GetFungibleBalanceOutput;
          }) =>
            Effect.gen(function* () {
              const accountBalances = input.fungibleBalance
                ? input.fungibleBalance
                : yield* getFungibleBalanceService({
                    addresses: input.accountAddresses,
                    at_ledger_state: input.at_ledger_state,
                  });

              // Get margin pool component state
              const [marginPoolComponentState] =
                yield* getComponentStateService.run({
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
                (result) =>
                  result.address === SurgeConstants.slp.resourceAddress
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
              const sUsdBalance =
                marginPoolBalanceResult.fungibleResources.find(
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

              const accountSlpBalanceMap = new Map<string, BigNumber>();
              for (const accountBalance of accountBalances) {
                const slpBalance = accountBalance.fungibleResources.find(
                  (item) =>
                    item.resourceAddress === SurgeConstants.slp.resourceAddress
                );
                accountSlpBalanceMap.set(
                  accountBalance.address,
                  slpBalance?.amount || new BigNumber(0)
                );
              }

              return yield* Effect.forEach(
                input.accountAddresses,
                (address: string) => {
                  const slpAmount =
                    accountSlpBalanceMap.get(address) || new BigNumber(0);
                  const liquidityValueXUsdc =
                    slpAmount.multipliedBy(slpValueXUsdc);
                  return Effect.succeed({
                    address,
                    liquidityPosition: {
                      resourceAddress: Assets.Fungible.xUSDC,
                      amount: liquidityValueXUsdc,
                    },
                  });
                }
              );
            })
        ),
      };
    }),
  }
) {}

export const GetSurgeLiquidityPositionsLive =
  GetSurgeLiquidityPositionsService.Default;
