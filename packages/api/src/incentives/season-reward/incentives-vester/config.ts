import { RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import { Config, Context, Effect, Layer, Option, Ref, Schema } from 'effect';
import {
  AccessControllerAddress,
  AccountAddress,
  AccountLockerAddress,
  ComponentAddress,
  FungibleResourceAddress,
  NetworkId,
  PackageAddress,
} from 'shared/brandedTypes';
import {
  AccountSchema,
  SecurifiedAccountDecodedSchema,
  UnsecurifiedAccountDecodedSchema,
} from 'shared/schemas/account';
import {
  BadgeDecodedSchema,
  BadgeSchema,
} from '../../transaction-intent/schemas';

export const IncentivesVesterConfigSchema = Schema.Struct({
  adminBadge: Schema.Option(BadgeSchema),
  superAdminBadge: Schema.Option(BadgeSchema),
  rewardsResourceAddress: FungibleResourceAddress,
  networkId: NetworkId,
  packageAddress: PackageAddress,
  dappDefinitionAccount: Schema.Option(AccountSchema),
  adminAccount: Schema.Option(AccountSchema),
  superAdminAccount: Schema.Option(AccountSchema),
  componentAddress: Schema.Option(ComponentAddress),
  accountLockerPackageAddress: Schema.Option(PackageAddress),
  accountLockerComponentAddress: Schema.Option(ComponentAddress),
  accountLockerAddress: Schema.Option(AccountLockerAddress),
});

const createConfig = (input: {
  networkId: NetworkId;
  packageAddress: PackageAddress;
}) =>
  Effect.gen(function* () {
    const adminBadge = yield* Config.string(
      'INCENTIVES_VESTER_ADMIN_BADGE_RESOURCE_ADDRESS',
    ).pipe(
      Config.option,
      Effect.map(
        Option.map((item) =>
          BadgeDecodedSchema.make({
            type: 'fungibleResource',
            resourceAddress: FungibleResourceAddress.make(item),
          }),
        ),
      ),
    );

    const superAdminBadge = yield* Config.string(
      'INCENTIVES_VESTER_SUPER_ADMIN_BADGE_RESOURCE_ADDRESS',
    ).pipe(
      Config.option,
      Effect.map(
        Option.map((item) =>
          BadgeDecodedSchema.make({
            type: 'fungibleResource',
            resourceAddress: FungibleResourceAddress.make(item),
          }),
        ),
      ),
    );

    const adminAccountAdress = yield* Config.string(
      'INCENTIVES_VESTER_ADMIN_ACCOUNT_ADDRESS',
    ).pipe(Config.option, Effect.map(Option.map(AccountAddress.make)));

    const accessControllerAddress = yield* Config.string(
      'INCENTIVES_VESTER_ACCESS_CONTROLLER_ADDRESS',
    ).pipe(Config.option, Effect.map(Option.map(AccessControllerAddress.make)));

    const adminAccount = adminAccountAdress.pipe(
      Option.map((adminAccountAdress) =>
        accessControllerAddress.pipe(
          Option.match({
            onNone: () =>
              UnsecurifiedAccountDecodedSchema.make({
                type: 'unsecurifiedAccount',
                address: adminAccountAdress,
              }),
            onSome: (accessControllerAddress) => {
              return SecurifiedAccountDecodedSchema.make({
                type: 'securifiedAccount',
                address: adminAccountAdress,
                accessControllerAddress,
              });
            },
          }),
        ),
      ),
    );

    const superAdminAccountAdress = yield* Config.string(
      'INCENTIVES_VESTER_SUPER_ADMIN_ACCOUNT_ADDRESS',
    ).pipe(Config.option, Effect.map(Option.map(AccountAddress.make)));

    const superAdminAccessControllerAddress = yield* Config.string(
      'INCENTIVES_VESTER_SUPER_ADMIN_ACCESS_CONTROLLER_ADDRESS',
    ).pipe(Config.option, Effect.map(Option.map(AccessControllerAddress.make)));

    const superAdminAccount = superAdminAccountAdress.pipe(
      Option.map((address) =>
        superAdminAccessControllerAddress.pipe(
          Option.match({
            onNone: () =>
              UnsecurifiedAccountDecodedSchema.make({
                type: 'unsecurifiedAccount',
                address,
              }),
            onSome: (accessControllerAddress) =>
              SecurifiedAccountDecodedSchema.make({
                type: 'securifiedAccount',
                address,
                accessControllerAddress,
              }),
          }),
        ),
      ),
    );

    const componentAddress = yield* Config.string(
      'INCENTIVES_VESTER_COMPONENT_ADDRESS',
    ).pipe(Config.option, Effect.map(Option.map(ComponentAddress.make)));

    const knownAddresses = yield* Effect.tryPromise(() =>
      RadixEngineToolkit.Utils.knownAddresses(input.networkId),
    );

    const rewardsResourceAddress = yield* Config.string(
      'INCENTIVES_VESTER_REWARDS_RESOURCE_ADDRESS',
    ).pipe(
      Config.option,
      Effect.flatMap(
        Option.match({
          onNone: () => Effect.succeed(knownAddresses.resourceAddresses.xrd),
          onSome: (rewardsResourceAddress) =>
            Effect.succeed(rewardsResourceAddress),
        }),
      ),
      Effect.map(FungibleResourceAddress.make),
    );

    const config = {
      adminBadge: adminBadge,
      superAdminBadge: superAdminBadge,
      componentAddress,
      networkId: input.networkId,
      packageAddress: input.packageAddress,
      rewardsResourceAddress,
      adminAccount,
      superAdminAccount,
      dappDefinitionAccount: adminAccount,
      accountLockerPackageAddress: Option.none(),
      accountLockerComponentAddress: Option.none(),
      accountLockerAddress: Option.none(),
    } satisfies typeof IncentivesVesterConfigSchema.Type;

    return yield* Ref.make(config);
  });

export class IncentivesVesterConfig extends Context.Tag(
  'IncentivesVesterConfig',
)<IncentivesVesterConfig, Ref.Ref<typeof IncentivesVesterConfigSchema.Type>>() {
  static provide = (
    config: Ref.Ref<typeof IncentivesVesterConfigSchema.Type>,
  ) => Layer.effect(IncentivesVesterConfig, Effect.succeed(config));

  static MainnetConfig = createConfig({
    networkId: NetworkId.make(1),
    packageAddress: PackageAddress.make(
      'package_rdx1p5vkjuvutjwl90zfkf3sr5p6tq0lyhr3v702frru0w03rht2am6z0q',
    ),
  });

  static StokenetConfig = createConfig({
    networkId: NetworkId.make(2),
    packageAddress: PackageAddress.make(
      'package_tdx_2_1pk03fls3pdjf5dewt0kewhpx9syyj5vd4wq808sffcq5ghjk7svd4y',
    ),
  });
}
