import type { TransactionReceipt } from '@radixdlt/babylon-core-api-sdk';
import type { TransactionPreviewOperationRequest } from '@radixdlt/babylon-gateway-api-sdk';
import {
  Convert,
  type Intent,
  RadixEngineToolkit,
} from '@radixdlt/radix-engine-toolkit';
import {
  ConfigProvider,
  Data,
  Effect,
  Layer,
  Option,
  pipe,
  Schema,
} from 'effect';
import { GatewayApiClientService } from '../../common/gateway';
import {
  Epoch,
  HexString,
  NetworkId,
  StringManifestSchema,
  TransactionId,
  TransactionIntentSchema,
  TransactionManifestString,
  TransactionMessage,
  TransactionMessageSchema,
} from './schemas';
import { StaticallyValidateManifest } from './staticallyValidateManifest';
import { TransactionHeader } from './transactionHeader';

class FailedToCreateIntentHashError extends Data.TaggedError(
  'FailedToCreateIntentHashError',
)<{
  error: unknown;
}> {}

class TransactionPreviewError extends Data.TaggedError(
  'TransactionPreviewError',
)<{
  message?: string;
}> {}

const CreateTransactionIntentInputSchema = Schema.Struct({
  networkId: Schema.Number.pipe(Schema.fromBrand(NetworkId)),
  startEpochInclusive: Schema.optional(
    Schema.Number.pipe(Schema.fromBrand(Epoch)),
  ),
  endEpochExclusive: Schema.optional(
    Schema.Number.pipe(Schema.fromBrand(Epoch)),
  ),
  manifest: Schema.String.pipe(Schema.fromBrand(TransactionManifestString)),
  message: Schema.optional(
    Schema.String.pipe(Schema.fromBrand(TransactionMessage)),
  ),
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

      const previewTransaction = (input: {
        payload: TransactionPreviewOperationRequest['transactionPreviewRequest'];
        networkId: NetworkId;
      }) =>
        Effect.gen(function* () {
          const gatewayApiClient = yield* GatewayApiClientService;

          const result =
            yield* gatewayApiClient.transaction.innerClient.transactionPreview({
              transactionPreviewRequest: input.payload,
            });

          const receipt = result.receipt as TransactionReceipt;

          if (receipt.status !== 'Succeeded')
            return yield* new TransactionPreviewError({
              message: receipt.error_message,
            });

          return result;
        }).pipe(
          Effect.provide(GatewayApiClientService.Default),
          Effect.provide(
            Layer.setConfigProvider(
              ConfigProvider.fromJson({ NETWORK_ID: input.networkId }),
            ),
          ),
        );

      const createIntentHash = (input: Intent) =>
        Effect.tryPromise({
          try: () => RadixEngineToolkit.Intent.hash(input),
          catch: (error) => {
            console.error(error);
            return new FailedToCreateIntentHashError({ error });
          },
        }).pipe(
          Effect.map((hash) => ({
            id: TransactionId(hash.id),
            hash: pipe(Convert.Uint8Array.toHexString(hash.hash), HexString),
          })),
        );

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

          const manifest = yield* Schema.decodeUnknown(StringManifestSchema)(
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

          const intentHash = yield* createIntentHash(transactionIntent);

          yield* previewTransaction({
            payload: {
              manifest: manifest.instructions.value,
              nonce: 1,
              signer_public_keys: [],
              end_epoch_exclusive: header.endEpochExclusive,
              start_epoch_inclusive: header.startEpochInclusive,
              flags: {
                skip_epoch_check: true,
                assume_all_signature_proofs: true,
                use_free_credit: true,
              },
            },
            networkId,
          });

          return {
            id: intentHash.id,
            intentHash: intentHash.hash,
            intent: yield* Schema.encodeUnknown(TransactionIntentSchema)(
              transactionIntent,
            ),
          };
        });
    }),
  },
) {}
