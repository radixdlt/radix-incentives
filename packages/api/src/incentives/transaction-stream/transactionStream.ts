import { Effect } from 'effect';
import {
  createTransactionStream,
  type TransactionStream,
} from 'radix-transaction-stream';
import { createRadixNetworkClient } from 'radix-web3.js';
import { GatewayApiClientService } from '../../common/gateway';

type TransformTransactionResultOutput = ReturnType<
  Awaited<ReturnType<TransactionStream['next']>>['_unsafeUnwrap']
>;

class StateVersionBeyondEndOfKnownLedgerError {
  readonly _tag = 'StateVersionBeyondEndOfKnownLedgerError';
  constructor(readonly error: unknown) {}
}

class RateLimitedError {
  readonly _tag = 'RateLimitedError';
  constructor(readonly error: unknown) {}
}

class UnknownTransactionStreamError {
  readonly _tag = 'UnknownTransactionStreamError';
  constructor(readonly error: unknown) {}
}

export class TransactionStreamService extends Effect.Service<TransactionStreamService>()(
  'TransactionStreamService',
  {
    effect: Effect.gen(function* () {
      let backoffMs = 1000;
      const MAX_BACKOFF_MS = 30000;

      const resetBackoff = () => {
        backoffMs = 1000;
      };

      const transactionStreamClient = createTransactionStream({
        gatewayApi: createRadixNetworkClient({
          networkId: 1,
          gatewayApiClient: (yield* GatewayApiClientService).rawClient,
        }),
        optIns: {
          detailed_events: true,
          balance_changes: true,
          manifest_instructions: true,
        },
        startStateVersion: 1,
      });

      return Effect.fn(function* (stateVersion: number) {
        // Implementation goes here
        const exponentialBackoff = () => {
          console.log(`sleeping for ${backoffMs}ms`);
          return Effect.sleep(backoffMs).pipe(
            Effect.tap(() => {
              console.log('waking up');
              backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
            }),

            Effect.map(() => ({
              transactions: [],
              stateVersion,
            })),
          );
        };

        transactionStreamClient.setStateVersion(stateVersion);

        const result = yield* Effect.tryPromise({
          try: () => transactionStreamClient.next(),
          catch: (e) => new UnknownTransactionStreamError(e),
        }).pipe(
          Effect.flatMap(
            (
              result,
            ): Effect.Effect<
              TransformTransactionResultOutput,
              | StateVersionBeyondEndOfKnownLedgerError
              | RateLimitedError
              | UnknownTransactionStreamError
            > => {
              if (result.isOk()) return Effect.succeed(result.value);

              const error = result.error;

              const isStateVersionBeyondEndOfKnownLedgerError =
                typeof error === 'object' &&
                error !== null &&
                'parsedError' in error &&
                error.parsedError === 'StateVersionBeyondEndOfKnownLedger';

              const isRateLimitedError =
                typeof error === 'object' &&
                error !== null &&
                'status' in error &&
                error.status === 429;

              if (isStateVersionBeyondEndOfKnownLedgerError)
                return Effect.fail(
                  new StateVersionBeyondEndOfKnownLedgerError(error),
                );

              if (isRateLimitedError)
                return Effect.fail(new RateLimitedError(error));

              return Effect.fail(new UnknownTransactionStreamError(error));
            },
          ),
          Effect.catchTags({
            RateLimitedError: () => {
              console.log('Rate limited, waiting...');
              return exponentialBackoff();
            },
            StateVersionBeyondEndOfKnownLedgerError: () => {
              console.log('Reached the end of the ledger, waiting...');
              return exponentialBackoff();
            },
            UnknownTransactionStreamError: (error) => {
              console.log('Unknown transaction stream error, waiting...');
              console.error({ error: error });
              return exponentialBackoff();
            },
          }),
        );

        resetBackoff();

        return {
          transactions: result.transactions,
          stateVersion: result.stateVersion,
        };
      });
    }),
  },
) {}
