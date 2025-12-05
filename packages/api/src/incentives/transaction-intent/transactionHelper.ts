import {
  Array as A,
  ConfigProvider,
  Context,
  Data,
  Effect,
  Layer,
  Option,
  pipe,
  Record as R,
  Ref,
  Schema,
} from 'effect';
import { GatewayApiClientService } from '../../common/gateway';
import { Amount, FungibleResourceAddress } from '../account-balance/v2/schemas';
import { CompileTransaction } from './compileTransaction';
import { CreateTransactionIntent } from './createTransactionIntent';
import { createBadge as createBadgeManifest } from './manifests/createBadge';
import { faucet as faucetManifest } from './manifests/faucet';
import { ManifestHelper } from './manifests/manifestHelper';
import {
  type Account,
  NetworkId,
  type TransactionId,
  TransactionManifestString,
} from './schemas';
import { Signer } from './singer/signer';
import { SubmitTransaction } from './submitTransaction';
import { TransactionStatus } from './transactionStatus';

export const TransactionHelperConfigSchema = Schema.Struct({
  networkId: NetworkId,
});
export class TransactionHelperConfig extends Context.Tag(
  'TransactionHelperConfig',
)<
  TransactionHelperConfig,
  Ref.Ref<typeof TransactionHelperConfigSchema.Type>
>() {
  static provide = (config: typeof TransactionHelperConfigSchema.Type) =>
    Layer.effect(TransactionHelperConfig, Ref.make(config));
}

export class FaucetNotAvailableError extends Data.TaggedError(
  'FaucetNotAvailableError',
)<{
  message: string;
}> {}

export class TransactionHelper extends Effect.Service<TransactionHelper>()(
  'TransactionHelper',
  {
    dependencies: [
      CreateTransactionIntent.Default,
      CompileTransaction.Default,
      SubmitTransaction.Default,
      TransactionStatus.Default,
      ManifestHelper.Default,
    ],
    effect: Effect.gen(function* () {
      const createTransactionIntent = yield* CreateTransactionIntent;
      const compileTransaction = yield* CompileTransaction;
      const submitTransactionToNetwork = yield* SubmitTransaction;
      const transactionStatus = yield* TransactionStatus;
      const signer = yield* Signer;
      const manifestHelper = yield* ManifestHelper;
      const configRef = yield* TransactionHelperConfig;
      const { networkId } = yield* Ref.get(configRef);
      const gatewayApiClient = yield* GatewayApiClientService.pipe(
        Effect.provide(
          GatewayApiClientService.Default.pipe(
            Layer.provide(
              Layer.setConfigProvider(
                ConfigProvider.fromJson({ NETWORK_ID: networkId }),
              ),
            ),
          ),
        ),
      );

      const submitTransaction = (input: {
        manifest: TransactionManifestString;
        feePayer?: { account: Account; amount: Amount };
      }) =>
        Effect.gen(function* () {
          const feePayerInstructions = input.feePayer
            ? yield* manifestHelper.addFeePayer(input.feePayer)
            : '';

          yield* Effect.log('Creating transaction intent');
          const manifestWithFeePayer = TransactionManifestString.make(`
            ${feePayerInstructions}
            ${input.manifest}
          `);

          const { intent, id, intentHash } = yield* createTransactionIntent({
            networkId,
            manifest: manifestWithFeePayer,
          });

          return yield* Effect.gen(function* () {
            yield* Effect.log('Collecting signatures');
            const signatures = yield* signer(intentHash);

            const compiledTransaction = yield* compileTransaction({
              intent,
              signatures,
            });

            yield* Effect.log('Submitting transaction to network');
            yield* submitTransactionToNetwork({
              networkId,
              compiledTransaction: compiledTransaction,
            });

            return yield* transactionStatus
              .poll({
                id,
                networkId,
              })
              .pipe(Effect.map((status) => ({ statusResponse: status, id })));
          }).pipe(Effect.annotateLogs('transactionId', id));
        }).pipe(
          Effect.annotateLogs({
            networkId,
            feePayer: input.feePayer?.account.address,
          }),
        );

      const getCommittedDetails = (input: { id: TransactionId }) =>
        Effect.gen(function* () {
          return yield* gatewayApiClient.transaction.getCommittedDetails(
            input.id,
          );
        });

      const createBadge = (input: { account: Account; feePayer: Account }) =>
        Effect.gen(function* () {
          return yield* submitTransaction({
            manifest: createBadgeManifest(input.account),
            feePayer: {
              account: input.feePayer,
              amount: Amount('10'),
            },
          }).pipe(
            Effect.flatMap(({ id }) =>
              getCommittedDetails({
                id,
              }),
            ),
            Effect.map((result) =>
              pipe(
                Option.fromNullable(
                  result.transaction.balance_changes?.fungible_balance_changes,
                ),
                Option.flatMap(A.head),
                Option.flatMap(R.get('resource_address')),
                Option.getOrThrow,
                FungibleResourceAddress,
              ),
            ),
          );
        });

      const faucet = (input: { account: Account }) =>
        Effect.gen(function* () {
          if (networkId !== 2) {
            return yield* new FaucetNotAvailableError({
              message: 'Faucet is only available on Stokenet',
            }).pipe(Effect.die);
          }
          return yield* submitTransaction({
            manifest: yield* faucetManifest(input.account.address),
          });
        });

      return {
        submitTransaction,
        getCommittedDetails,
        createBadge,
        faucet,
      };
    }),
  },
) {}
