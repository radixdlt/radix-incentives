import { generateRandomNonce } from '@radixdlt/radix-engine-toolkit';
import { ConfigProvider, Data, Effect, Layer, Option, pipe } from 'effect';
import { GetLedgerStateService } from '../../common/gateway';
import { NotaryKeyPair } from './notaryKeyPair';
import {
  Epoch,
  type NetworkId,
  Nonce,
  TransactionHeaderSchema,
} from './schemas';

export class InvalidEpochError extends Data.TaggedError('InvalidEpochError')<{
  message: string;
}> {}

export type CreateTransactionHeaderInput = {
  networkId: NetworkId;
  startEpochInclusive: Option.Option<Epoch>;
  endEpochExclusive: Option.Option<Epoch>;
  tipPercentage?: number;
  nonce?: Nonce;
  notaryIsSignatory?: boolean;
};

export class TransactionHeader extends Effect.Service<TransactionHeader>()(
  'TransactionHeader',
  {
    dependencies: [GetLedgerStateService.Default, NotaryKeyPair.Default],
    effect: Effect.gen(function* () {
      const notaryKeyPair = yield* NotaryKeyPair;

      const generateNonce = () => pipe(generateRandomNonce(), Nonce.make);

      return (input: CreateTransactionHeaderInput) =>
        Effect.gen(function* () {
          const getLedgerStateService = yield* GetLedgerStateService;

          const {
            tipPercentage = 0,
            nonce = generateNonce(),
            notaryIsSignatory = false,
          } = input;

          const getCurrentEpoch = () =>
            getLedgerStateService({
              at_ledger_state: {
                timestamp: new Date(),
              },
            }).pipe(Effect.map((ledgerState) => Epoch.make(ledgerState.epoch)));

          const currentEpoch = yield* getCurrentEpoch();

          const startEpochInclusive = Option.match(input.startEpochInclusive, {
            onSome: (epoch) => epoch,
            onNone: () => currentEpoch,
          });

          if (currentEpoch < startEpochInclusive)
            return yield* new InvalidEpochError({
              message: `Current epoch ${currentEpoch} is less than start epoch ${input.startEpochInclusive}`,
            });

          const endEpochExclusive = Option.match(input.endEpochExclusive, {
            onSome: (epoch) => epoch,
            onNone: () => Epoch.make(currentEpoch + 10),
          });

          if (currentEpoch >= endEpochExclusive)
            return yield* new InvalidEpochError({
              message: `Current epoch ${currentEpoch} is greater than or equal to end epoch ${input.endEpochExclusive}`,
            });

          const notaryPublicKey = yield* notaryKeyPair.publicKey();

          return TransactionHeaderSchema.make({
            networkId: input.networkId,
            startEpochInclusive,
            endEpochExclusive,
            notaryPublicKey: notaryPublicKey,
            nonce,
            notaryIsSignatory,
            tipPercentage,
          });
        }).pipe(
          Effect.provide(GetLedgerStateService.Default),
          Effect.provide(
            Layer.setConfigProvider(
              ConfigProvider.fromJson({ NETWORK_ID: input.networkId }),
            ),
          ),
        );
    }),
  },
) {}
