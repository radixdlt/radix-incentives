import { Array as A, Data, Duration, Effect, Option, pipe, Ref } from 'effect';
import {
  type AccountAddress,
  Amount,
  ComponentAddress,
} from '../../account-balance/v2/schemas';
import { TransactionManifestString } from '../../transaction-intent/schemas';
import {
  TransactionHelper,
  TransactionHelperConfig,
} from '../../transaction-intent/transactionHelper';
import { IncentivesVesterConfig } from './config';

export class MissingConfigError extends Data.TaggedError('MissingConfigError')<{
  message: string;
}> {}

export class IncentivesVester extends Effect.Service<IncentivesVester>()(
  'IncentivesVester',
  {
    effect: Effect.gen(function* () {
      const configRef = yield* IncentivesVesterConfig;
      const { networkId } = yield* Ref.get(configRef);

      const transactionHelper = yield* TransactionHelper.pipe(
        Effect.provide(TransactionHelper.Default),
        Effect.provide(TransactionHelperConfig.provide({ networkId })),
      );

      return {
        instantiate: (input: {
          vestDuration: Duration.Duration;
          preClaimPeriod: Duration.Duration;
          initialVestedFraction: number;
        }) =>
          Effect.gen(function* () {
            const config = yield* Ref.get(configRef);
            const adminBadge = Option.getOrThrow(config.adminBadge);
            const superAdminBadge = Option.getOrThrow(config.superAdminBadge);
            const superAdminAccount = Option.getOrThrow(
              config.superAdminAccount,
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
                Address("${config.dappDefinitionAccount.address}") # No need to care about this when testing
              ;`);

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
            const componentAddress = Option.getOrThrow(config.componentAddress);
            const superAdminAccount = Option.getOrThrow(
              config.superAdminAccount,
            );
            const superAdminBadge = Option.getOrThrow(config.superAdminBadge);

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
            const componentAddress = Option.getOrThrow(config.componentAddress);
            const superAdminAccount = Option.getOrThrow(
              config.superAdminAccount,
            );
            const superAdminBadge = Option.getOrThrow(config.superAdminBadge);

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
        claim: (input: { amount: Amount; accountAddress: AccountAddress }) =>
          Effect.gen(function* () {
            const config = yield* Ref.get(configRef);
            const componentAddress = Option.getOrThrow(config.componentAddress);
            const adminBadge = Option.getOrThrow(config.adminBadge);
            const adminAccount = config.adminAccount;

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

            return yield* transactionHelper.submitTransaction({
              manifest,
              feePayer: {
                account: adminAccount,
                amount: Amount('100'),
              },
            });
          }),
      };
    }),
  },
) {}
