import type { TransactionReceipt } from '@radixdlt/babylon-core-api-sdk';
import type { TransactionPreviewOperationRequest } from '@radixdlt/babylon-gateway-api-sdk';
import { ConfigProvider, Data, Effect, Layer, Option, Schema } from 'effect';
import { GatewayApiClientService } from '../../common/gateway';
import {
  Epoch,
  NetworkId,
  TransactionManifestString,
  TransactionMessageString,
} from '../schemas/brandedTypes';
import {
  ManifestSchema,
  TransactionIntentSchema,
  TransactionMessageSchema,
} from './schemas';
import { StaticallyValidateManifest } from './staticallyValidateManifest';
import { TransactionHeader } from './transactionHeader';

class TransactionPreviewError extends Data.TaggedError(
  'TransactionPreviewError',
)<{
  message?: string;
}> {}

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

          return TransactionIntentSchema.make(transactionIntent);
        });
    }),
  },
) {}
