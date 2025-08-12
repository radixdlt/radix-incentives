import BigNumber from 'bignumber.js';
import { Config, Data, Effect } from 'effect';
import { z } from 'zod';
import { chunker } from '../../common';
import { GetAllValidatorsService } from '../../common/gateway/getAllValidators';
import { GetLedgerStateService } from '../../common/gateway/getLedgerState';
import { GetAccountAddressesService } from '../account/getAccounts';
import { AggregateAccountBalanceService } from '../account-balance/aggregateAccountBalance';
import { GetAccountBalancesAtStateVersionService } from '../account-balance/getAccountBalancesAtStateVersion';
import { UpsertAccountBalancesService } from '../account-balance/upsertAccountBalance';
import { ConfigService } from '../config/configService';
import { generateDummySnapshotData } from './generateDummySnapshotData';

export class SnapshotError extends Data.TaggedError('SnapshotError')<{
  message: string;
}> {}

export const SnapshotInputSchema = z.object({
  addresses: z.array(z.string()).optional(),
  timestamp: z.date(),
  batchSize: z.number().optional(),
  jobId: z.string().optional(),
  addDummyData: z.boolean().optional(),
  includeActivityIds: z.array(z.string()).optional(),
  usdThreshold: z.string().optional(),
});

export type SnapshotInput = z.infer<typeof SnapshotInputSchema>;

export class InvalidInputError extends Data.TaggedError('InvalidInputError')<{
  message: string;
  error: z.ZodError<SnapshotInput>;
}> {}

export class SnapshotService extends Effect.Service<SnapshotService>()(
  'SnapshotService',
  {
    effect: Effect.gen(function* () {
      const getLedgerState = yield* GetLedgerStateService;
      const getAccountBalancesAtStateVersion =
        yield* GetAccountBalancesAtStateVersionService;
      const getAccountAddresses = yield* GetAccountAddressesService;
      const upsertAccountBalances = yield* UpsertAccountBalancesService;
      const aggregateAccountBalanceService =
        yield* AggregateAccountBalanceService;
      const getAllValidatorsService = yield* GetAllValidatorsService;
      const configService = yield* ConfigService;

      const SKIP_STATE_VERSION_CHECK = yield* Config.boolean(
        'SKIP_STATE_VERSION_CHECK',
      ).pipe(Config.withDefault(false));

      const DEFAULT_BATCH_SIZE = yield* Config.number(
        'SNAPSHOT_BATCH_SIZE',
      ).pipe(Config.withDefault(30_000));

      // prevents snapshot from running if it's ahead of the latest processed state version
      const verifyStateVersion = Effect.fn(function* (
        snapshotStateVersion: number,
      ) {
        if (SKIP_STATE_VERSION_CHECK) return;

        const latestProcessedStateVersion =
          yield* configService.getStateVersion();

        if (!latestProcessedStateVersion) {
          return yield* Effect.fail(
            new SnapshotError({
              message: 'No state version found, check if streamer is running',
            }),
          );
        }

        if (snapshotStateVersion > latestProcessedStateVersion) {
          return yield* Effect.fail(
            new SnapshotError({
              message:
                'Snapshot state version is ahead of the latest processed state version',
            }),
          );
        }
      });

      const validateInput = Effect.fn('validateInput')(function* (
        input: SnapshotInput,
      ) {
        const parsedInput = SnapshotInputSchema.safeParse(input);
        if (!parsedInput.success) {
          return yield* Effect.fail(
            new InvalidInputError({
              message: parsedInput.error.message,
              error: parsedInput.error,
            }),
          );
        }
        return parsedInput.data;
      });

      let initialMemory: NodeJS.MemoryUsage | null = null;

      const logMemoryUsage = Effect.fn(function* (label?: string) {
        const memUsage = process.memoryUsage();

        if (!initialMemory) {
          initialMemory = memUsage;
        }

        const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

        yield* Effect.log(`Memory ${label || 'usage'}:`, {
          current: {
            rss: `${mb(memUsage.rss)} MB`,
            heapUsed: `${mb(memUsage.heapUsed)} MB`,
            heapTotal: `${mb(memUsage.heapTotal)} MB`,
            external: `${mb(memUsage.external)} MB`,
          },
          delta: {
            rss: `+${mb(memUsage.rss - initialMemory.rss)} MB`,
            heapUsed: `+${mb(memUsage.heapUsed - initialMemory.heapUsed)} MB`,
          },
        });
      });

      return Effect.fn('snapshot')(function* (input: SnapshotInput) {
        const batchSize = input.batchSize ?? DEFAULT_BATCH_SIZE;
        const enableDummyData = input.addDummyData ?? false;

        const includeActivityIds = input.includeActivityIds
          ? new Set(input.includeActivityIds)
          : null;

        const usdThreshold = input.usdThreshold
          ? new BigNumber(input.usdThreshold)
          : null;

        yield* Effect.log(`==============================================`);

        yield* Effect.log(
          `starting snapshot job ${input.jobId} at timestamp: ${input.timestamp}`,
        );

        yield* validateInput(input);

        const lederState = yield* getLedgerState({
          at_ledger_state: {
            timestamp: input.timestamp,
          },
        });

        yield* verifyStateVersion(lederState.state_version);

        const accountAddresses =
          input.addresses ??
          (yield* getAccountAddresses({
            createdAt: input.timestamp,
          }));

        // Split accounts into batches
        const accountBatches = chunker(accountAddresses, batchSize);

        yield* Effect.log(
          `processing accounts in batches, total accounts: ${accountAddresses.length}`,
        );

        // Gets all validators from the gateway. This should be done once per job.
        const validators = yield* getAllValidatorsService();

        yield* Effect.forEach(
          accountBatches,
          Effect.fn(function* (accountsAddresses, batchIndex) {
            yield* logMemoryUsage(
              `batch ${batchIndex + 1}/${accountBatches.length}`,
            );
            if (accountBatches.length > 1)
              yield* Effect.log(
                `processing batch ${batchIndex + 1} out of ${accountBatches.length}`,
              );

            yield* Effect.log(`phase 1: fetch account balances`);
            let accountBalances = yield* getAccountBalancesAtStateVersion({
              addresses: accountsAddresses,
              at_ledger_state: {
                state_version: lederState.state_version,
              },
              validators,
            }).pipe(
              Effect.withSpan(
                `getAccountBalancesAtStateVersion_batch_${batchIndex + 1}`,
              ),
            );
            yield* logMemoryUsage(
              `batch ${batchIndex + 1}/${accountBatches.length}`,
            );
            yield* Effect.log(`phase 2: aggregate account balances`);
            let aggregatedAccountBalance =
              yield* aggregateAccountBalanceService({
                accountBalances: accountBalances.items,
                timestamp: input.timestamp,
              }).pipe(
                Effect.withSpan(
                  `aggregateAccountBalance_batch_${batchIndex + 1}`,
                  {},
                ),
              );

            accountBalances = {
              items: [],
              ledgerState: accountBalances.ledgerState,
            };

            if (enableDummyData) {
              yield* Effect.log(`[DEBUG] generating dummy data`);
              // @ts-expect-error: used for testing
              aggregatedAccountBalance = yield* generateDummySnapshotData({
                batchAggregatedAccountBalance: aggregatedAccountBalance,
                batch: accountsAddresses,
                jobInput: input,
                batchIndex: batchIndex,
              });
            }

            // Filter out accounts with activity ids not in the includeActivityIds set
            if (includeActivityIds) {
              aggregatedAccountBalance = aggregatedAccountBalance.map(
                (accountBalance) => ({
                  ...accountBalance,
                  data: accountBalance.data.filter((data) =>
                    includeActivityIds.has(data.activityId),
                  ),
                }),
              );
            }

            // Filter out accounts with total USD value less than the threshold
            if (usdThreshold) {
              aggregatedAccountBalance = aggregatedAccountBalance.filter(
                (accountBalance) => {
                  const totalUsdValue = accountBalance.data.reduce(
                    (acc, data) => acc.plus(data.usdValue),
                    new BigNumber(0),
                  );
                  return totalUsdValue.gte(usdThreshold);
                },
              );
            }
            yield* logMemoryUsage(
              `batch ${batchIndex + 1}/${accountBatches.length}`,
            );
            yield* Effect.log(`phase 3: save account balances`);
            yield* upsertAccountBalances(aggregatedAccountBalance).pipe(
              Effect.withSpan(`upsertAccountBalances_batch_${batchIndex + 1}`),
            );
            aggregatedAccountBalance = [];

            yield* Effect.log('memory usage', process.memoryUsage());
          }),
          // discard the result of the effect to reduce memory usage
          { discard: true },
        );

        yield* Effect.log(`snapshot completed for job: ${input.jobId}`);
        yield* Effect.log(`==============================================`);
        yield* Effect.log('memory usage', process.memoryUsage());
      });
    }),
  },
) {}

export const SnapshotLive = SnapshotService.Default;
