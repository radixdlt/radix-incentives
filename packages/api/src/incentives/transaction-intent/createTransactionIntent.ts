import { Effect, Option, Schema } from 'effect';
import {
  Epoch,
  NetworkId,
  TransactionManifestString,
  TransactionMessageString,
} from 'shared/brandedTypes';
import {
  ManifestSchema,
  TransactionIntentSchema,
  TransactionMessageSchema,
} from './schemas';
import { StaticallyValidateManifest } from './staticallyValidateManifest';
import { TransactionHeader } from './transactionHeader';

const CreateTransactionIntentInputSchema = Schema.Struct({
  networkId: NetworkId,
  startEpochInclusive: Schema.optional(Epoch),
  endEpochExclusive: Schema.optional(Epoch),
  manifest: TransactionManifestString,
  message: Schema.optional(TransactionMessageString),
  tipPercentage: Schema.optional(Schema.Number),
});

type CreateTransactionIntentInput =
  typeof CreateTransactionIntentInputSchema.Type;

export class CreateTransactionIntent extends Effect.Service<CreateTransactionIntent>()(
  'CreateTransactionIntent',
  {
    dependencies: [
      StaticallyValidateManifest.Default,
      TransactionHeader.Default,
    ],
    effect: Effect.gen(function* () {
      const staticallyValidateManifest = yield* StaticallyValidateManifest;
      const createTransactionHeader = yield* TransactionHeader;

      return (input: CreateTransactionIntentInput) =>
        Effect.gen(function* () {
          const parsedInput = yield* Schema.decodeUnknown(
            CreateTransactionIntentInputSchema,
          )(input);

          const networkId = parsedInput.networkId;

          const header = yield* createTransactionHeader({
            networkId: parsedInput.networkId,
            startEpochInclusive: Option.fromNullable(
              parsedInput.startEpochInclusive,
            ),
            endEpochExclusive: Option.fromNullable(
              parsedInput.endEpochExclusive,
            ),
          });

          const message = yield* Schema.decodeUnknown(TransactionMessageSchema)(
            parsedInput.message,
          );

          const manifest = yield* Schema.decodeUnknown(ManifestSchema)(
            parsedInput.manifest,
          );

          const transactionIntent = {
            header,
            message,
            manifest,
          };

          yield* staticallyValidateManifest({
            manifest,
            networkId,
          });

          return TransactionIntentSchema.make(transactionIntent);
        });
    }),
  },
) {}
