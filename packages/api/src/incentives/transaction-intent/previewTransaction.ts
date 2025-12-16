import type { TransactionReceipt } from '@radixdlt/babylon-core-api-sdk';
import type { TransactionPreviewOperationRequest } from '@radixdlt/babylon-gateway-api-sdk';
import { ConfigProvider, Data, Effect, Layer } from 'effect';
import { GatewayApiClientService } from '../../common/gateway';
import type { NetworkId } from '../schemas/brandedTypes';

class TransactionPreviewError extends Data.TaggedError(
  'TransactionPreviewError',
)<{
  message?: string;
}> {}

export const previewTransaction = (input: {
  payload: TransactionPreviewOperationRequest['transactionPreviewRequest'];
  networkId: NetworkId;
}) =>
  Effect.gen(function* () {
    const gatewayApiClient = yield* GatewayApiClientService.pipe(
      Effect.provide(GatewayApiClientService.Default),
    );

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
    Effect.provide(
      Layer.setConfigProvider(
        ConfigProvider.fromJson({ NETWORK_ID: input.networkId }),
      ),
    ),
  );
