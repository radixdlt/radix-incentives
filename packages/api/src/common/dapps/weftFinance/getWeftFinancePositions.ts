import { Context, Effect, Layer } from "effect";

import type { EntityNotFoundError, GatewayError } from "../../gateway/errors";
import {
  GetNonFungibleBalanceService,
  type InvalidInputError,
} from "../../gateway/getNonFungibleBalance";

import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from "../../gateway/getFungibleBalance";

import { BigNumber } from "bignumber.js";
import {
  GetComponentStateService,
  type InvalidComponentStateError,
} from "../../gateway/getComponentState";
import { LendingPoolSchema, SingleResourcePool, CDPData } from "./schemas";
import { GetKeyValueStoreService } from "../../gateway/getKeyValueStore";

import { WeftFinance, weftFungibleRecourceAddresses } from "./constants";
import { Assets } from "../../assets/constants";
import { CaviarNineConstants } from "../caviarnine/constants";
import type { GetEntityDetailsError } from "../../gateway/getEntityDetails";
import type { AtLedgerState } from "../../gateway/schemas";

export class FailedToParseLendingPoolSchemaError {
  readonly _tag = "FailedToParseLendingPoolSchemaError";
  constructor(readonly lendingPool: unknown) {}
}

export class FailedToParseCDPDataError {
  readonly _tag = "FailedToParseCDPDataError";
  constructor(
    readonly nftId: string,
    readonly cdpData: unknown
  ) {}
}

type AssetBalance = {
  resourceAddress: ResourceAddress;
  amount: BigNumber;
};

type WeftLendingPosition = {
  unitToAssetRatio: BigNumber;
  wrappedAsset: AssetBalance;
  unwrappedAsset: AssetBalance;
};

export type GetWeftFinancePositionsOutput = {
  address: string;
  lending: WeftLendingPosition[];
  collateral: AssetBalance[];
};

export class GetWeftFinancePositionsService extends Context.Tag(
  "GetWeftFinancePositionsService"
)<
  GetWeftFinancePositionsService,
  (input: {
    accountAddresses: string[];
    at_ledger_state: AtLedgerState;
    fungibleBalance?: GetFungibleBalanceOutput;
  }) => Effect.Effect<
    GetWeftFinancePositionsOutput[],
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | InvalidComponentStateError
    | FailedToParseLendingPoolSchemaError
    | FailedToParseCDPDataError
  >
>() {}

type AccountAddress = string;
type ResourceAddress = string;

export const GetWeftFinancePositionsLive = Layer.effect(
  GetWeftFinancePositionsService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;
    const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
    const getComponentStateService = yield* GetComponentStateService;
    const getKeyValueStoreService = yield* GetKeyValueStoreService;

    return (input) =>
      Effect.gen(function* () {
        const accountBalancesMap = new Map<
          AccountAddress,
          { lending: WeftLendingPosition[]; collateral: AssetBalance[] }
        >();

        for (const accountAddress of input.accountAddresses) {
          accountBalancesMap.set(accountAddress, {
            lending: [],
            collateral: [],
          });
        }

        // WEFT V2 Lending pool KVS contains the unit to asset ratio for each asset
        const lendingPoolV2KeyValueStore = yield* getKeyValueStoreService({
          address: WeftFinance.v2.lendingPool.kvsAddress,
          at_ledger_state: input.at_ledger_state,
        }).pipe(
          Effect.catchTags({
            // EntityNotFoundError here means that the v2 lending pool is not deployed at the provided state version
            EntityNotFoundError: () =>
              Effect.succeed({
                entries: [],
              }),
          })
        );

        const poolToUnitToAssetRatio = new Map<ResourceAddress, BigNumber>();

        for (const item of lendingPoolV2KeyValueStore.entries) {
          const lendingPool = LendingPoolSchema.safeParse(
            item.value.programmatic_json
          );

          if (lendingPool.isOk()) {
            poolToUnitToAssetRatio.set(
              lendingPool.value.deposit_unit_res_address,
              new BigNumber(lendingPool.value.deposit_state.unit_ratio)
            );
          } else {
            yield* Effect.fail(
              new FailedToParseLendingPoolSchemaError(lendingPool.error)
            );
          }
        }

        // WEFT V1 Lending pool component states contains the unit to asset ratio for each asset
        const lendingPoolV1ComponentStates = yield* getComponentStateService({
          addresses: [
            WeftFinance.v1.wLSULP.componentAddress,
            WeftFinance.v1.wXRD.componentAddress,
            WeftFinance.v1.wxUSDC.componentAddress,
          ],
          schema: SingleResourcePool,
          at_ledger_state: input.at_ledger_state,
        });

        for (const item of lendingPoolV1ComponentStates) {
          poolToUnitToAssetRatio.set(
            item.state.pool_unit_res_manager,
            new BigNumber(item.state.unit_to_asset_ratio)
          );
        }

        const accountBalances = input.fungibleBalance
          ? input.fungibleBalance
          : yield* getFungibleBalanceService({
              addresses: input.accountAddresses,
              at_ledger_state: input.at_ledger_state,
            });

        for (const accountBalance of accountBalances) {
          const fungibleResources = accountBalance.fungibleResources;
          const weftFungibleResources = fungibleResources.filter((item) =>
            weftFungibleRecourceAddresses.has(item.resourceAddress)
          );
          const accountAddress = accountBalance.address;

          for (const { resourceAddress, amount } of weftFungibleResources) {
            const unitToAssetRatio =
              poolToUnitToAssetRatio.get(resourceAddress);

            if (unitToAssetRatio) {
              const accountData = accountBalancesMap.get(accountAddress) ?? {
                lending: [],
                collateral: [],
              };

              const unwrappedAssetAddress = weftFungibleRecourceAddresses.get(resourceAddress);
              if (unwrappedAssetAddress) {
                accountData.lending.push({
                  unitToAssetRatio,
                  wrappedAsset: {
                    resourceAddress,
                    amount,
                  },
                  unwrappedAsset: {
                    resourceAddress: unwrappedAssetAddress,
                    amount: amount.div(unitToAssetRatio),
                  },
                });

                accountBalancesMap.set(accountAddress, accountData);
              }
            }
          }
        }

        // Process WeftyV2 NFTs to get collateral assets

        const weftyV2NonFungibleBalances = yield* getNonFungibleBalanceService({
          addresses: input.accountAddresses,
          at_ledger_state: input.at_ledger_state,
          resourceAddresses: [WeftFinance.v2.WeftyV2.resourceAddress],
        });

        for (const accountNFTBalance of weftyV2NonFungibleBalances.items) {
          const accountAddress = accountNFTBalance.address;
          const accountData = accountBalancesMap.get(accountAddress) ?? {
            lending: [],
            collateral: [],
          };

          for (const nftResource of accountNFTBalance.nonFungibleResources) {
            if (
              nftResource.resourceAddress ===
              WeftFinance.v2.WeftyV2.resourceAddress
            ) {
              for (const nftItem of nftResource.items) {
                if (nftItem.isBurned || !nftItem.sbor) continue;

                // Use safeParse with the CDPData schema
                const parseResult = CDPData.safeParse(nftItem.sbor);
                
                if (parseResult.isOk()) {
                  const cdpData = parseResult.value;

                  // Process collaterals using the parsed Map
                  for (const [resourceAddress, collateralInfo] of cdpData.collaterals.entries()) {
                    const amount = new BigNumber(collateralInfo.amount);

                    // Check if this is a w2 asset (lending position)
                    if (weftFungibleRecourceAddresses.has(resourceAddress)) {
                      const unitToAssetRatio = poolToUnitToAssetRatio.get(resourceAddress);
                      if (unitToAssetRatio) {
                        const unwrappedAssetAddress = weftFungibleRecourceAddresses.get(resourceAddress);
                        if (unwrappedAssetAddress) {
                          const unwrappedAmount = amount.div(unitToAssetRatio);
                          
                          // Find or create lending position
                          const existingIndex = accountData.lending.findIndex(
                            lending => lending.wrappedAsset.resourceAddress === resourceAddress
                          );
                          
                          if (existingIndex >= 0) {
                            // Aggregate with existing position
                            const existingPosition = accountData.lending[existingIndex];
                            if (existingPosition) {
                              existingPosition.wrappedAsset.amount = 
                                existingPosition.wrappedAsset.amount.plus(amount);
                              existingPosition.unwrappedAsset.amount = 
                                existingPosition.unwrappedAsset.amount.plus(unwrappedAmount);
                            }
                          } else {
                            // Create new lending position
                            accountData.lending.push({
                              unitToAssetRatio,
                              wrappedAsset: { resourceAddress, amount },
                              unwrappedAsset: { resourceAddress: unwrappedAssetAddress, amount: unwrappedAmount },
                            });
                          }
                        }
                      }
                    } else if (
                      resourceAddress === Assets.Fungible.XRD ||
                      resourceAddress === CaviarNineConstants.LSULP.resourceAddress ||
                      resourceAddress === WeftFinance.validator.resourceAddress
                    ) {
                      // Regular asset - add to collateral
                      accountData.collateral.push({ resourceAddress, amount });
                    }
                  }
                } else {
                  yield* Effect.fail(
                    new FailedToParseCDPDataError(nftItem.id, parseResult.error)
                  );
                }
              }
            }
          }

          accountBalancesMap.set(accountAddress, accountData);
        }

        return Array.from(accountBalancesMap.entries()).map(
          ([address, data]) => ({
            address,
            lending: data.lending,
            collateral: data.collateral,
          })
        );
      });
  })
);
