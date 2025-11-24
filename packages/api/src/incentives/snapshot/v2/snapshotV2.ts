import { Array as A, Config, Data, Effect, pipe, Schedule } from 'effect';
import { z } from 'zod';
import { chunker } from '../../../common';
import { GetLedgerStateService } from '../../../common/gateway/getLedgerState';
import { GetAccountAddressesService } from '../../account/getAccounts';
import { GetAccountBalancesAtStateVersionService } from '../../account-balance/getAccountBalancesAtStateVersion';
import { UpsertAccountBalancesService } from '../../account-balance/upsertAccountBalance';
import {
  AccountBalanceState,
  ValidatorsState,
} from '../../account-balance/v2/accountBalanceState';
import { GetAccountBalancesAtStateVersionV2 } from '../../account-balance/v2/getAccountBalances';
import { StateVersion } from '../../account-balance/v2/schemas';
import { ConfigService } from '../../config/configService';

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

export class SnapshotV2 extends Effect.Service<SnapshotV2>()('SnapshotV2', {
  dependencies: [
    GetLedgerStateService.Default,
    GetAccountBalancesAtStateVersionService.Default,
    GetAccountAddressesService.Default,
    UpsertAccountBalancesService.Default,
    ConfigService.Default,
    AccountBalanceState.Default,
    GetAccountBalancesAtStateVersionV2.Default,
  ],
  effect: Effect.gen(function* () {
    const getLedgerState = yield* GetLedgerStateService;
    const getAccountAddresses = yield* GetAccountAddressesService;
    const upsertAccountBalances = yield* UpsertAccountBalancesService;
    const configService = yield* ConfigService;
    const getAccountBalancesAtStateVersionV2 =
      yield* GetAccountBalancesAtStateVersionV2;
    const accountBalanceState = yield* AccountBalanceState;

    const SKIP_STATE_VERSION_CHECK = yield* Config.boolean(
      'SKIP_STATE_VERSION_CHECK',
    ).pipe(Config.withDefault(false));

    const DEFAULT_BATCH_SIZE = yield* Config.number('SNAPSHOT_BATCH_SIZE').pipe(
      Config.withDefault(30_000),
    );

    // prevents snapshot from running if it's ahead of the latest processed state version
    const verifyStateVersion = Effect.fn(function* (
      snapshotStateVersion: number,
    ) {
      if (SKIP_STATE_VERSION_CHECK) return;

      const latestProcessedStateVersion =
        yield* configService.getStateVersion(false);

      if (!latestProcessedStateVersion) {
        return yield* new SnapshotError({
          message: 'No state version found, check if streamer is running',
        });
      }

      if (snapshotStateVersion > latestProcessedStateVersion) {
        return yield* new SnapshotError({
          message:
            'Snapshot state version is ahead of the latest processed state version',
        });
      }
    });

    const validateInput = Effect.fn('validateInput')(function* (
      input: SnapshotInput,
    ) {
      const parsedInput = SnapshotInputSchema.safeParse(input);
      if (!parsedInput.success) {
        return yield* new InvalidInputError({
          message: parsedInput.error.message,
          error: parsedInput.error,
        });
      }
      return parsedInput.data;
    });

    return (input: SnapshotInput) =>
      Effect.gen(function* () {
        const batchSize = input.batchSize ?? DEFAULT_BATCH_SIZE;

        yield* Effect.log(`starting snapshot at timestamp: ${input.timestamp}`);

        yield* validateInput(input);

        const lederState = yield* getLedgerState({
          at_ledger_state: {
            timestamp: input.timestamp,
          },
        });

        yield* verifyStateVersion(lederState.state_version).pipe(
          Effect.retry(Schedule.exponential('500 millis')),
          Effect.timeout('60 seconds'),
        );

        const accountAddresses =
          input.addresses ??
          (yield* getAccountAddresses({
            createdAt: input.timestamp,
          }));

        // Split accounts into batches
        const accountBatches = chunker(accountAddresses, batchSize);

        yield* Effect.log(
          `processing accounts in batches, total accounts: ${accountAddresses.length}, number of batches: ${accountBatches.length}`,
        );

        const validatorStateRef =
          yield* accountBalanceState.makeValidatorsState;

        yield* Effect.forEach(
          accountBatches,
          (accountsAddresses, batchIndex) =>
            Effect.gen(function* () {
              const accountBalances = yield* getAccountBalancesAtStateVersionV2(
                {
                  addresses: accountsAddresses,
                  stateVersion: StateVersion(lederState.state_version),
                },
              ).pipe(
                Effect.provideService(ValidatorsState, validatorStateRef),
                Effect.map((item) =>
                  pipe(
                    A.fromRecord(item),
                    A.map(([accountAddress, data]) => ({
                      accountAddress,
                      timestamp: input.timestamp,
                      data: A.fromRecord(data).map(
                        ([activityId, usdValue]) => ({
                          activityId,
                          usdValue,
                        }),
                      ),
                    })),
                  ),
                ),
              );

              yield* Effect.log(`adding account balances to database`);
              yield* upsertAccountBalances(accountBalances);
            }).pipe(Effect.annotateLogs('batchIndex', `${batchIndex + 1}`)),
          // discard the result of the effect to reduce memory usage
          { discard: true },
        );

        yield* Effect.log(`snapshot completed`);
      }).pipe(Effect.annotateLogs('jobId', input.jobId));
  }),
}) {}
