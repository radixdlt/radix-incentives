import {
  Array as A,
  ConfigProvider,
  Data,
  Duration,
  Effect,
  flow,
  identity,
  Layer,
  Option,
  pipe,
  Ref,
} from 'effect';
import { type NetworkId, TransactionManifestString } from 'shared/brandedTypes';
import type { Account } from 'shared/schemas/account';
import { GetComponentStateService } from '../../../common/gateway';
import type { AtLedgerState } from '../../../common/gateway/schemas';
import {
  type AccountAddress,
  Amount,
  ComponentAddress,
} from '../../account-balance/v2/schemas';
import type { TransactionIntent } from '../../transaction-intent/schemas';
import { Signer } from '../../transaction-intent/signer/signer';
import {
  TransactionHelper,
  TransactionHelperConfig,
  TransactionLifeCycleHook,
} from '../../transaction-intent/transactionHelper';
import { IncentivesVesterConfig } from './config';
import { IncentivesVester as IncentivesVesterSchema } from './schemas';

export class MissingConfigError extends Data.TaggedError('MissingConfigError')<{
  message: string;
}> {}

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  message: string;
}> {}

export class VesterComponentNotFoundError extends Data.TaggedError(
  'VesterComponentNotFoundError',
)<{
  message: string;
}> {}

export class IncentivesVester extends Effect.Service<IncentivesVester>()(
  'IncentivesVester',
  {
    effect: Effect.gen(function* () {
      const configRef = yield* IncentivesVesterConfig;
      const { networkId } = yield* Ref.get(configRef);

      // Helper to get TransactionHelper with optional lifecycle hook from context
      const getTransactionHelper = Effect.gen(function* () {
        const lifeCycleHook = yield* Effect.serviceOption(
          TransactionLifeCycleHook,
        );

        return yield* TransactionHelper.pipe(
          Effect.provide(
            TransactionHelper.Default.pipe(
              Layer.provide(
                Layer.mergeAll(
                  TransactionHelperConfig.provide({ networkId }),
                  Option.isSome(lifeCycleHook)
                    ? Layer.effect(
                        TransactionLifeCycleHook,
                        Effect.succeed(lifeCycleHook.value),
                      )
                    : Layer.empty,
                ),
              ),
            ),
          ),
        );
      });

      return {
        instantiate: (input: {
          vestDuration: Duration.Duration;
          preClaimPeriod: Duration.Duration;
          initialVestedFraction: number;
          existingLockerAddress: Option.Option<ComponentAddress>;
        }) =>
          Effect.gen(function* () {
            const config = yield* Ref.get(configRef);
            const adminBadge = Option.getOrThrowWith(
              config.adminBadge,
              () =>
                new MissingConfigError({ message: 'Admin badge not found' }),
            );
            const superAdminBadge = Option.getOrThrowWith(
              config.superAdminBadge,
              () =>
                new MissingConfigError({
                  message: 'Super admin badge not found',
                }),
            );
            const superAdminAccount = Option.getOrThrowWith(
              config.superAdminAccount,
              () =>
                new MissingConfigError({
                  message: 'Super admin account not found',
                }),
            );

            const lockerEnum = pipe(
              input.existingLockerAddress,
              Option.match({
                onNone: () => 'Enum<0u8>()',
                onSome: (addr) => `Enum<1u8>(Address("${addr}"))`,
              }),
            );

            const manifest = TransactionManifestString.make(`
              CALL_FUNCTION
                Address("${config.packageAddress}")
                "IncentivesVester"
                "instantiate"
                Address("${adminBadge.resourceAddress}") # admin badge for backend
                Address("${superAdminBadge.resourceAddress}") # super admin badge
                ${input.vestDuration.pipe(Duration.toSeconds)}i64 # vest duration in seconds
                Decimal("${input.initialVestedFraction}") # initial vested fraction
                ${input.preClaimPeriod.pipe(Duration.toSeconds)}i64 # pre-claim period in seconds
                Address("${config.rewardsResourceAddress}") # XRD
                ${lockerEnum} # existing locker or create new
              ;`);

            const transactionHelper = yield* getTransactionHelper;

            const getComponentState = yield* GetComponentStateService.pipe(
              Effect.provide(GetComponentStateService.Default),
            );

            return yield* transactionHelper
              .submitTransaction({
                manifest,
                feePayer: {
                  account: superAdminAccount,
                  amount: Amount('100'),
                },
              })
              .pipe(
                Effect.annotateLogs('manifest', 'IncentivesVester.instantiate'),
                Effect.flatMap(({ id }) =>
                  transactionHelper.getCommittedDetails({
                    id,
                  }),
                ),
                // Extract all component addresses and find the vester by validation
                Effect.flatMap((result) =>
                  pipe(
                    Option.fromNullable(
                      result.transaction?.affected_global_entities,
                    ),
                    Option.map(
                      A.filter((item) => item.startsWith('component_')),
                    ),
                    Option.getOrElse(() => [] as string[]),
                    // Try each component until we find the vester
                    (componentAddresses) =>
                      Effect.forEach(
                        componentAddresses,
                        (addr) =>
                          pipe(
                            getComponentState.run({
                              addresses: [ComponentAddress(addr)],
                              at_ledger_state: { timestamp: new Date() },
                              schema: IncentivesVesterSchema,
                            }),
                            Effect.map(() =>
                              Option.some(ComponentAddress(addr)),
                            ),
                            Effect.catchAll(() =>
                              Effect.succeed(Option.none()),
                            ),
                          ),
                        { concurrency: 'unbounded' },
                      ),
                    Effect.map(A.filterMap(identity)),
                    Effect.flatMap((validVesters) =>
                      A.head(validVesters).pipe(
                        Option.match({
                          onNone: () =>
                            new VesterComponentNotFoundError({
                              message:
                                'No valid IncentivesVester component found in affected entities',
                            }),
                          onSome: Effect.succeed,
                        }),
                      ),
                    ),
                  ),
                ),
              );
          }),
        createPoolUnits: (input: { amount: Amount }) =>
          Effect.gen(function* () {
            const config = yield* Ref.get(configRef);
            const componentAddress = Option.getOrThrowWith(
              config.componentAddress,
              () =>
                new MissingConfigError({
                  message: 'Component address not found',
                }),
            );
            const superAdminAccount = Option.getOrThrowWith(
              config.superAdminAccount,
              () =>
                new MissingConfigError({
                  message: 'Super admin account not found',
                }),
            );
            const superAdminBadge = Option.getOrThrowWith(
              config.superAdminBadge,
              () =>
                new MissingConfigError({
                  message: 'Super admin badge not found',
                }),
            );

            const manifest = TransactionManifestString.make(`
              CALL_METHOD
                Address("${superAdminAccount.address}")
                "create_proof_of_amount"
                Address("${superAdminBadge.resourceAddress}")
                Decimal("1")
              ;

              CALL_METHOD
                Address("${superAdminAccount.address}")
                "withdraw"
                Address("${config.rewardsResourceAddress}")
                Decimal("${input.amount}")
              ;

              TAKE_ALL_FROM_WORKTOP
                Address("${config.rewardsResourceAddress}")
                Bucket("rewards")
              ;

              CALL_METHOD
                Address("${componentAddress}")
                "create_pool_units"
                Bucket("rewards")
              ;
            `);

            const transactionHelper = yield* getTransactionHelper;

            return yield* transactionHelper
              .submitTransaction({
                manifest,
                feePayer: {
                  account: superAdminAccount,
                  amount: Amount('100'),
                },
              })
              .pipe(
                Effect.annotateLogs(
                  'manifest',
                  'IncentivesVester.createPoolUnits',
                ),
              );
          }),
        finishSetup: () =>
          Effect.gen(function* () {
            const config = yield* Ref.get(configRef);
            const componentAddress = Option.getOrThrowWith(
              config.componentAddress,
              () =>
                new MissingConfigError({
                  message: 'Component address not found',
                }),
            );
            const superAdminAccount = Option.getOrThrowWith(
              config.superAdminAccount,
              () =>
                new MissingConfigError({
                  message: 'Super admin account not found',
                }),
            );
            const superAdminBadge = Option.getOrThrowWith(
              config.superAdminBadge,
              () =>
                new MissingConfigError({
                  message: 'Super admin badge not found',
                }),
            );

            const manifest = TransactionManifestString.make(`
              CALL_METHOD
                Address("${superAdminAccount.address}")
                "create_proof_of_amount"
                Address("${superAdminBadge.resourceAddress}")
                Decimal("1")
              ;

              CALL_METHOD
                Address("${componentAddress}")
                "finish_setup"
              ;
            `);

            const transactionHelper = yield* getTransactionHelper;

            return yield* transactionHelper
              .submitTransaction({
                manifest,
                feePayer: {
                  account: superAdminAccount,
                  amount: Amount('100'),
                },
              })
              .pipe(
                Effect.annotateLogs('manifest', 'IncentivesVester.finishSetup'),
              );
          }),
        claim: (input: {
          amount: Amount;
          accountAddress: AccountAddress;
          transactionIntent?: TransactionIntent;
        }) =>
          Effect.gen(function* () {
            const config = yield* Ref.get(configRef);
            const componentAddress = Option.getOrThrowWith(
              config.componentAddress,
              () =>
                new MissingConfigError({
                  message: 'Component address not found',
                }),
            );
            const adminBadge = Option.getOrThrowWith(
              config.adminBadge,
              () =>
                new MissingConfigError({
                  message: 'Admin badge not found',
                }),
            );
            const adminAccount = Option.getOrThrowWith(
              config.adminAccount,
              () =>
                new MissingConfigError({
                  message: 'Admin account not found',
                }),
            );

            const manifest = TransactionManifestString.make(`
              CALL_METHOD
                Address("${adminAccount.address}")
                "create_proof_of_amount"
                Address("${adminBadge.resourceAddress}")
                Decimal("1")
              ;

              CALL_METHOD
                Address("${componentAddress}")
                "claim"
                Decimal("${input.amount}")
                Address("${input.accountAddress}")
              ;`);

            const transactionHelper = yield* getTransactionHelper;

            return yield* transactionHelper.submitTransaction({
              manifest,
              transactionIntent: input.transactionIntent,
              feePayer: {
                account: adminAccount,
                amount: Amount('10'),
              },
            });
          }).pipe(
            Effect.catchTags({
              FailedToSignTransactionError: Effect.die,
              InvalidManifestError: Effect.die,
              FailedToCreateIntentHashError: Effect.die,
              FailedToStaticallyValidateManifestError: Effect.die,
            }),
            Effect.annotateLogs('manifest', 'IncentivesVester.claim'),
          ),
        /**
         * Refills the vester pool with eligible tokens.
         * This is a public method that can be called by anyone.
         * Accepts an explicit component address and admin account,
         * or falls back to the shared config if not provided.
         */
        refill: (input?: {
          componentAddress: ComponentAddress;
          adminAccount: Account;
        }) =>
          Effect.gen(function* () {
            const { componentAddress, adminAccount } = input ?? {
              componentAddress: Option.getOrThrowWith(
                (yield* Ref.get(configRef)).componentAddress,
                () =>
                  new MissingConfigError({
                    message: 'Component address not found',
                  }),
              ),
              adminAccount: Option.getOrThrowWith(
                (yield* Ref.get(configRef)).adminAccount,
                () =>
                  new MissingConfigError({
                    message: 'Admin account not found',
                  }),
              ),
            };

            const manifest = TransactionManifestString.make(`
              CALL_METHOD
                Address("${componentAddress}")
                "refill"
              ;`);

            const transactionHelper = yield* getTransactionHelper;

            return yield* transactionHelper.submitTransaction({
              manifest,
              feePayer: {
                account: adminAccount,
                amount: Amount('10'),
              },
            });
          }).pipe(
            Effect.catchTags({
              FailedToSignTransactionError: Effect.die,
              InvalidManifestError: Effect.die,
              FailedToCreateIntentHashError: Effect.die,
              FailedToStaticallyValidateManifestError: Effect.die,
            }),
            Effect.annotateLogs('manifest', 'IncentivesVester.refill'),
          ),
      };
    }),
  },
) {
  static MainnetLive = IncentivesVester.Default.pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        Signer.VaultLive,
        Layer.effect(
          IncentivesVesterConfig,
          IncentivesVesterConfig.MainnetConfig,
        ),
      ),
    ),
  );
}

export class IncentivesVesterStateService extends Effect.Service<IncentivesVesterStateService>()(
  'IncentivesVesterStateService',
  {
    effect: Effect.gen(function* () {
      return (input: {
        componentAddress: ComponentAddress;
        networkId: NetworkId;
        at_ledger_state?: AtLedgerState;
      }) =>
        Effect.gen(function* () {
          const getComponentStateService = yield* GetComponentStateService.pipe(
            Effect.provide(GetComponentStateService.Default),
          );

          return yield* getComponentStateService
            .run({
              addresses: [input.componentAddress],
              schema: IncentivesVesterSchema,
              at_ledger_state: input.at_ledger_state,
            })
            .pipe(
              Effect.map(
                flow(
                  A.head,
                  Option.getOrThrowWith(
                    () =>
                      new NotFoundError({
                        message: 'Incentives vester not found',
                      }),
                  ),
                  (result) => result.state,
                ),
              ),
            );
        }).pipe(
          Effect.provide(
            Layer.setConfigProvider(
              ConfigProvider.fromJson({ NETWORK_ID: input.networkId }),
            ),
          ),
        );
    }),
  },
) {}
