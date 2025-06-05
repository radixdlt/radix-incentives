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
import type { GetAllValidatorsService } from "../../common/gateway/getAllValidators";
import type { GetNonFungibleBalanceService } from "../../common/gateway/getNonFungibleBalance";
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
} from "../../common/dapps/rootFinance/getRootFinancePositions";
import type {
  FailedToParseLendingPoolSchemaError,
  GetWeftFinancePositionsService,
} from "../../common/dapps/weftFinance/getWeftFinancePositions";
import type { ParseSborError } from "../../common/dapps/rootFinance/getRootFinancePositions";
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
import type { GetFungibleBalanceService } from "../../common/gateway/getFungibleBalance";
import type { GetLsulpService } from "../../common/dapps/caviarnine/getLsulp";
import type { GetUserStakingPositionsService } from "../../common/staking/getUserStakingPositions";
import type { EntityFungiblesPageService } from "../../common/gateway/entityFungiblesPage";
import type { EntityNonFungiblesPageService } from "../../common/gateway/entityNonFungiblesPage";
import type { KeyValueStoreDataService } from "../../common/gateway/keyValueStoreData";
import type { KeyValueStoreKeysService } from "../../common/gateway/keyValueStoreKeys";
import type { EntityNonFungibleDataService } from "../../common/gateway/entityNonFungiblesData";
import type { GetQuantaSwapBinMapService } from "../../common/dapps/caviarnine/getQuantaSwapBinMap";
import type { DbClientService, DbError } from "../db/dbClient";
import { GetAccountAddressesService } from "../account/getAccounts";
import { UpsertAccountBalancesService } from "../account-balance/upsertAccountBalance";
import type { GetUsdValueService } from "../token-price/getUsdValue";
import { AggregateAccountBalanceService } from "../account-balance/aggregateAccountBalance";

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
    | InvalidStateInputError
    | FailedToParseComponentStateError
    | GatewayError
    | EntityNotFoundError
    | InvalidInputError
    | InvalidComponentStateError
    | FailedToParseLiquidityClaimsError
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
    | CreateSnapshotService
    | UpdateSnapshotService
    | DbClientService
    | GetAccountAddressesService
    | UpsertAccountBalancesService
    | GetUsdValueService
    | AggregateAccountBalanceService
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

        yield* Effect.log("getting account balances");

        const [accountBalancesResult] = yield* Effect.all(
          [
            getAccountBalancesAtStateVersion({
              addresses: accountAddresses,
              at_ledger_state: {
                state_version: lederState.state_version,
              },
            }),
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
            }),
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

        const groupedByActivityId = aggregatedAccountBalance.reduce(
          (acc, item) => {
            acc[item.activityId] = (acc[item.activityId] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        yield* Effect.log("updating account balances", groupedByActivityId);

        yield* upsertAccountBalances(aggregatedAccountBalance);

        yield* Effect.log("updating snapshot");

        yield* updateSnapshot({
          id: snapshotId,
          status: "completed",
        });

        yield* Effect.log("snapshot completed");
      });
  })
);
