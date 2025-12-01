import { ConfigProvider, Effect, Layer } from 'effect';
import { GatewayApiClientService } from '../../common/gateway';
import { CompileTransaction } from './compileTransaction';
import { CreateTransactionIntent } from './createTransactionIntent';
import type {
  NetworkId,
  TransactionId,
  TransactionManifestString,
} from './schemas';
import { Signer } from './signer';
import { SubmitTransaction } from './submitTransaction';
import { TransactionStatus } from './transactionStatus';

export class TransactionHelper extends Effect.Service<TransactionHelper>()(
  'TransactionHelper',
  {
    dependencies: [
      CreateTransactionIntent.Default,
      CompileTransaction.Default,
      SubmitTransaction.Default,
      TransactionStatus.Default,
    ],
    effect: Effect.gen(function* () {
      const createTransactionIntent = yield* CreateTransactionIntent;
      const compileTransaction = yield* CompileTransaction;
      const submitTransactionToNetwork = yield* SubmitTransaction;
      const transactionStatus = yield* TransactionStatus;
      const signer = yield* Signer;

      const submitTransaction = (input: {
        networkId: NetworkId;
        manifest: TransactionManifestString;
      }) =>
        Effect.gen(function* () {
          yield* Effect.log('Creating transaction intent');
          const { intent, id, intentHash } = yield* createTransactionIntent({
            networkId: input.networkId,
            manifest: input.manifest,
          });

          return yield* Effect.gen(function* () {
            yield* Effect.log('Signing transaction');
            const signatures = yield* signer(intentHash);

            yield* Effect.log('Compiling transaction');
            const compiledTransaction = yield* compileTransaction({
              intent,
              signatures,
            });

            yield* Effect.log('Submitting transaction');
            yield* submitTransactionToNetwork({
              networkId: input.networkId,
              compiledTransaction: compiledTransaction,
            });

            yield* Effect.log('Polling transaction status');
            return yield* transactionStatus
              .poll({
                id,
                networkId: input.networkId,
              })
              .pipe(Effect.map((status) => ({ statusResponse: status, id })));
          }).pipe(Effect.annotateLogs('transactionId', id));
        }).pipe(Effect.annotateLogs('networkId', input.networkId));

      const getCommittedDetails = (input: {
        id: TransactionId;
        networkId: NetworkId;
      }) =>
        Effect.gen(function* () {
          const gatewayApiClient = yield* GatewayApiClientService;
          return yield* gatewayApiClient.transaction.getCommittedDetails(
            input.id,
          );
        }).pipe(
          Effect.provide(GatewayApiClientService.Default),
          Effect.provide(
            Layer.setConfigProvider(
              ConfigProvider.fromJson({ NETWORK_ID: input.networkId }),
            ),
          ),
        );

      return {
        submitTransaction,
        getCommittedDetails,
      };
    }),
  },
) {}
