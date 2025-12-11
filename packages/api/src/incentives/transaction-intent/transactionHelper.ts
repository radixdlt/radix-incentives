import {
  Array as A,
  Cause,
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
import {
  NetworkId,
  type TransactionId,
  TransactionManifestString,
} from '../schemas/brandedTypes';
import { CompileTransaction } from './compileTransaction';
import { CreateTransactionIntent } from './createTransactionIntent';
import { EpochService } from './epoch';
import { IntentHashService } from './intentHash';
import { createBadge as createBadgeManifest } from './manifests/createBadge';
import { faucet as faucetManifest } from './manifests/faucet';
import { ManifestHelper } from './manifests/manifestHelper';
import type { Account, TransactionIntent } from './schemas';
import { Signer } from './signer/signer';
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

export class TransactionLifeCycleHook extends Context.Tag(
  'TransactionLifeCycleHook',
)<
  TransactionLifeCycleHook,
  {
    onSubmit?: (input: {
      id: TransactionId;
      intent: TransactionIntent;
    }) => Effect.Effect<void, never, never>;
    onSubmitSuccess?: (input: {
      id: TransactionId;
      intent: TransactionIntent;
    }) => Effect.Effect<void, never, never>;
    onStatusFailure?: (input: {
      id: TransactionId;
      permanent: boolean;
      intent: TransactionIntent;
    }) => Effect.Effect<void, never, never>;
    onSuccess?: (input: {
      id: TransactionId;
    }) => Effect.Effect<void, never, never>;
  }
>() {}

export class TransactionHelper extends Effect.Service<TransactionHelper>()(
  'TransactionHelper',
  {
    dependencies: [
      CreateTransactionIntent.Default,
      CompileTransaction.Default,
      SubmitTransaction.Default,
      TransactionStatus.Default,
      ManifestHelper.Default,
      IntentHashService.Default,
      EpochService.Default,
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
      const intentHashService = yield* IntentHashService;
      const epochService = yield* EpochService;
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
      const lifeCycleHook = yield* Effect.serviceOption(
        TransactionLifeCycleHook,
      );

      const onSubmitLifeCycleHook = lifeCycleHook.pipe(
        Option.flatMap((item) => Option.fromNullable(item.onSubmit)),
      );

      const onSubmitSuccessLifeCycleHook = lifeCycleHook.pipe(
        Option.flatMap((item) => Option.fromNullable(item.onSubmitSuccess)),
      );

      const onStatusFailureLifeCycleHook = lifeCycleHook.pipe(
        Option.flatMap((item) => Option.fromNullable(item.onStatusFailure)),
      );

      const onSuccessLifeCycleHook = lifeCycleHook.pipe(
        Option.flatMap((item) => Option.fromNullable(item.onSuccess)),
      );

      const submitTransaction = (input: {
        manifest: TransactionManifestString;
        feePayer?: { account: Account; amount: Amount };
        transactionIntent?: TransactionIntent;
      }) =>
        Effect.gen(function* () {
          const { intent, id, hash } = yield* Option.fromNullable(
            input.transactionIntent,
          ).pipe(
            Option.match({
              onNone: () =>
                Effect.gen(function* () {
                  yield* Effect.log('Creating transaction intent');
                  const feePayerInstructions = input.feePayer
                    ? yield* manifestHelper.addFeePayer(input.feePayer)
                    : '';

                  const manifestWithFeePayer = TransactionManifestString.make(`
                    ${feePayerInstructions}
                    ${input.manifest}
                  `);

                  return yield* createTransactionIntent({
                    networkId,
                    manifest: manifestWithFeePayer,
                  }).pipe(
                    Effect.flatMap((intent) =>
                      intentHashService
                        .create(intent)
                        .pipe(
                          Effect.map(({ id, hash }) => ({ id, hash, intent })),
                        ),
                    ),

                    Effect.catchTags({
                      ParseError: Effect.die,
                      InvalidEpochError: Effect.die,
                    }),
                  );
                }),
              onSome: (intent) =>
                intentHashService.create(intent).pipe(
                  Effect.flatMap(({ id, hash }) =>
                    epochService
                      .verifyEpochBounds({
                        transactionId: id,
                        transactionIntent: intent,
                      })
                      .pipe(Effect.as({ id, hash, intent })),
                  ),
                ),
            }),
          );

          return yield* Effect.gen(function* () {
            yield* Effect.log('Collecting signatures');
            const signatures = yield* signer(hash);

            const compiledTransaction = yield* compileTransaction({
              intent,
              signatures,
            }).pipe(Effect.catchAll(Effect.die));

            yield* Option.match(onSubmitLifeCycleHook, {
              onNone: () => Effect.void,
              onSome: (effect) =>
                Effect.gen(function* () {
                  yield* Effect.log('Executing life cycle hook: onSubmit');
                  yield* effect({ id, intent });
                }),
            });

            yield* Effect.log('Submitting transaction to network');
            yield* submitTransactionToNetwork({
              networkId,
              compiledTransaction: compiledTransaction,
            });

            yield* Option.match(onSubmitSuccessLifeCycleHook, {
              onNone: () => Effect.void,
              onSome: (effect) =>
                Effect.gen(function* () {
                  yield* Effect.log(
                    'Executing life cycle hook: onSubmitSuccess',
                  );
                  yield* effect({ id, intent });
                }),
            });

            const result = yield* transactionStatus
              .poll({
                id,
                networkId,
              })
              .pipe(
                Effect.map((status) => ({ statusResponse: status, id })),
                Effect.catchAllCause((cause) =>
                  Effect.gen(function* () {
                    yield* Option.match(onStatusFailureLifeCycleHook, {
                      onNone: () => Effect.void,
                      onSome: (effect) =>
                        Effect.gen(function* () {
                          yield* Effect.log(
                            'Executing life cycle hook: onFailure',
                          );

                          const permanent =
                            Cause.isFailType(cause) &&
                            cause.error._tag === 'TransactionFailedError';

                          yield* effect({
                            id,
                            permanent,
                            intent,
                          });
                        }),
                    });
                    return yield* Effect.failCause(cause);
                  }),
                ),
              );

            yield* Option.match(onSuccessLifeCycleHook, {
              onNone: () => Effect.void,
              onSome: (effect) =>
                Effect.gen(function* () {
                  yield* Effect.log('Executing life cycle hook: onSuccess');
                  yield* effect({ id });
                }),
            });

            return result;
          }).pipe(Effect.annotateLogs('transactionId', id));
        }).pipe(
          Effect.annotateLogs({
            networkId,
            feePayer: input.feePayer?.account.address,
          }),
        );

      const getCommittedDetails = (input: { id: TransactionId }) =>
        gatewayApiClient.transaction.getCommittedDetails(input.id);

      const createBadge = (input: { account: Account; feePayer: Account }) =>
        submitTransaction({
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
