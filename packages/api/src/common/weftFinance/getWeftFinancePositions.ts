import { Context, Effect, Layer } from "effect";

import type { GatewayApiClientService } from "../gateway/gatewayApiClient";
import type { LoggerService } from "../logger/logger";
import type { EntityFungiblesPageService } from "../gateway/entityFungiblesPage";
import type {
  GetStateVersionError,
  GetStateVersionService,
} from "../gateway/getStateVersion";
import type { GatewayError } from "../gateway/errors";
import {
  type EntityNotFoundError,
  type GetEntityDetailsError,
  GetNonFungibleBalanceService,
  type InvalidInputError,
  type StateEntityDetailsInput,
} from "../gateway/getNonFungibleBalance";
import type { EntityNonFungiblesPageService } from "../gateway/entityNonFungiblesPage";
import { dAppAddresses, KNOWN_RESOURCE_ADDRESSES } from "../config/appConfig";
import { GetFungibleBalanceService } from "../gateway/getFungibleBalance";
import { GetEntityDetailsService } from "../gateway/getEntityDetails";

import { BigNumber } from "bignumber.js";
import {
  GetComponentStateService,
  type InvalidComponentStateError,
} from "../gateway/getComponentState";
import { LendingPoolSchema, SingleResourcePool } from "./schemas";
import { GetKeyValueStoreService } from "../gateway/getKeyValueStore";
import type { KeyValueStoreDataService } from "../gateway/keyValueStoreData";
import type { KeyValueStoreKeysService } from "../gateway/keyValueStoreKeys";

export class FailedToParseLendingPoolSchemaError {
  readonly _tag = "FailedToParseLendingPoolSchemaError";
  constructor(readonly lendingPool: unknown) {}
}

const WeftFinanceAddresses = dAppAddresses.weftFinance;

const weftFungibleRecourceAddresses = new Map<string, ResourceAddress>([
  [WeftFinanceAddresses.v1.wXRD.resourceAddress, KNOWN_RESOURCE_ADDRESSES.xrd],
  [
    WeftFinanceAddresses.v1.wxUSDC.resourceAddress,
    KNOWN_RESOURCE_ADDRESSES.xUSDC,
  ],
  [
    WeftFinanceAddresses.v1.wLSULP.resourceAddress,
    KNOWN_RESOURCE_ADDRESSES.LSULP,
  ],

  [WeftFinanceAddresses.v2.w2XRD.resourceAddress, KNOWN_RESOURCE_ADDRESSES.xrd],
  [
    WeftFinanceAddresses.v2.w2xUSDC.resourceAddress,
    KNOWN_RESOURCE_ADDRESSES.xUSDC,
  ],
  [
    WeftFinanceAddresses.v2.w2xUSDT.resourceAddress,
    KNOWN_RESOURCE_ADDRESSES.xUSDT,
  ],
  [
    WeftFinanceAddresses.v2.w2xwBTC.resourceAddress,
    KNOWN_RESOURCE_ADDRESSES.wxBTC,
  ],
  [
    WeftFinanceAddresses.v2.w2wETH.resourceAddress,
    KNOWN_RESOURCE_ADDRESSES.xETH,
  ],
]);

export type GetWeftFinancePositionsOutput = {
  address: string;
  items: {
    unitToAssetRatio: BigNumber;
    wrappedAsset: {
      resourceAddress: ResourceAddress;
      amount: BigNumber;
    };
    unwrappedAsset: {
      resourceAddress: ResourceAddress;
      amount: BigNumber;
    };
  }[];
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
    const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
    const getFungibleBalanceService = yield* GetFungibleBalanceService;
    const getEntityDetailsService = yield* GetEntityDetailsService;
    const getComponentStateService = yield* GetComponentStateService;
    const getKeyValueStoreService = yield* GetKeyValueStoreService;

    return (input) => {
      return Effect.gen(function* () {
        const poolToUnitToAssetRatio = new Map<ResourceAddress, BigNumber>();

        const accountBalancesMap = new Map<
          AccountAddress,
          {
            unitToAssetRatio: BigNumber;
            wrappedAsset: {
              resourceAddress: ResourceAddress;
              amount: BigNumber;
            };
            unwrappedAsset: {
              resourceAddress: ResourceAddress;
              amount: BigNumber;
            };
          }[]
        >();

        for (const accountAddress of input.accountAddresses) {
          accountBalancesMap.set(accountAddress, []);
        }

        const keyValueStoreResponse = yield* getKeyValueStoreService({
          address: WeftFinanceAddresses.v2.lendingPool.kvsAddress,
          stateVersion: input.stateVersion,
        }).pipe(
          Effect.catchTags({
            // missing key value store here means that the v2 lending pool is not deployed
            EntityNotFoundError: () =>
              Effect.succeed({
                entries: [],
              }),
          })
        );

        for (const item of keyValueStoreResponse.entries) {
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

        const componentStateV1 = yield* getComponentStateService({
          addresses: [
            WeftFinanceAddresses.v1.wLSULP.componentAddress,
            WeftFinanceAddresses.v1.wXRD.componentAddress,
            WeftFinanceAddresses.v1.wxUSDC.componentAddress,
          ],
          schema: SingleResourcePool,
          stateVersion: input.stateVersion,
        });

        for (const item of componentStateV1) {
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
            items,
          })
        );
      });
    };
  })
);
