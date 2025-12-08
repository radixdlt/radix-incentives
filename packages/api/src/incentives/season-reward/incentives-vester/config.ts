import { RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import { Config, Context, Effect, Layer, Option, Ref, Schema } from 'effect';
import {
  AccessControllerAddress,
  AccountAddress,
  ComponentAddress,
  FungibleResourceAddress,
  PackageAddress,
} from '../../account-balance/v2/schemas';
import {
  AccountSchema,
  BadgeSchema,
  NetworkId,
  SecurifiedAccountSchema,
  UnsecurifiedAccountSchema,
} from '../../transaction-intent/schemas';

export const IncentivesVesterConfigSchema = Schema.Struct({
  adminBadge: Schema.Option(BadgeSchema),
  superAdminBadge: Schema.Option(BadgeSchema),
  rewardsResourceAddress: Schema.String.pipe(
    Schema.fromBrand(FungibleResourceAddress),
  ),
  networkId: NetworkId,
  packageAddress: Schema.Option(
    Schema.String.pipe(Schema.fromBrand(PackageAddress)),
  ),
  dappDefinitionAccount: AccountSchema,
  adminAccount: AccountSchema,
  superAdminAccount: Schema.Option(AccountSchema),
  componentAddress: Schema.Option(
    Schema.String.pipe(Schema.fromBrand(ComponentAddress)),
  ),
});

const createConfig = (input: {
  networkId: NetworkId;
  packageAddress?: PackageAddress;
}) =>
  Effect.gen(function* () {
    const adminBadge = yield* Config.string(
      'INCENTIVES_VESTER_ADMIN_BADGE_RESOURCE_ADDRESS',
    ).pipe(
      Config.option,
      Effect.map(
        Option.map((item) =>
          BadgeSchema.make({
            type: 'fungibleResource',
            resourceAddress: FungibleResourceAddress(item),
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
          BadgeSchema.make({
            type: 'fungibleResource',
            resourceAddress: FungibleResourceAddress(item),
          }),
        ),
      ),
    );

    const adminAccountAdress = yield* Config.string(
      'INCENTIVES_VESTER_ADMIN_ACCOUNT_ADDRESS',
    ).pipe(Effect.map(AccountAddress));

    const accessControllerAddress = yield* Config.string(
      'INCENTIVES_VESTER_ACCESS_CONTROLLER_ADDRESS',
    ).pipe(Config.option, Effect.map(Option.map(AccessControllerAddress)));

    const adminAccount = accessControllerAddress.pipe(
      Option.match({
        onNone: () =>
          UnsecurifiedAccountSchema.make({
            type: 'unsecurifiedAccount',
            address: adminAccountAdress,
          }),
        onSome: (accessControllerAddress) => {
          return SecurifiedAccountSchema.make({
            type: 'securifiedAccount',
            address: adminAccountAdress,
            accessControllerAddress,
          });
        },
      }),
    );

    const superAdminAccountAdress = yield* Config.string(
      'INCENTIVES_VESTER_SUPER_ADMIN_ACCOUNT_ADDRESS',
    ).pipe(Config.option, Effect.map(Option.map(AccountAddress)));

    const superAdminAccessControllerAddress = yield* Config.string(
      'INCENTIVES_VESTER_SUPER_ADMIN_ACCESS_CONTROLLER_ADDRESS',
    ).pipe(Config.option, Effect.map(Option.map(AccessControllerAddress)));

    const superAdminAccount = superAdminAccountAdress.pipe(
      Option.map((address) =>
        superAdminAccessControllerAddress.pipe(
          Option.match({
            onNone: () =>
              UnsecurifiedAccountSchema.make({
                type: 'unsecurifiedAccount',
                address,
              }),
            onSome: (accessControllerAddress) =>
              SecurifiedAccountSchema.make({
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
    ).pipe(Config.option, Effect.map(Option.map(ComponentAddress)));

    const knownAddresses = yield* Effect.tryPromise(() =>
      RadixEngineToolkit.Utils.knownAddresses(input.networkId),
    );

    const config = {
      adminBadge: adminBadge,
      superAdminBadge: superAdminBadge,
      componentAddress,
      networkId: input.networkId,
      packageAddress: Option.fromNullable(input.packageAddress),
      rewardsResourceAddress: FungibleResourceAddress(
        knownAddresses.resourceAddresses.xrd,
      ),
      adminAccount,
      superAdminAccount,
      dappDefinitionAccount: adminAccount,
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
    packageAddress: PackageAddress(''),
  });

  static StokenetConfig = createConfig({
    networkId: NetworkId.make(2),
    packageAddress: PackageAddress(
      'package_tdx_2_1pk03fls3pdjf5dewt0kewhpx9syyj5vd4wq808sffcq5ghjk7svd4y',
    ),
  });
}
