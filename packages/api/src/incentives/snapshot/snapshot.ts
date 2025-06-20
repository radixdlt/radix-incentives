import { Context, Effect, Either, Layer } from "effect";
import { CreateSnapshotService } from "./createSnapshot";
import { UpdateSnapshotService } from "./updateSnapshot";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";
import type { InvalidStateInputError } from "../../common";
import type { GatewayApiClientService } from "../../common/gateway/gatewayApiClient";
import type {
  EntityNotFoundError,
  GatewayError,
} from "../../common/gateway/errors";
import { GetAccountBalancesAtStateVersionService } from "../account-balance/getAccountBalancesAtStateVersion";
import type { GetComponentStateService } from "../../common/gateway/getComponentState";
import type { GetEntityDetailsService } from "../../common/gateway/getEntityDetails";
import type { ConvertLsuToXrdService } from "../../common/staking/convertLsuToXrd";
import type { GetLsulpValueService } from "../../common/dapps/caviarnine/getLsulpValue";
import { GetAllValidatorsService } from "../../common/gateway/getAllValidators";
import type {
  GetNonFungibleBalanceService,
  GetNonFungibleBalanceServiceDependencies,
} from "../../common/gateway/getNonFungibleBalance";
import type { GetAllValidatorsError } from "../../common/gateway/getAllValidators";
import type {
  EntityDetailsNotFoundError,
  InvalidAmountError,
  InvalidNativeResourceKindError,
  InvalidResourceError,
} from "../../common/staking/convertLsuToXrd";
import type { GetEntityDetailsError } from "../../common/gateway/getEntityDetails";
import type {
  InvalidEntityAddressError,
  LsulpNotFoundError,
} from "../../common/dapps/caviarnine/getLsulpValue";
import type {
  GetRootFinancePositionsService,
  InvalidRootReceiptItemError,
  FailedToParseLendingPoolStateError,
  FailedToParsePoolStatesKeyError,
  MissingConversionRatioError,
  ParseSborError,
} from "../../common/dapps/rootFinance/getRootFinancePositions";
import type {
  FailedToParseLendingPoolSchemaError,
  GetWeftFinancePositionsService,
} from "../../common/dapps/weftFinance/getWeftFinancePositions";
import type {
  FailedToParseComponentStateError,
  GetShapeLiquidityAssetsService,
} from "../../common/dapps/caviarnine/getShapeLiquidityAssets";
import type { InvalidInputError } from "../../common/gateway/getNonFungibleBalance";
import type { GetKeyValueStoreService } from "../../common/gateway/getKeyValueStore";
import type { InvalidComponentStateError } from "../../common/gateway/getComponentState";
import type {
  FailedToParseLiquidityClaimsError,
  GetShapeLiquidityClaimsService,
} from "../../common/dapps/caviarnine/getShapeLiquidityClaims";
import type { GetDefiPlazaPositionsError } from "../../common/dapps/defiplaza/getDefiPlazaPositions";
import type { GetFungibleBalanceService } from "../../common/gateway/getFungibleBalance";
import type { GetLsulpService } from "../../common/dapps/caviarnine/getLsulp";
import type { GetUserStakingPositionsService } from "../../common/staking/getUserStakingPositions";
import type { EntityFungiblesPageService } from "../../common/gateway/entityFungiblesPage";
import type { EntityNonFungiblesPageService } from "../../common/gateway/entityNonFungiblesPage";
import type { KeyValueStoreDataService } from "../../common/gateway/keyValueStoreData";
import type { KeyValueStoreKeysService } from "../../common/gateway/keyValueStoreKeys";
import type { EntityNonFungibleDataService } from "../../common/gateway/entityNonFungiblesData";
import type { GetQuantaSwapBinMapService } from "../../common/dapps/caviarnine/getQuantaSwapBinMap";
import type { GetDefiPlazaPositionsService } from "../../common/dapps/defiplaza/getDefiPlazaPositions";
import type { GetResourcePoolUnitsService } from "../../common/resource-pool/getResourcePoolUnits";
import type { UnknownCaviarnineTokenError } from "../account-balance/aggregateCaviarninePositions";
import type { UnknownDefiPlazaTokenError } from "../account-balance/aggregateDefiPlazaPositions";
import type { DbClientService, DbError } from "../db/dbClient";
import { GetAccountAddressesService } from "../account/getAccounts";
import { UpsertAccountBalancesService } from "../account-balance/upsertAccountBalance";
import type { GetUsdValueService } from "../token-price/getUsdValue";
import {
  AggregateAccountBalanceService,
  type AggregateAccountBalanceServiceDependency,
  type AggregateAccountBalanceOutput,
} from "../account-balance/aggregateAccountBalance";
import type { XrdBalanceService } from "../account-balance/aggregateXrdBalance";
import BigNumber from "bignumber.js";

// Import all activities from 100activities.json
import allActivities from "../../../../db/src/incentives/seed/data/100activities.json";

export class SnapshotError {
  _tag = "SnapshotError";
  constructor(public readonly message: string) {}
}

export type SnapshotInput = {
  addresses?: string[];
  timestamp: Date;
};

export class SnapshotService extends Context.Tag("SnapshotService")<
  SnapshotService,
  (
    input: SnapshotInput
  ) => Effect.Effect<
    void,
    | GetAllValidatorsError
    | GetEntityDetailsError
    | LsulpNotFoundError
    | InvalidEntityAddressError
    | InvalidResourceError
    | InvalidNativeResourceKindError
    | InvalidAmountError
    | EntityDetailsNotFoundError
    | FailedToParseLendingPoolSchemaError
    | ParseSborError
    | InvalidRootReceiptItemError
    | FailedToParseLendingPoolStateError
    | FailedToParsePoolStatesKeyError
    | MissingConversionRatioError
    | InvalidStateInputError
    | FailedToParseComponentStateError
    | GatewayError
    | EntityNotFoundError
    | InvalidInputError
    | InvalidComponentStateError
    | FailedToParseLiquidityClaimsError
    | GetDefiPlazaPositionsError
    | UnknownCaviarnineTokenError
    | UnknownDefiPlazaTokenError
    | DbError
    | SnapshotError,
    | GetFungibleBalanceService
    | GetLsulpService
    | GetUserStakingPositionsService
    | GatewayApiClientService
    | EntityFungiblesPageService
    | GetLedgerStateService
    | GetNonFungibleBalanceService
    | GetAllValidatorsService
    | EntityNonFungiblesPageService
    | GetLsulpValueService
    | ConvertLsuToXrdService
    | GetEntityDetailsService
    | GetWeftFinancePositionsService
    | GetKeyValueStoreService
    | KeyValueStoreDataService
    | KeyValueStoreKeysService
    | GetRootFinancePositionsService
    | GetShapeLiquidityAssetsService
    | EntityNonFungibleDataService
    | GetComponentStateService
    | GetQuantaSwapBinMapService
    | GetShapeLiquidityClaimsService
    | GetDefiPlazaPositionsService
    | GetResourcePoolUnitsService
    | CreateSnapshotService
    | UpdateSnapshotService
    | DbClientService
    | GetAccountAddressesService
    | UpsertAccountBalancesService
    | GetUsdValueService
    | AggregateAccountBalanceService
    | GetNonFungibleBalanceServiceDependencies
    | XrdBalanceService
    | AggregateAccountBalanceServiceDependency
  >
>() {}

export const SnapshotLive = Layer.effect(
  SnapshotService,
  Effect.gen(function* () {
    const getLedgerState = yield* GetLedgerStateService;
    const getAccountBalancesAtStateVersion =
      yield* GetAccountBalancesAtStateVersionService;
    const createSnapshot = yield* CreateSnapshotService;
    const updateSnapshot = yield* UpdateSnapshotService;
    const getAccountAddresses = yield* GetAccountAddressesService;
    const upsertAccountBalances = yield* UpsertAccountBalancesService;
    const aggregateAccountBalanceService =
      yield* AggregateAccountBalanceService;
    const getAllValidatorsService = yield* GetAllValidatorsService;

    return (input) =>
      Effect.gen(function* () {
        yield* Effect.log("running snapshot", {
          timestamp: input.timestamp,
          addresses: input.addresses,
        });

        if (!input.timestamp)
          return yield* Effect.fail(new SnapshotError("Timestamp is required"));

        const lederState = yield* getLedgerState({
          at_ledger_state: {
            timestamp: input.timestamp,
          },
        });

        const accountAddresses =
          input.addresses ??
          (yield* getAccountAddresses({
            createdAt: input.timestamp,
          }));

        const { id: snapshotId } = yield* createSnapshot({
          timestamp: input.timestamp,
          status: "processing",
        });

        const validators = yield* getAllValidatorsService();

        yield* Effect.log("getting account balances");

        const [accountBalancesResult] = yield* Effect.all(
          [
            getAccountBalancesAtStateVersion({
              addresses: accountAddresses,
              at_ledger_state: {
                state_version: lederState.state_version,
              },
              validators: validators,
            }).pipe(Effect.withSpan("getAccountBalancesAtStateVersion")),
          ],
          { mode: "either" }
        );

        if (Either.isLeft(accountBalancesResult)) {
          yield* updateSnapshot({
            id: snapshotId,
            status: "failed",
          });
          const error = accountBalancesResult.left;
          return yield* Effect.fail(error);
        }

        const accountBalances = accountBalancesResult.right;

        yield* Effect.log(
          "aggregating account balances and converting into USD"
        );

        const [aggregateAccountBalanceResult] = yield* Effect.all(
          [
            aggregateAccountBalanceService({
              accountBalances: accountBalances.items,
              timestamp: input.timestamp,
            }).pipe(Effect.withSpan("aggregateAccountBalance")),
          ],
          { mode: "either" }
        );

        if (Either.isLeft(aggregateAccountBalanceResult)) {
          yield* updateSnapshot({
            id: snapshotId,
            status: "failed",
          });
          return yield* Effect.fail(
            new SnapshotError("Failed to convert account balances")
          );
        }

        const aggregatedAccountBalance = aggregateAccountBalanceResult.right;

        // Get existing activity IDs from aggregated results
        const existingActivityIds = new Set(
          aggregatedAccountBalance.map((item) => item.activityId)
        );

        // Get all activity IDs from 100activities.json
        const allActivityIds = allActivities.map((activity) => activity.id);

        // Find missing activity IDs
        const missingActivityIds = allActivityIds.filter(
          (activityId) => !existingActivityIds.has(activityId)
        );

        // Check if dummy data generation is enabled via environment variable
        const enableDummyData = process.env.ENABLE_DUMMY_ACTIVITY_DATA === 'true';
        
        let expandedAggregatedAccountBalance = aggregatedAccountBalance;

        if (enableDummyData && missingActivityIds.length > 0) {
          yield* Effect.log("Adding dummy data for missing activities", {
            missingActivityIds: missingActivityIds.length,
            existingActivityIds: existingActivityIds.size,
          });

          // Create dummy data for missing activities for each account
          const dummyData: AggregateAccountBalanceOutput[] = [];
          
          for (const address of accountAddresses) {
            for (const activityId of missingActivityIds) {
              const dummyEntry: AggregateAccountBalanceOutput = {
                timestamp: input.timestamp,
                address: address,
                activityId: activityId,
                usdValue: new BigNumber(0),
                data: {
                  type: "no_data",
                },
              };
              dummyData.push(dummyEntry);
            }
          }

          yield* Effect.log("Created dummy entries", {
            dummyEntriesCount: dummyData.length,
            accountsCount: accountAddresses.length,
            missingActivitiesCount: missingActivityIds.length,
          });

          // Combine real data with dummy data
          expandedAggregatedAccountBalance = [
            ...aggregatedAccountBalance,
            ...dummyData,
          ];
        } else if (enableDummyData) {
          yield* Effect.log("Dummy data generation enabled but no missing activities found");
        } else {
          yield* Effect.log("Dummy data generation disabled via environment variable");
        }

        const groupedByActivityId = expandedAggregatedAccountBalance.reduce(
          (acc, item) => {
            acc[item.activityId] = (acc[item.activityId] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        yield* Effect.log("updating account balances", groupedByActivityId);

        yield* upsertAccountBalances(expandedAggregatedAccountBalance).pipe(
          Effect.withSpan("upsertAccountBalances")
        );

        yield* Effect.log("updating snapshot");

        yield* updateSnapshot({
          id: snapshotId,
          status: "completed",
        });

        yield* Effect.log("snapshot completed");
      });
  })
);
