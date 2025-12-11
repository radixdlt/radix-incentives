import { ConfigProvider, Data, Effect, Layer } from 'effect';
import { GetLedgerStateService } from '../../common/gateway';
import {
  Epoch,
  type NetworkId,
  type TransactionId,
} from '../schemas/brandedTypes';
import type { TransactionIntent } from './schemas';

export class InvalidEndEpochError extends Data.TaggedError(
  'InvalidEndEpochError',
)<{
  message: string;
  transactionId: TransactionId;
}> {}

export class InvalidStartEpochError extends Data.TaggedError(
  'InvalidStartEpochError',
)<{
  message: string;
  transactionId: TransactionId;
}> {}

export class EpochService extends Effect.Service<EpochService>()(
  'EpochService',
  {
    effect: Effect.gen(function* () {
      const getCurrentEpoch = (networkId: NetworkId) =>
        Effect.gen(function* () {
          const getLedgerStateService = yield* GetLedgerStateService;
          return yield* getLedgerStateService({
            at_ledger_state: {
              timestamp: new Date(),
            },
          }).pipe(Effect.map((ledgerState) => Epoch.make(ledgerState.epoch)));
        }).pipe(
          Effect.provide(GetLedgerStateService.Default),
          Effect.provide(
            Layer.setConfigProvider(
              ConfigProvider.fromJson({ NETWORK_ID: networkId }),
            ),
          ),
        );

      return {
        getCurrentEpoch,
        verifyEpochBounds: (input: {
          transactionId: TransactionId;
          transactionIntent: TransactionIntent;
        }) =>
          Effect.gen(function* () {
            const currentEpoch = yield* getCurrentEpoch(
              input.transactionIntent.header.networkId,
            );

            if (
              currentEpoch < input.transactionIntent.header.startEpochInclusive
            ) {
              return yield* new InvalidStartEpochError({
                message: `Current epoch ${currentEpoch} is less than start epoch ${input.transactionIntent.header.startEpochInclusive}`,
                transactionId: input.transactionId,
              });
            }

            if (
              currentEpoch >= input.transactionIntent.header.endEpochExclusive
            ) {
              return yield* new InvalidEndEpochError({
                message: `Current epoch ${currentEpoch} is greater than or equal to end epoch ${input.transactionIntent.header.endEpochExclusive}`,
                transactionId: input.transactionId,
              });
            }
          }),
      };
    }),
  },
) {}
