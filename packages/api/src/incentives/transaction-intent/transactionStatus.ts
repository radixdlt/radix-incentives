import type { TransactionStatusResponse } from '@radixdlt/babylon-gateway-api-sdk';
import {
  Config,
  ConfigProvider,
  Data,
  Duration,
  Effect,
  Layer,
  Schedule,
} from 'effect';
import { GatewayApiClientService } from '../../common/gateway';
import type { NetworkId, TransactionId } from './schemas';

class TransactionNotResolvedError extends Data.TaggedError(
  'TransactionNotResolvedError',
)<{
  status: TransactionStatusResponse['intent_status'];
  statusDescription: string;
  message: null | undefined | string;
  transactionId: TransactionId;
}> {}

class TransactionFailedError extends Data.TaggedError(
  'TransactionFailedError',
)<{
  status: TransactionStatusResponse['intent_status'];
  statusDescription: string;
  message: null | undefined | string;
  transactionId: TransactionId;
}> {}

class TimeoutError extends Data.TaggedError('TimeoutError')<{
  transactionId: TransactionId;
}> {}

export class TransactionStatus extends Effect.Service<TransactionStatus>()(
  'TransactionStatus',
  {
    effect: Effect.gen(function* () {
      const pollTimeoutDuration = yield* Config.duration(
        'TRANSACTION_STATUS_POLL_TIMEOUT',
      ).pipe(Config.withDefault(Duration.minutes(1)), Effect.orDie);

      const maxPollAttempts = yield* Config.number(
        'TRANSACTION_STATUS_MAX_POLL_ATTEMPTS_COUNT',
      ).pipe(Config.withDefault(10), Effect.orDie);

      const pollDelay = yield* Config.duration(
        'TRANSACTION_STATUS_POLL_DELAY',
      ).pipe(Config.withDefault(Duration.millis(100)), Effect.orDie);

      const retryPolicy = Schedule.exponential(pollDelay).pipe(
        Schedule.compose(Schedule.recurs(maxPollAttempts)),
      );

      const getTransactionStatus = (input: {
        id: TransactionId;
        networkId: NetworkId;
      }) =>
        Effect.gen(function* () {
          const gatewayApiClient = yield* GatewayApiClientService;
          const result =
            yield* gatewayApiClient.transaction.innerClient.transactionStatus({
              transactionStatusRequest: {
                intent_hash: input.id,
              },
            });

          const { intent_status } = result;

          if (intent_status === 'CommittedSuccess') return result;

          if (
            intent_status === 'CommittedFailure' ||
            intent_status === 'PermanentlyRejected'
          )
            return yield* new TransactionFailedError({
              status: intent_status,
              statusDescription: result.intent_status_description,
              message: result.error_message,
              transactionId: input.id,
            });

          return yield* new TransactionNotResolvedError({
            status: intent_status,
            statusDescription: result.intent_status_description,
            message: result.error_message,
            transactionId: input.id,
          });
        }).pipe(
          Effect.provide(GatewayApiClientService.Default),
          Effect.provide(
            Layer.setConfigProvider(
              ConfigProvider.fromJson({ NETWORK_ID: input.networkId }),
            ),
          ),
        );

      return {
        poll: (input: { id: TransactionId; networkId: NetworkId }) =>
          getTransactionStatus(input).pipe(
            Effect.tapErrorTag('TransactionFailedError', Effect.logError),
            Effect.retry({
              schedule: retryPolicy,
              while: (error) => error._tag === 'TransactionNotResolvedError',
            }),
            Effect.timeout(pollTimeoutDuration),
            Effect.catchTags({
              ConfigError: Effect.die,
              TimeoutException: () =>
                new TimeoutError({ transactionId: input.id }),
            }),
          ),
      };
    }),
  },
) {}
