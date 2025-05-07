import { Context, Effect, Layer } from "effect";

import type { GatewayApiClientService } from "../../gateway/gatewayApiClient";
import type { LoggerService } from "../../logger/logger";
import type { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";
import type {
  GetStateVersionError,
  GetStateVersionService,
} from "../../gateway/getStateVersion";
import type { GatewayError } from "../../gateway/errors";
import type {
  EntityNotFoundError,
  GetEntityDetailsError,
  GetNonFungibleBalanceService,
  InvalidInputError,
  StateEntityDetailsInput,
} from "../../gateway/getNonFungibleBalance";
import type { EntityNonFungiblesPageService } from "../../gateway/entityNonFungiblesPage";

import { GetFungibleBalanceService } from "../../gateway/getFungibleBalance";

import { BigNumber } from "bignumber.js";
import {
  GetComponentStateService,
  type InvalidComponentStateError,
} from "../../gateway/getComponentState";
import { LendingPoolSchema, SingleResourcePool } from "./schemas";
import { GetKeyValueStoreService } from "../../gateway/getKeyValueStore";
import type { KeyValueStoreDataService } from "../../gateway/keyValueStoreData";
import type { KeyValueStoreKeysService } from "../../gateway/keyValueStoreKeys";
import { WeftFinance, weftFungibleRecourceAddresses } from "./constants";

export class FailedToParseLendingPoolSchemaError {
  readonly _tag = "FailedToParseLendingPoolSchemaError";
  constructor(readonly lendingPool: unknown) {}
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
};

export class GetWeftFinancePositionsService extends Context.Tag(
  "GetWeftFinancePositionsService"
)<
  GetWeftFinancePositionsService,
  (input: {
    accountAddresses: string[];
    stateVersion?: StateEntityDetailsInput["state"];
  }) => Effect.Effect<
    GetWeftFinancePositionsOutput[],
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | GetStateVersionError
    | InvalidComponentStateError
    | FailedToParseLendingPoolSchemaError,
    | GetNonFungibleBalanceService
    | GatewayApiClientService
    | LoggerService
    | EntityFungiblesPageService
    | GetStateVersionService
    | EntityNonFungiblesPageService
    | GetKeyValueStoreService
    | KeyValueStoreDataService
    | KeyValueStoreKeysService
  >
>() {}

type AccountAddress = string;
type ResourceAddress = string;

export const GetWeftFinancePositionsLive = Layer.effect(
  GetWeftFinancePositionsService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;
    const getComponentStateService = yield* GetComponentStateService;
    const getKeyValueStoreService = yield* GetKeyValueStoreService;

    return (input) => {
      return Effect.gen(function* () {
        const accountBalancesMap = new Map<
          AccountAddress,
          WeftLendingPosition[]
        >();

        for (const accountAddress of input.accountAddresses) {
          accountBalancesMap.set(accountAddress, []);
        }

        // WEFT V2 Lending pool KVS contains the unit to asset ratio for each asset
        const lendingPoolV2KeyValueStore = yield* getKeyValueStoreService({
          address: WeftFinance.v2.lendingPool.kvsAddress,
          stateVersion: input.stateVersion,
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
          stateVersion: input.stateVersion,
        });

        for (const item of lendingPoolV1ComponentStates) {
          poolToUnitToAssetRatio.set(
            item.state.pool_unit_res_manager,
            new BigNumber(item.state.unit_to_asset_ratio)
          );
        }

        const accountBalances = yield* getFungibleBalanceService({
          addresses: input.accountAddresses,
          state: input.stateVersion,
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
              const items = accountBalancesMap.get(accountAddress) ?? [];

              accountBalancesMap.set(accountAddress, [
                ...items,
                {
                  unitToAssetRatio,
                  wrappedAsset: {
                    resourceAddress,
                    amount,
                  },
                  unwrappedAsset: {
                    resourceAddress:
                      // biome-ignore lint/style/noNonNullAssertion: <explanation>
                      weftFungibleRecourceAddresses.get(resourceAddress)!,
                    amount: amount.div(unitToAssetRatio),
                  },
                },
              ]);
            }
          }
        }

        return Array.from(accountBalancesMap.entries()).map(
          ([address, items]) => ({
            address,
            lending: items,
          })
        );
      });
    };
  })
);
