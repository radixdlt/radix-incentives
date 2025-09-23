import { Effect, ParseResult, Schema } from 'effect';
import { AssetSchema } from '../../../common/assets/schemas';
import { GetEntityDetailsService } from '../../../common/gateway';
import {
  fromFungibleResourcesVaultCollection,
  fungibleResourceBalanceSchema,
} from '../../../common/schemas/fungibleResource';
import type { ComponentEntityDetailsOutput } from '../getComponentEntityDetails';
import {
  CaviarNineLiteralSchema,
  ComponentDefinition,
  MetadataSchema,
  RadixDataTypeSchema,
} from '../schemas';

const ComponentDataSchema = Schema.transformOrFail(
  Schema.Struct({
    resource_x: Schema.NonEmptyString,
    resource_y: Schema.NonEmptyString,
    pool_component: Schema.NonEmptyString,
  }),
  Schema.Struct({
    resource_x: AssetSchema,
    resource_y: AssetSchema,
    pool_component: RadixDataTypeSchema.PoolAddress,
  }),
  {
    decode: (value, ast) =>
      Effect.gen(function* () {
        const resource_x = yield* AssetSchema.fromResourceAddress(
          value.resource_x,
        ).pipe(
          Effect.catchTags({
            ConfigError: () =>
              ParseResult.fail(new ParseResult.Unexpected(ast, 'config error')),
            ParseError: (err) => ParseResult.fail(err.issue),
          }),
        );

        const resource_y = yield* AssetSchema.fromResourceAddress(
          value.resource_y,
        ).pipe(
          Effect.catchTags({
            ConfigError: () =>
              ParseResult.fail(new ParseResult.Unexpected(ast, 'config error')),
            ParseError: (err) => ParseResult.fail(err.issue),
          }),
        );

        return {
          resource_x,
          resource_y,
          pool_component: value.pool_component,
        };
      }),
    encode: (value) =>
      Effect.gen(function* () {
        return {
          resource_x: value.resource_x.resourceAddress,
          resource_y: value.resource_y.resourceAddress,
          pool_component: value.pool_component,
        };
      }),
  },
);

const fromComponentEntityDetails = (
  input: ComponentEntityDetailsOutput[number],
) =>
  Effect.gen(function* () {
    const getEntityDetails = yield* GetEntityDetailsService;
    const metadata = yield* Schema.Struct({
      pool_component: MetadataSchema.PoolAddress,
      resource_x: MetadataSchema.ResourceAddress,
      resource_y: MetadataSchema.ResourceAddress,
    }).pipe(Schema.decodeUnknown)(input.metadata);

    const data = yield* Schema.decode(ComponentDataSchema)(metadata);

    const [poolEntityDetails] = yield* getEntityDetails(
      [metadata.pool_component],
      {},
      {
        timestamp: new Date(),
      },
    );

    const tvl = yield* Schema.decodeUnknown(
      fromFungibleResourcesVaultCollection,
    )(poolEntityDetails?.fungible_resources);

    return yield* WeightedPoolComponent.pipe(Schema.decodeUnknown)({
      ...input,
      data: {
        poolComponent: metadata.pool_component,
        xToken: data.resource_x,
        yToken: data.resource_y,
      },
      tvl,
      url: `https://www.caviarnine.com/earn/simple-pool/${input.componentAddress}`,
    });
  }).pipe(Effect.provide(GetEntityDetailsService.Default));

export class WeightedPoolComponent extends ComponentDefinition.extend<WeightedPoolComponent>(
  'WeightedPoolComponent',
)({
  dappId: CaviarNineLiteralSchema,
  blueprintName: Schema.Literal('WeightedPool'),
  packageAddress: Schema.Literal(
    'package_rdx1pkhxu8zy5t7h3rww6jsftca22e2jdgqpc28rje7lnmkjxxf50zagr7',
  ),
  data: Schema.Struct({
    poolComponent: RadixDataTypeSchema.PoolAddress,
    xToken: AssetSchema,
    yToken: AssetSchema,
  }),
  tvl: Schema.Array(fungibleResourceBalanceSchema),
  url: Schema.String,
}) {
  static packageAddresses =
    WeightedPoolComponent.fields.packageAddress.literals;
  static fromComponentEntityDetails = fromComponentEntityDetails;
  static matchPackageAddress = (input: string) =>
    input === WeightedPoolComponent.fields.packageAddress.literals[0];
  static blueprintName = WeightedPoolComponent.fields.blueprintName.literals[0];
}
