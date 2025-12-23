import { generateRandomNonce } from '@radixdlt/radix-engine-toolkit';
import { Data, Effect, Option, pipe } from 'effect';
import { Epoch, type NetworkId, Nonce } from 'shared/brandedTypes';
import { GetLedgerStateService } from '../../common/gateway';
import { EpochService } from './epoch';
import { NotaryKeyPair } from './notaryKeyPair';
import { TransactionHeaderSchema } from './schemas';

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
    dependencies: [
      GetLedgerStateService.Default,
      NotaryKeyPair.Default,
      EpochService.Default,
    ],
    effect: Effect.gen(function* () {
      const notaryKeyPair = yield* NotaryKeyPair;
      const epochService = yield* EpochService;

      const generateNonce = () => pipe(generateRandomNonce(), Nonce.make);

      return (input: CreateTransactionHeaderInput) =>
        Effect.gen(function* () {
          const {
            tipPercentage = 0,
            nonce = generateNonce(),
            notaryIsSignatory = false,
          } = input;

          const currentEpoch = yield* epochService.getCurrentEpoch(
            input.networkId,
          );

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
            onNone: () => Epoch.make(currentEpoch + 2),
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
        });
    }),
  },
) {}
