import type { AccessRule } from '@radixdlt/babylon-core-api-sdk';
import { RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import {
  Array as A,
  Cause,
  ConfigProvider,
  Context,
  Data,
  Effect,
  flow,
  Layer,
  Option,
  pipe,
  Record as R,
  Ref,
  Schema,
} from 'effect';
import {
  AccountLockerAddress,
  Amount,
  ComponentAddress,
  FungibleResourceAddress,
  NetworkId,
  type TransactionId,
  TransactionManifestString,
} from 'shared/brandedTypes';
import type { Account } from 'shared/schemas/account';
import {
  GatewayApiClientService,
  GetEntityDetailsService,
  GetFungibleBalanceService,
} from '../../common/gateway';

import { CompileTransaction } from './compileTransaction';
import { CreateTransactionIntent } from './createTransactionIntent';
import { EpochService } from './epoch';
import { IntentHashService } from './intentHash';
import { createBadge as createBadgeManifest } from './manifests/createBadge';
import { createFungibleTokenManifest } from './manifests/createFungibleToken';
import { faucet as faucetManifest } from './manifests/faucet';
import { ManifestHelper } from './manifests/manifestHelper';
import type { Badge, TransactionIntent } from './schemas';
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

export class InsufficientXrdBalanceError extends Data.TaggedError(
  'InsufficientXrdBalanceError',
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
      const knownAddresses = yield* Effect.tryPromise(() =>
        RadixEngineToolkit.Utils.knownAddresses(networkId),
      );

      const getFungibleBalance = yield* GetFungibleBalanceService.pipe(
        Effect.provide(GetFungibleBalanceService.Default),
        Effect.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromJson({ NETWORK_ID: networkId }),
          ),
        ),
      );

      const getEntityDetails = yield* GetEntityDetailsService.pipe(
        Effect.provide(GetEntityDetailsService.Default),
        Effect.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromJson({ NETWORK_ID: networkId }),
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

      const xrdBalance = (account: Account) =>
        getFungibleBalance({
          addresses: [account.address],
          at_ledger_state: {
            timestamp: new Date(),
          },
        }).pipe(
          Effect.map(
            flow(
              A.head,
              Option.map((value) => value.fungibleResources),
              Option.flatMap(
                A.findFirst(
                  (item) =>
                    item.resourceAddress ===
                    knownAddresses.resourceAddresses.xrd,
                ),
              ),
            ),
          ),
        );

      const submitTransaction = (input: {
        manifest: TransactionManifestString;
        feePayer?: { account: Account; amount: Amount };
        transactionIntent?: TransactionIntent;
      }) =>
        Effect.gen(function* () {
          yield* Option.fromNullable(input.feePayer).pipe(
            Option.match({
              onNone: () => Effect.void,
              onSome: (feePayer) =>
                xrdBalance(feePayer.account).pipe(
                  Effect.filterOrFail(
                    (amount) =>
                      Option.match(amount, {
                        onNone: () => false,
                        onSome: (amount) => amount.amount.gte(feePayer.amount),
                      }),
                    () =>
                      new InsufficientXrdBalanceError({
                        message: `Insufficient XRD balance for account ${feePayer.account.address}`,
                      }),
                  ),
                ),
            }),
          );

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
            const signatures = yield* signer.signToSignatureWithPublicKey(hash);

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
            amount: Amount.make('10'),
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
              FungibleResourceAddress.make,
            ),
          ),
        );

      const createFungibleToken = (input: {
        account: Account;
        feePayer: Account;
        name: string;
        symbol: string;
        initialSupply: Amount;
      }) =>
        submitTransaction({
          manifest: createFungibleTokenManifest(input),
          feePayer: {
            account: input.feePayer,
            amount: Amount.make('10'),
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
              FungibleResourceAddress.make,
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

      const createAccountLocker = (input: {
        feePayer: Account;
        ownerBadge: Badge;
      }) =>
        submitTransaction({
          manifest: TransactionManifestString.make(`
            CALL_FUNCTION
              Address("package_rdx1p462f34zx0x23etxj9pkrjsdy70aqcdejfgaxlv8f96w8fhcsvcfy7")
              "AccountLockerWrapper"
              "instantiate"
              Enum<2u8>(
                Enum<0u8>(
                  Enum<0u8>(
                    Enum<1u8>(
                      Address("${input.ownerBadge.resourceAddress}") # owner badge address
                    )
                  )
                )
              )
            ;
          `),
          feePayer: {
            account: input.feePayer,
            amount: Amount.make('100'),
          },
        }).pipe(
          Effect.flatMap(({ id }) => getCommittedDetails({ id })),
          Effect.map((result) => {
            const lockerAddress = pipe(
              result.transaction?.affected_global_entities,
              Option.fromNullable,
              Option.map(A.filter((item) => item.startsWith('locker_'))),
              Option.flatMap(A.head),
              Option.getOrThrowWith(() => new Error('No locker address found')),
              AccountLockerAddress.make,
            );

            const componentAddress = pipe(
              result.transaction?.affected_global_entities,
              Option.fromNullable,
              Option.map(A.filter((item) => item.startsWith('component_'))),
              Option.flatMap(A.head),
              Option.getOrThrowWith(
                () => new Error('No component address found'),
              ),
              ComponentAddress.make,
            );

            return {
              lockerAddress,
              componentAddress,
            };
          }),
        );

      const getComponentOwnerAccessRule = (input: {
        componentAddress: ComponentAddress;
      }) =>
        Effect.gen(function* () {
          const entityDetails = yield* getEntityDetails(
            [input.componentAddress],
            {},
          );

          const accessRule: Option.Option<AccessRule> = pipe(
            entityDetails,
            A.head,
            Option.flatMap((item) =>
              Option.fromNullable(
                item.details?.type === 'Component'
                  ? item.details.role_assignments
                  : null,
              ),
            ),
            Option.flatMap(({ owner }) =>
              Option.fromNullable((owner as { rule: AccessRule })?.rule),
            ),
          );

          return accessRule;
        });

      return {
        submitTransaction,
        getCommittedDetails,
        createBadge,
        createFungibleToken,
        faucet,
        createAccountLocker,
        getComponentOwnerAccessRule,
      };
    }),
  },
) {}
