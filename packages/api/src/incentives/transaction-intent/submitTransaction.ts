import { Convert } from '@radixdlt/radix-engine-toolkit';
import { ConfigProvider, Effect, Layer, pipe } from 'effect';
import { HexString, type NetworkId } from 'shared/brandedTypes';
import { GatewayApiClientService } from '../../common/gateway';

export class SubmitTransaction extends Effect.Service<SubmitTransaction>()(
  'SubmitTransaction',
  {
    effect: Effect.gen(function* () {
      const submitTransaction = (input: {
        payload: HexString;
        networkId: NetworkId;
      }) =>
        Effect.gen(function* () {
          const gatewayApiClient = yield* GatewayApiClientService;

          return yield* gatewayApiClient.transaction.innerClient.transactionSubmit(
            {
              transactionSubmitRequest: {
                notarized_transaction_hex: input.payload,
              },
            },
          );
        }).pipe(
          Effect.provide(GatewayApiClientService.Default),
          Effect.provide(
            Layer.setConfigProvider(
              ConfigProvider.fromJson({ NETWORK_ID: input.networkId }),
            ),
          ),
        );

      return (input: {
        networkId: NetworkId;
        compiledTransaction: Uint8Array<ArrayBufferLike>;
      }) =>
        Effect.gen(function* () {
          const notarizedTransactionHex = pipe(
            Convert.Uint8Array.toHexString(input.compiledTransaction),
            HexString.make,
          );

          return yield* submitTransaction({
            networkId: input.networkId,
            payload: notarizedTransactionHex,
          });
        });
    }),
  },
) {}
