import { Context, Effect, Either, Layer } from "effect";
import { CreateSnapshotService } from "./createSnapshot";
import { UpdateSnapshotService } from "./updateSnapshot";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";
import type { InvalidStateInputError } from "../../common";
import type {
  EntityNotFoundError,
  GatewayError,
} from "../../common/gateway/errors";
import { GetAccountBalancesAtStateVersionService } from "../account-balance/getAccountBalancesAtStateVersion";
import { GetAllValidatorsService } from "../../common/gateway/getAllValidators";
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
  InvalidRootReceiptItemError,
  FailedToParseLendingPoolStateError,
  FailedToParsePoolStatesKeyError,
  MissingConversionRatioError,
  ParseSborError,
} from "../../common/dapps/rootFinance/getRootFinancePositions";
import type { FailedToParseLendingPoolSchemaError } from "../../common/dapps/weftFinance/getWeftFinancePositions";
import type { FailedToParseComponentStateError } from "../../common/dapps/caviarnine/getShapeLiquidityAssets";
import type { InvalidInputError } from "../../common/gateway/getNonFungibleBalance";
import type { InvalidComponentStateError } from "../../common/gateway/getComponentState";
import type { FailedToParseLiquidityClaimsError } from "../../common/dapps/caviarnine/getShapeLiquidityClaims";
import type { GetDefiPlazaPositionsError } from "../../common/dapps/defiplaza/getDefiPlazaPositions";
import type { UnknownTokenError } from "../../common/token-name/getTokenName";
import type { DbError } from "../db/dbClient";
import { GetAccountAddressesService } from "../account/getAccounts";
import { UpsertAccountBalancesService } from "../account-balance/upsertAccountBalance";
import { AggregateAccountBalanceService } from "../account-balance/aggregateAccountBalance";
import { generateDummySnapshotData } from "./generateDummySnapshotData";

// Import all activities from 100activities data

export class SnapshotError {
  _tag = "SnapshotError";
  constructor(public readonly message: string) {}
}

export type SnapshotInput = {
  addresses?: string[];
  timestamp: Date;
  batchSize?: number;
  jobId?: string;
  addDummyData?: boolean;
};

/**
 * Split an array into chunks of specified size
 */
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export type SnapshotServiceError = 
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
  | UnknownTokenError
  | DbError
  | SnapshotError;

export class SnapshotService extends Context.Tag("SnapshotService")<
  SnapshotService,
  (input: SnapshotInput) => Effect.Effect<void, SnapshotServiceError>
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
        yield* Effect.log(
          "running snapshot",
          JSON.stringify({
            timestamp: input.timestamp,
            addresses: input.addresses,
            batchSize: input.batchSize,
            jobId: input.jobId,
          })
        );

        if (!input.timestamp)
          return yield* Effect.fail(new SnapshotError("Timestamp is required"));

        // Get batch size from input or environment variable, default to 1000
        const batchSize =
          input.batchSize ??
          Number.parseInt(process.env.SNAPSHOT_BATCH_SIZE ?? "30000", 10);

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

        yield* Effect.log(
          "processing accounts in batches",
          JSON.stringify({
            totalAccounts: accountAddresses.length,
            batchSize,
            totalBatches: Math.ceil(accountAddresses.length / batchSize),
          })
        );

        const { id: snapshotId } = yield* createSnapshot({
          timestamp: input.timestamp,
          status: "processing",
        });

        const validators = yield* getAllValidatorsService();

        // Split accounts into batches
        const accountBatches = chunkArray(accountAddresses, batchSize);

        // Track overall progress
        let processedAccounts = 0;
        let totalProcessedEntries = 0;

        const enableDummyData = input.addDummyData ?? false;

        // Process each batch sequentially
        for (
          let batchIndex = 0;
          batchIndex < accountBatches.length;
          batchIndex++
        ) {
          const batch = accountBatches[batchIndex];

          if (!batch) {
            yield* Effect.fail(
              new SnapshotError(`Batch ${batchIndex} is undefined`)
            );
            return;
          }

          yield* Effect.log(
            "getting account balances for batch",
            JSON.stringify({
              batchIndex: batchIndex + 1,
              totalBatches: accountBatches.length,
              batchSize: batch.length,
              processedAccounts,
              totalAccounts: accountAddresses.length,
              progress: `${Math.round((processedAccounts / accountAddresses.length) * 100)}%`,
            })
          );

          const [accountBalancesResult] = yield* Effect.all(
            [
              getAccountBalancesAtStateVersion({
                addresses: batch,
                at_ledger_state: {
                  state_version: lederState.state_version,
                },
                validators: validators,
              }).pipe(
                Effect.withSpan(
                  `getAccountBalancesAtStateVersion_batch_${batchIndex + 1}`
                )
              ),
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
            "aggregating account balances and converting into USD for batch",
            JSON.stringify({
              batchIndex: batchIndex + 1,
              totalBatches: accountBatches.length,
              batchSize: batch.length,
              processedAccounts,
              totalAccounts: accountAddresses.length,
              progress: `${Math.round((processedAccounts / accountAddresses.length) * 100)}%`,
            })
          );

          const [aggregateAccountBalanceResult] = yield* Effect.all(
            [
              aggregateAccountBalanceService({
                accountBalances: accountBalances.items,
                timestamp: input.timestamp,
              }).pipe(
                Effect.withSpan(
                  `aggregateAccountBalance_batch_${batchIndex + 1}`
                )
              ),
            ],
            { mode: "either" }
          );

          if (Either.isLeft(aggregateAccountBalanceResult)) {
            const error = aggregateAccountBalanceResult.left;
            yield* Effect.logError("Account balance aggregation failed", error);
            yield* updateSnapshot({
              id: snapshotId,
              status: "failed",
            });
            return yield* Effect.fail(
              new SnapshotError(
                `Failed to convert account balances for batch ${batchIndex + 1}: ${error}`
              )
            );
          }

          let batchAggregatedAccountBalance =
            aggregateAccountBalanceResult.right;

          if (enableDummyData) {
            batchAggregatedAccountBalance = yield* generateDummySnapshotData({
              batchAggregatedAccountBalance,
              batch,
              jobInput: input,
              batchIndex: batchIndex,
            });
          }

          yield* Effect.log(
            "upserting account balances for batch",
            JSON.stringify({
              batchIndex: batchIndex + 1,
              totalBatches: accountBatches.length,
              batchSize: batch.length,
              processedAccounts,
              totalAccounts: accountAddresses.length,
              progress: `${Math.round((processedAccounts / accountAddresses.length) * 100)}%`,
            })
          );

          // Upsert results for this batch immediately
          yield* upsertAccountBalances(batchAggregatedAccountBalance).pipe(
            Effect.withSpan(`upsertAccountBalances_batch_${batchIndex + 1}`)
          );

          // Update progress
          processedAccounts += batch.length;
          totalProcessedEntries += batchAggregatedAccountBalance.length;

          yield* Effect.log(
            "completed batch",
            JSON.stringify({
              batchIndex: batchIndex + 1,
              totalBatches: accountBatches.length,
              batchSize: batch.length,
              processedAccounts,
              totalAccounts: accountAddresses.length,
              progress: `${Math.round((processedAccounts / accountAddresses.length) * 100)}%`,
            })
          );

          // Clear batch data from memory to reduce memory usage
          batchAggregatedAccountBalance = [];
        }

        yield* Effect.log(
          "all batches completed for job",
          JSON.stringify({
            totalBatches: accountBatches.length,
            processedAccounts,
            totalAccounts: accountAddresses.length,
            progress: `${Math.round((processedAccounts / accountAddresses.length) * 100)}%`,
          })
        );

        yield* Effect.log(
          "updating snapshot for job",
          JSON.stringify({
            jobId: input.jobId,
            timestamp: input.timestamp,
          })
        );

        yield* updateSnapshot({
          id: snapshotId,
          status: "completed",
        });

        yield* Effect.log(`snapshot completed for job ${input.jobId}
          timestamp: ${input.timestamp}
          `);
      });
  })
);
