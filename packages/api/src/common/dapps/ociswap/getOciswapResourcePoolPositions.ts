import { Effect } from "effect";
import BigNumber from "bignumber.js";

import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from "../../gateway/getFungibleBalance";

import { OciswapConstants } from "./constants";
import type { AtLedgerState } from "../../gateway/schemas";

import { GetResourcePoolUnitsService } from "../../resource-pool/getResourcePoolUnits";

export class InvalidResourcePoolError extends Error {
  readonly _tag = "InvalidResourcePoolError";
  constructor(error: unknown) {
    super(
      `Invalid resource pool error: ${error instanceof Error ? error.message : error}`
    );
  }
}

export type OciswapResourcePoolLiquidityAsset = {
  xToken: {
    totalAmount: string;
    amountInBounds: string;
    resourceAddress: string;
  };
  yToken: {
    totalAmount: string;
    amountInBounds: string;
    resourceAddress: string;
  };
};

export type GetOciswapResourcePoolPositionsOutput = {
  pool:
    | (typeof OciswapConstants.flexPools)[keyof typeof OciswapConstants.flexPools]
    | (typeof OciswapConstants.basicPools)[keyof typeof OciswapConstants.basicPools];
  result: {
    address: string;
    items: OciswapResourcePoolLiquidityAsset[];
  }[];
}[];

type AccountAddress = string;

export class GetOciswapResourcePoolPositionsService extends Effect.Service<GetOciswapResourcePoolPositionsService>()(
  "GetOciswapResourcePoolPositionsService",
  {
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      const getResourcePoolUnitsService = yield* GetResourcePoolUnitsService;

      return {
        run: (input: {
          accountAddresses: string[];
          at_ledger_state: AtLedgerState;
          fungibleBalance?: GetFungibleBalanceOutput;
          poolType?: "flexPools" | "basicPools";
        }) =>
          Effect.gen(function* () {
            const accountBalancesMap = new Map<
              AccountAddress,
              OciswapResourcePoolLiquidityAsset[]
            >();

            // Get pools based on pool type (if not specified, use both)
            const poolTypes = input.poolType
              ? [input.poolType]
              : ["flexPools" as const, "basicPools" as const];

            // Initialize map for all account addresses
            for (const address of input.accountAddresses) {
              accountBalancesMap.set(address, []);
            }

            // Get fungible balances if not provided (only need to do this once)
            const fungibleBalance =
              input.fungibleBalance ??
              (yield* getFungibleBalanceService({
                addresses: input.accountAddresses,
                at_ledger_state: input.at_ledger_state,
              }));

            const allPoolOutputResults = [];

            // Process each pool type
            for (const poolType of poolTypes) {
              const pools =
                poolType === "flexPools"
                  ? OciswapConstants.flexPools
                  : OciswapConstants.basicPools;

              const allPoolAddresses = Object.values(pools).map(
                (pool) => pool.poolAddress
              );

              // Get pool units for all pools of this type
              const poolUnitsResults = yield* getResourcePoolUnitsService({
                addresses: allPoolAddresses,
                at_ledger_state: input.at_ledger_state,
              });

              // Create a map of pool address to pool configuration
              const poolConfigMap = new Map();
              for (const [key, pool] of Object.entries(pools)) {
                poolConfigMap.set(pool.poolAddress, { key, ...pool });
              }

              // Process each pool result for this pool type
              for (const poolResult of poolUnitsResults) {
                const poolConfig = poolConfigMap.get(poolResult.address);
                if (!poolConfig) continue;

                try {
                  // Process each account's LP tokens for this pool
                  for (const address of input.accountAddresses) {
                    const accountLpBalance = fungibleBalance
                      .find((balance) => balance.address === address)
                      ?.fungibleResources.find(
                        (item) =>
                          item.resourceAddress === poolConfig.lpResourceAddress
                      );

                    if (
                      !accountLpBalance ||
                      new BigNumber(accountLpBalance.amount).lte(0)
                    ) {
                      continue;
                    }

                    // Calculate user's amounts for each token in the pool
                    const lpBalance = new BigNumber(accountLpBalance.amount);
                    const contributedAmounts = poolResult.poolResources;
                    if (contributedAmounts.length !== 2) {
                      return yield* Effect.fail(
                        new InvalidResourcePoolError(
                          `Pool must have exactly 2 tokens, found ${contributedAmounts.length}`
                        )
                      );
                    }
                    const [token1, token2] = contributedAmounts as [
                      (typeof contributedAmounts)[0],
                      (typeof contributedAmounts)[1],
                    ];

                    // poolUnitValue already represents the value per LP token, so just multiply by LP balance
                    const token1Amount =
                      token1.poolUnitValue.multipliedBy(lpBalance);
                    const token2Amount =
                      token2.poolUnitValue.multipliedBy(lpBalance);

                    // Create OciswapLiquidityAsset format (liquidity is always within range for pool units)
                    const liquidityAsset: OciswapResourcePoolLiquidityAsset = {
                      xToken: {
                        totalAmount: token1Amount.toString(),
                        amountInBounds: token1Amount.toString(), // Pool units are always "in bounds"
                        resourceAddress: token1.resourceAddress,
                      },
                      yToken: {
                        totalAmount: token2Amount.toString(),
                        amountInBounds: token2Amount.toString(), // Pool units are always "in bounds"
                        resourceAddress: token2.resourceAddress,
                      },
                    };

                    // Add to user's positions
                    const accountPositions =
                      accountBalancesMap.get(address) ?? [];
                    accountPositions.push(liquidityAsset);
                    accountBalancesMap.set(address, accountPositions);
                  }
                } catch (error) {
                  return yield* Effect.fail(
                    new InvalidResourcePoolError(error)
                  );
                }
              }

              // Convert map to output format grouped by pool (similar to regular Ociswap)
              for (const [_key, pool] of Object.entries(pools)) {
                const poolAccountResults = input.accountAddresses.map(
                  (address) => {
                    const accountPositions =
                      accountBalancesMap.get(address) ?? [];
                    // Filter positions for this specific pool
                    const poolSpecificPositions = accountPositions.filter(
                      (item) =>
                        (item.xToken.resourceAddress === pool.token_x &&
                          item.yToken.resourceAddress === pool.token_y) ||
                        (item.xToken.resourceAddress === pool.token_y &&
                          item.yToken.resourceAddress === pool.token_x)
                    );
                    return {
                      address,
                      items: poolSpecificPositions,
                    };
                  }
                );

                allPoolOutputResults.push({
                  pool,
                  result: poolAccountResults,
                });
              }
            }

            return allPoolOutputResults;
          }),
      };
    }),
  }
) {}

export const GetOciswapResourcePoolPositionsLive =
  GetOciswapResourcePoolPositionsService.Default;
