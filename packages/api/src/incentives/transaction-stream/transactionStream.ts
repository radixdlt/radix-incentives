import { Context, Layer, Effect } from "effect";
import type {
  createTransactionStream,
  TransactionStream,
} from "radix-transaction-stream";

import { LoggerService } from "../../common/logger/logger";

import type { CommittedTransactionInfo } from "@radixdlt/babylon-gateway-api-sdk";

type TransformTransactionResultOutput = ReturnType<
  Awaited<ReturnType<TransactionStream["next"]>>["_unsafeUnwrap"]
>;

class StateVersionBeyondEndOfKnownLedgerError {
  readonly _tag = "StateVersionBeyondEndOfKnownLedgerError";
  constructor(readonly error: unknown) {}
}

class RateLimitedError {
  readonly _tag = "RateLimitedError";
  constructor(readonly error: unknown) {}
}

class UnknownTransactionStreamError {
  readonly _tag = "UnknownTransactionStreamError";
  constructor(readonly error: unknown) {}
}

export class TransactionStreamService extends Context.Tag("TransactionStream")<
  TransactionStreamService,
  (stateVersion: number) => Effect.Effect<
    {
      transactions: CommittedTransactionInfo[];
      stateVersion: number;
    },
    | StateVersionBeyondEndOfKnownLedgerError
    | RateLimitedError
    | UnknownTransactionStreamError
  >
>() {}

export const TransactionStreamLive = (
  transactionStreamClient: ReturnType<typeof createTransactionStream>
) =>
  Layer.effect(
    TransactionStreamService,
    Effect.gen(function* () {
      const logger = yield* LoggerService;

      let backoffMs = 1000;
      const MAX_BACKOFF_MS = 30000;

      const resetBackoff = () => {
        backoffMs = 1000;
      };

      return (stateVersion: number) =>
        Effect.gen(function* () {
          const exponentialBackoff = () => {
            logger.debug(`sleeping for ${backoffMs}ms`);
            return Effect.sleep(backoffMs).pipe(
              Effect.tap(() => {
                logger.debug("waking up");
                backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
              }),

              Effect.map(() => ({
                transactions: [],
                stateVersion,
              }))
            );
          };

          transactionStreamClient.setStateVersion(stateVersion);

          const result = yield* Effect.tryPromise({
            try: () => transactionStreamClient.next(),
            catch: (e) => new UnknownTransactionStreamError(e),
          }).pipe(
            Effect.flatMap(
              (
                result
              ): Effect.Effect<
                TransformTransactionResultOutput,
                | StateVersionBeyondEndOfKnownLedgerError
                | RateLimitedError
                | UnknownTransactionStreamError
              > => {
                if (result.isOk()) return Effect.succeed(result.value);

                const error = result.error;

                const isStateVersionBeyondEndOfKnownLedgerError =
                  typeof error === "object" &&
                  error !== null &&
                  "parsedError" in error &&
                  error.parsedError === "StateVersionBeyondEndOfKnownLedger";

                const isRateLimitedError =
                  typeof error === "object" &&
                  error !== null &&
                  "status" in error &&
                  error.status === 429;

                if (isStateVersionBeyondEndOfKnownLedgerError)
                  return Effect.fail(
                    new StateVersionBeyondEndOfKnownLedgerError(error)
                  );

                if (isRateLimitedError)
                  return Effect.fail(new RateLimitedError(error));

                return Effect.fail(new UnknownTransactionStreamError(error));
              }
            ),
            Effect.catchTags({
              RateLimitedError: () => {
                logger.debug("Rate limited, waiting...");
                return exponentialBackoff();
              },
              StateVersionBeyondEndOfKnownLedgerError: () => {
                logger.debug("Reached the end of the ledger, waiting...");
                return exponentialBackoff();
              },
              UnknownTransactionStreamError: (error) => {
                logger.debug("Unknown transaction stream error, waiting...");
                logger.error({ error: error });
                return exponentialBackoff();
              },
            })
          );

          resetBackoff();

          return {
            transactions: result.transactions,
            stateVersion: result.stateVersion,
          };
        });
    })
  );
