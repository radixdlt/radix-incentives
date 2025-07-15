import { Effect } from "effect";
import BigNumber from "bignumber.js";

import { GetFungibleBalanceService } from "../../gateway/getFungibleBalance";

import { CaviarNineConstants } from "./constants";
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

import type { ShapeLiquidityAsset } from "./getShapeLiquidityAssets";

export type GetCaviarnineResourcePoolPositionsOutput = {
  pool: (typeof CaviarNineConstants.simplePools)[keyof typeof CaviarNineConstants.simplePools];
  result: {
    address: string;
    items: ShapeLiquidityAsset[];
  }[];
}[];

type AccountAddress = string;

export class GetCaviarnineResourcePoolPositionsService extends Effect.Service<GetCaviarnineResourcePoolPositionsService>()(
  "GetCaviarnineResourcePoolPositionsService",
  {
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      const getResourcePoolUnitsService = yield* GetResourcePoolUnitsService;

      return {
        getCaviarnineResourcePoolPositions: Effect.fn(
          (input: {
            addresses: AccountAddress[];
            at_ledger_state: AtLedgerState;
          }) =>
            Effect.gen(function* () {
              const allPoolAddresses = Object.values(
                CaviarNineConstants.simplePools
              ).map((pool) => pool.poolAddress);

              // Get pool units for all simple pools
              const poolUnitsResults = yield* getResourcePoolUnitsService({
                addresses: allPoolAddresses,
                at_ledger_state: input.at_ledger_state,
              });

              // Create a map of pool address to pool configuration
              const poolConfigMap = new Map();
              for (const [key, pool] of Object.entries(
                CaviarNineConstants.simplePools
              )) {
                poolConfigMap.set(pool.poolAddress, { key, ...pool });
              }

              // Get fungible balances for user addresses
              const fungibleBalance = yield* getFungibleBalanceService({
                addresses: input.addresses,
                at_ledger_state: input.at_ledger_state,
              });

              const poolResults: GetCaviarnineResourcePoolPositionsOutput = [];

              for (const poolUnit of poolUnitsResults) {
                const poolConfig = poolConfigMap.get(
                  poolUnit.address
                );
                if (!poolConfig) continue;

                const addressResults: {
                  address: string;
                  items: ShapeLiquidityAsset[];
                }[] = [];

                for (const address of input.addresses) {
                  const addressBalance = fungibleBalance.find(
                    (item) => item.address === address
                  );

                  const lpBalance = addressBalance?.fungibleResources.find(
                    (resource) =>
                      resource.resourceAddress === poolUnit.lpResourceAddress
                  );

                  if (!lpBalance || new BigNumber(lpBalance.amount).eq(0)) {
                    addressResults.push({
                      address,
                      items: [],
                    });
                    continue;
                  }

                  // Calculate token amounts based on LP token amount and pool unit values
                  const lpAmount = new BigNumber(lpBalance.amount);

                  const xTokenPool = poolUnit.poolResources.find(
                    (resource) =>
                      resource.resourceAddress === poolConfig.token_x
                  );
                  const yTokenPool = poolUnit.poolResources.find(
                    (resource) =>
                      resource.resourceAddress === poolConfig.token_y
                  );

                  // poolUnitValue already represents the value per LP token, so just multiply by LP balance
                  const xTokenAmount = xTokenPool
                    ? xTokenPool.poolUnitValue.multipliedBy(lpAmount).toString()
                    : "0";
                  const yTokenAmount = yTokenPool
                    ? yTokenPool.poolUnitValue.multipliedBy(lpAmount).toString()
                    : "0";

                  const liquidityAsset: ShapeLiquidityAsset = {
                    xToken: {
                      withinPriceBounds: xTokenAmount, // For simple pools, all liquidity is "within bounds"
                      outsidePriceBounds: "0", // Simple pools don't have concentrated liquidity
                      resourceAddress: poolConfig.token_x,
                    },
                    yToken: {
                      withinPriceBounds: yTokenAmount, // For simple pools, all liquidity is "within bounds"
                      outsidePriceBounds: "0", // Simple pools don't have concentrated liquidity
                      resourceAddress: poolConfig.token_y,
                    },
                    currentPrice: "1", // Simple pools don't track exact price
                    nonFungibleId: "", // Simple pools use fungible LP tokens
                    resourceAddress: poolConfig.lpResourceAddress,
                    isActive: true, // Simple pools are always active
                  };

                  addressResults.push({
                    address,
                    items: [liquidityAsset],
                  });
                }

                poolResults.push({
                  pool: poolConfig,
                  result: addressResults,
                });
              }

              return poolResults;
            })
        ),
      };
    }),
  }
) {}

export const GetCaviarnineResourcePoolPositionsLive =
  GetCaviarnineResourcePoolPositionsService.Default;
