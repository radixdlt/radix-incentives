import { it } from '@effect/vitest';
import { RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import {
  Array as A,
  Config,
  ConfigProvider,
  Duration,
  Effect,
  Fiber,
  flow,
  Layer,
  Logger,
  Option,
  Redacted,
  Ref,
  Schema,
  TestClock,
} from 'effect';
import { GetFungibleBalanceService } from '../../../common/gateway';
import { createAccount } from '../../../test-helpers/createAccount';
import { AccountAddress, Amount } from '../../account-balance/v2/schemas';
import {
  BadgeSchema,
  Ed25519PrivateKeySchema,
  HexString,
  UnsecurifiedAccountSchema,
} from '../../transaction-intent/schemas';
import { Signer } from '../../transaction-intent/singer/signer';
import {
  TransactionHelper,
  TransactionHelperConfig,
} from '../../transaction-intent/transactionHelper';
import { IncentivesVesterConfig } from './config';
import { IncentivesVester } from './incentivesVester';

process.env.NOTARIZER_PRIVATE_KEY =
  'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

const random32BytesHex = () =>
  HexString.make(
    Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex'),
  );

const resolveFiber = <A, E>(fiber: Fiber.RuntimeFiber<A, E>) =>
  Effect.gen(function* () {
    while (Option.isNone(yield* Fiber.poll(fiber))) {
      yield* Effect.promise(
        async () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );
      yield* TestClock.adjust(Duration.seconds(1));
    }
    return yield* Fiber.join(fiber);
  });

const DisableTestClock = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    const fiber = yield* effect.pipe(Effect.fork);
    return yield* resolveFiber(fiber);
  });

const testSetup = DisableTestClock(
  Effect.gen(function* () {
    const configRef = yield* IncentivesVesterConfig.StokenetConfig;

    const config = yield* Ref.get(configRef);

    const knownAddresses = yield* Effect.tryPromise(() =>
      RadixEngineToolkit.Utils.knownAddresses(config.networkId),
    );

    const adminTransactionHelper = yield* TransactionHelper.pipe(
      Effect.provide(
        TransactionHelper.Default.pipe(
          Layer.provide(
            Layer.mergeAll(
              Signer.VaultLive,
              TransactionHelperConfig.provide({ networkId: config.networkId }),
            ),
          ),
        ),
      ),
    );

    const getFungibleBalance = yield* GetFungibleBalanceService.pipe(
      Effect.provide(GetFungibleBalanceService.Default),
      Effect.provide(
        Layer.setConfigProvider(
          ConfigProvider.fromJson({ NETWORK_ID: config.networkId }),
        ),
      ),
    );

    const superAdminPrivateKey = yield* Config.string(
      'INCENTIVES_VESTER_SUPER_ADMIN_ED25519_PRIVATE_KEY',
    ).pipe(
      Config.option,
      Effect.map(
        Option.match({
          onNone: () => HexString.make(random32BytesHex()),
          onSome: (privateKey) => HexString.make(privateKey),
        }),
      ),
      Effect.map(Redacted.make),
    );

    const superAdminAccount = yield* Schema.decode(Ed25519PrivateKeySchema)(
      Redacted.value(superAdminPrivateKey),
    ).pipe(
      Effect.map((i) => i.publicKey()),
      Effect.flatMap((publicKey) =>
        Effect.promise(() =>
          RadixEngineToolkit.Derive.virtualAccountAddressFromPublicKey(
            publicKey,
            config.networkId,
          ),
        ),
      ),
      Effect.map(AccountAddress),
      Effect.map((address) =>
        UnsecurifiedAccountSchema.make({
          type: 'unsecurifiedAccount',
          address,
        }),
      ),
    );

    yield* Ref.update(configRef, (current) => ({
      ...current,
      superAdminAccount: Option.some(superAdminAccount),
    }));

    const superAdminSignerLive =
      Signer.makePrivateKeySigner(superAdminPrivateKey);

    const superAdminTransactionHelper = yield* TransactionHelper.pipe(
      Effect.provide(TransactionHelper.Default),
      Effect.provide(superAdminSignerLive),
      Effect.provide(
        TransactionHelperConfig.provide({ networkId: config.networkId }),
      ),
    );

    const superAdminXrdBalance = yield* getFungibleBalance({
      addresses: [superAdminAccount.address],
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
                item.resourceAddress === knownAddresses.resourceAddresses.xrd,
            ),
          ),
        ),
      ),
    );

    if (Option.isNone(superAdminXrdBalance)) {
      yield* Effect.log('Super admin has no XRD balance, calling faucet');
      yield* superAdminTransactionHelper.faucet({
        account: superAdminAccount,
      });
    }

    if (Option.isNone(config.adminBadge)) {
      yield* Effect.log('Admin badge not found, creating it');
      const adminBadge = yield* adminTransactionHelper.createBadge({
        account: config.adminAccount,
        feePayer: config.adminAccount,
      });

      yield* Ref.update(configRef, (current) => ({
        ...current,
        adminBadge: Option.some(
          BadgeSchema.make({
            type: 'fungibleResource',
            resourceAddress: adminBadge,
          }),
        ),
      }));
    }

    if (Option.isNone(config.superAdminBadge)) {
      yield* Effect.log('Super admin badge not found, creating it');
      const superAdminBadge = yield* superAdminTransactionHelper.createBadge({
        account: superAdminAccount,
        feePayer: superAdminAccount,
      });

      yield* Ref.update(configRef, (current) => ({
        ...current,
        superAdminBadge: Option.some(
          BadgeSchema.make({
            type: 'fungibleResource',
            resourceAddress: superAdminBadge,
          }),
        ),
      }));
    }

    yield* Effect.log(yield* Ref.get(configRef));

    return {
      stokenetConfig: configRef,
      superAdminSignerLive,
      superAdminPrivateKey,
      adminSignerLive: Signer.VaultLive,
    };
  }),
);

describe.skip('Incentives Vester Component', () => {
  it.effect(
    'should successfully setup and claim rewards',
    () => {
      return Effect.gen(function* () {
        const { stokenetConfig, superAdminSignerLive, adminSignerLive } =
          yield* testSetup;

        const superAdminOperations = Effect.gen(function* () {
          const incentivesVester = yield* IncentivesVester;

          const componentAddress = yield* incentivesVester.instantiate({
            vestDuration: Duration.days(365),
            preClaimPeriod: Duration.days(1),
            initialVestedFraction: 0.2,
          });

          yield* Ref.update(stokenetConfig, (current) => ({
            ...current,
            componentAddress: Option.some(componentAddress),
          }));

          yield* incentivesVester.createPoolUnits({
            amount: Amount('1000'),
          });

          yield* incentivesVester.finishSetup();
        }).pipe(
          Effect.provide(IncentivesVester.Default),
          Effect.provide(IncentivesVesterConfig.provide(stokenetConfig)),
          Effect.provide(superAdminSignerLive),
        );

        const adminOperations = Effect.gen(function* () {
          const incentivesVester = yield* IncentivesVester;

          // user account address that will claim the rewards
          const account = yield* createAccount({
            networkId: 2,
          });

          yield* incentivesVester.claim({
            amount: Amount('200'),
            accountAddress: account.address,
          });
        }).pipe(
          Effect.provide(IncentivesVester.Default),
          Effect.provide(IncentivesVesterConfig.provide(stokenetConfig)),
          Effect.provide(adminSignerLive),
        );

        // instantiate component transaction & create pool units & finish setup transaction
        yield* DisableTestClock(superAdminOperations);

        // claim transaction
        yield* DisableTestClock(adminOperations);
      }).pipe(Effect.provide(Logger.pretty));
    },
    { timeout: 300_000 },
  );
});
