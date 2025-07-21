import { Effect } from "effect";

import type { GetNonFungibleBalanceOutput } from "../../gateway/getNonFungibleBalance";

import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from "../../gateway/getFungibleBalance";

import { BigNumber } from "bignumber.js";
import { GetComponentStateService } from "../../gateway/getComponentState";
import { LendingPoolSchema, SingleResourcePool, CDPData } from "./schemas";
import { GetKeyValueStoreService } from "../../gateway/getKeyValueStore";

import { DappConstants } from "data";
import type { AtLedgerState } from "../../gateway/schemas";
import {
  UnstakingReceiptProcessorService,
  type UnstakingReceipt,
} from "../../staking/unstakingReceiptProcessor";

const WeftFinanceConstants = DappConstants.WeftFinance.constants;
const weftFungibleRecourceAddresses =
  DappConstants.WeftFinance.weftFungibleRecourceAddresses;

export class ValidatorNotFoundForClaimNftError {
  readonly _tag = "ValidatorNotFoundForClaimNftError";
  constructor(readonly claimNftResourceAddress: string) {}
}

// Helper function for unstaking receipt processing
const getValidatorFromClaimNft = (
  claimNftResourceAddress: string,
  validatorClaimNftMap: Map<string, string>
): Effect.Effect<string, ValidatorNotFoundForClaimNftError> => {
  for (const [validatorAddress, claimNftResource] of validatorClaimNftMap) {
    if (claimNftResource === claimNftResourceAddress) {
      return Effect.succeed(validatorAddress);
    }
  }
  return Effect.fail(
    new ValidatorNotFoundForClaimNftError(claimNftResourceAddress)
  );
};

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

type AccountAddress = string;
type ResourceAddress = string;

export type GetWeftFinancePositionsOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof GetWeftFinancePositionsService)["Service"]["run"]>>
>[number];

export class GetWeftFinancePositionsService extends Effect.Service<GetWeftFinancePositionsService>()(
  "GetWeftFinancePositionsService",
  {
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      const getComponentStateService = yield* GetComponentStateService;
      const getKeyValueStoreService = yield* GetKeyValueStoreService;
      const unstakingReceiptProcessor = yield* UnstakingReceiptProcessorService;

      return {
        run: Effect.fn(function* (input: {
          accountAddresses: string[];
          at_ledger_state: AtLedgerState;
          fungibleBalance?: GetFungibleBalanceOutput;
          nonFungibleBalance?: GetNonFungibleBalanceOutput;
          validatorClaimNftMap: Map<string, string>;
        }) {
          const accountBalancesMap = new Map<
            AccountAddress,
            {
              lending: WeftLendingPosition[];
              collateral: AssetBalance[];
              unstakingReceipts: UnstakingReceipt[];
            }
          >();

          for (const accountAddress of input.accountAddresses) {
            accountBalancesMap.set(accountAddress, {
              lending: [],
              collateral: [],
              unstakingReceipts: [],
            });
          }

          // WEFT V2 Lending pool KVS contains the unit to asset ratio for each asset
          const lendingPoolV2KeyValueStore = yield* getKeyValueStoreService
            .run({
              address: WeftFinanceConstants.v2.lendingPool.kvsAddress,
              at_ledger_state: input.at_ledger_state,
            })
            .pipe(
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
              return yield* Effect.fail(
                new FailedToParseLendingPoolSchemaError(lendingPool.error)
              );
            }
          }

          // WEFT V1 Lending pool component states contains the unit to asset ratio for each asset
          const lendingPoolV1ComponentStates = yield* getComponentStateService({
            addresses: [
              WeftFinanceConstants.v1.wLSULP.componentAddress,
              WeftFinanceConstants.v1.wXRD.componentAddress,
              WeftFinanceConstants.v1.wxUSDC.componentAddress,
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
                  unstakingReceipts: [],
                };

                const unwrappedAssetAddress =
                  weftFungibleRecourceAddresses.get(resourceAddress);
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

          const weftyV2NonFungibleBalances = input.nonFungibleBalance;

          if (!weftyV2NonFungibleBalances) {
            return Array.from(accountBalancesMap.entries()).map(
              ([address, data]) => ({
                address,
                lending: data.lending,
                collateral: data.collateral,
                unstakingReceipts: data.unstakingReceipts,
              })
            );
          }

          for (const accountNFTBalance of weftyV2NonFungibleBalances.items) {
            const accountAddress = accountNFTBalance.address;
            const accountData = accountBalancesMap.get(accountAddress) ?? {
              lending: [],
              collateral: [],
              unstakingReceipts: [],
            };

            for (const nftResource of accountNFTBalance.nonFungibleResources) {
              if (
                nftResource.resourceAddress !==
                WeftFinanceConstants.v2.WeftyV2.resourceAddress
              ) {
                continue;
              }

              for (const nftItem of nftResource.items) {
                if (nftItem.isBurned || !nftItem.sbor) continue;

                const parseResult = CDPData.safeParse(nftItem.sbor);
                if (parseResult.isErr()) {
                  return yield* Effect.fail(
                    new FailedToParseCDPDataError(nftItem.id, parseResult.error)
                  );
                }

                const cdpData = parseResult.value;

                // Process regular collaterals
                for (const [
                  resourceAddress,
                  collateralInfo,
                ] of cdpData.collaterals.entries()) {
                  const amount = new BigNumber(collateralInfo.amount);

                  // Handle non-weft assets as regular collateral
                  if (!weftFungibleRecourceAddresses.has(resourceAddress)) {
                    accountData.collateral.push({ resourceAddress, amount });
                    continue;
                  }

                  // Handle weft assets as lending positions
                  const unitToAssetRatio =
                    poolToUnitToAssetRatio.get(resourceAddress);
                  const unwrappedAssetAddress =
                    weftFungibleRecourceAddresses.get(resourceAddress);

                  if (!unitToAssetRatio || !unwrappedAssetAddress) continue;

                  const unwrappedAmount = amount.div(unitToAssetRatio);
                  const existingIndex = accountData.lending.findIndex(
                    (lending) =>
                      lending.wrappedAsset.resourceAddress === resourceAddress
                  );

                  if (existingIndex >= 0) {
                    const existingPosition = accountData.lending[existingIndex];
                    if (existingPosition) {
                      existingPosition.wrappedAsset.amount =
                        existingPosition.wrappedAsset.amount.plus(amount);
                      existingPosition.unwrappedAsset.amount =
                        existingPosition.unwrappedAsset.amount.plus(
                          unwrappedAmount
                        );
                    }
                  } else {
                    accountData.lending.push({
                      unitToAssetRatio,
                      wrappedAsset: { resourceAddress, amount },
                      unwrappedAsset: {
                        resourceAddress: unwrappedAssetAddress,
                        amount: unwrappedAmount,
                      },
                    });
                  }
                }

                // Process NFT collaterals for unstaking receipts
                const nftCollateralEntries = Array.from(
                  cdpData.nft_collaterals.entries()
                ).filter(([resourceAddress]) =>
                  Array.from(input.validatorClaimNftMap.values()).includes(
                    resourceAddress
                  )
                );

                if (nftCollateralEntries.length === 0) continue;

                const unstakingReceiptRequests = yield* Effect.withSpan(
                  Effect.forEach(
                    nftCollateralEntries,
                    ([resourceAddress, nftCollateralInfo]) =>
                      Effect.gen(function* () {
                        const validatorAddress =
                          yield* getValidatorFromClaimNft(
                            resourceAddress,
                            input.validatorClaimNftMap
                          );
                        return {
                          resourceAddress,
                          nftIds: nftCollateralInfo.nft_ids,
                          validatorAddress,
                        };
                      })
                  ),
                  "processNftCollaterals"
                );

                if (unstakingReceiptRequests.length > 0) {
                  const unstakingReceipts = yield* unstakingReceiptProcessor
                    .processUnstakingReceipts({
                      unstakingReceiptRequests,
                      at_ledger_state: input.at_ledger_state,
                    })
                    .pipe(Effect.withSpan("processUnstakingReceipts"));

                  accountData.unstakingReceipts.push(...unstakingReceipts);
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
              unstakingReceipts: data.unstakingReceipts,
            })
          );
        }),
      };
    }),
  }
) {}
