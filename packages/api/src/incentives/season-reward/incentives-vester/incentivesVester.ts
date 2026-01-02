import {
  Array as A,
  ConfigProvider,
  Data,
  Duration,
  Effect,
  flow,
  Layer,
  Option,
  pipe,
  Ref,
} from 'effect';
import { type NetworkId, TransactionManifestString } from 'shared/brandedTypes';
import { GetComponentStateService } from '../../../common/gateway';
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
import { IncentivesVesterSchema } from './schemas';

export class MissingConfigError extends Data.TaggedError('MissingConfigError')<{
  message: string;
}> {}

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
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
            const dappDefinitionAccount = Option.getOrThrowWith(
              config.dappDefinitionAccount,
              () =>
                new MissingConfigError({
                  message: 'Dapp definition account not found',
                }),
            );
            const superAdminAccount = Option.getOrThrowWith(
              config.superAdminAccount,
              () =>
                new MissingConfigError({
                  message: 'Super admin account not found',
                }),
            );

            const manifest = TransactionManifestString.make(`
              CALL_FUNCTION
                Address("${config.packageAddress}")
                "IncentivesVester"
                "instantiate"
                Address("${adminBadge.resourceAddress}") # admin badge for backend, create yourself in advance
                Address("${superAdminBadge.resourceAddress}") # super admin badge, create yourself in advance
                ${input.vestDuration.pipe(Duration.toDays)}i64 # vest duration in days
                Decimal("${input.initialVestedFraction}") # initial vested fraction (20%)
                ${input.preClaimPeriod.pipe(Duration.toSeconds)}i64 # pre-claim period in seconds (1 day)
                Address("${config.rewardsResourceAddress}") # XRD
                Address("${dappDefinitionAccount.address}") # No need to care about this when testing
              ;`);

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
                Effect.annotateLogs('manifest', 'IncentivesVester.instantiate'),
                Effect.flatMap(({ id }) =>
                  transactionHelper.getCommittedDetails({
                    id,
                  }),
                ),
                Effect.map((result) =>
                  pipe(
                    Option.fromNullable(
                      result.transaction?.affected_global_entities,
                    ),
                    Option.flatMap(
                      A.findFirst((item) => item.startsWith('component_')),
                    ),
                    Option.getOrThrow,
                    ComponentAddress,
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
      }) =>
        Effect.gen(function* () {
          const getComponentStateService = yield* GetComponentStateService.pipe(
            Effect.provide(GetComponentStateService.Default),
          );

          return yield* getComponentStateService
            .run({
              addresses: [input.componentAddress],
              at_ledger_state: {
                timestamp: new Date(),
              },
              schema: IncentivesVesterSchema,
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
