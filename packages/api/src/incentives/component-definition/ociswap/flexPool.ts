import { Effect, Schema } from 'effect';
import { AssetSchema } from '../../../common/assets/schemas';
import {
  fromFungibleResourcesVaultCollection,
  fungibleResourceBalanceSchema,
} from '../../../common/schemas/fungibleResource';
import type { ComponentEntityDetailsOutput } from '../getComponentEntityDetails';
import {
  ComponentDefinition,
  MetadataSchema,
  OciswapLiteralSchema,
  parseAssetFromResourceAddress,
  RadixDataTypeSchema,
} from '../schemas';

const DataSchema = Schema.transformOrFail(
  Schema.Struct({
    pool_address: RadixDataTypeSchema.ComponentAddress,
    x_address: RadixDataTypeSchema.ResourceAddress,
    liquidity_pool: RadixDataTypeSchema.PoolAddress,
    lp_address: RadixDataTypeSchema.ResourceAddress,
    y_address: RadixDataTypeSchema.ResourceAddress,
  }),
  Schema.Struct({
    pool_address: RadixDataTypeSchema.ComponentAddress,
    liquidity_pool: RadixDataTypeSchema.PoolAddress,
    lp_address: RadixDataTypeSchema.ResourceAddress,
    x_address: AssetSchema,
    y_address: AssetSchema,
  }),
  {
    decode: (value) =>
      Effect.gen(function* () {
        return {
          ...value,
          x_address: yield* parseAssetFromResourceAddress(value.x_address),
          y_address: yield* parseAssetFromResourceAddress(value.y_address),
        };
      }),
    encode: (value) =>
      Effect.gen(function* () {
        return {
          ...value,
          x_address: value.x_address.resourceAddress,
          y_address: value.y_address.resourceAddress,
        };
      }),
  },
);

const fromComponentEntityDetails = (
  input: ComponentEntityDetailsOutput[number],
) =>
  Effect.gen(function* () {
    const metadata = yield* Schema.Struct({
      pool_address: MetadataSchema.ComponentAddress,
      x_address: MetadataSchema.ResourceAddress,
      liquidity_pool: MetadataSchema.PoolAddress,
      lp_address: MetadataSchema.ResourceAddress,
      y_address: MetadataSchema.ResourceAddress,
    }).pipe(Schema.decodeUnknown)(input.metadata);

    const tvl = yield* Schema.decodeUnknown(
      fromFungibleResourcesVaultCollection,
    )(input.fungibleResources);

    return yield* FlexPoolComponent.pipe(Schema.decodeUnknown)({
      ...input,
      tvl,
      data: yield* Schema.decode(DataSchema)(metadata).pipe(
        Effect.map((data) => ({
          poolAddress: data.pool_address,
          liquidityPool: data.liquidity_pool,
          liquidityReceipt: data.lp_address,
          xToken: data.x_address,
          yToken: data.y_address,
        })),
      ),
      url: `https://ociswap.com/pools/${input.componentAddress}`,
    });
  });

export class FlexPoolComponent extends ComponentDefinition.extend<FlexPoolComponent>(
  'FlexPoolComponent',
)({
  dappId: OciswapLiteralSchema,
  blueprintName: Schema.Literal('FlexPool'),
  packageAddress: Schema.Literal(
    'package_rdx1pkzxm6nw55wvz0e2fn79hd8t07834cxa8kpdlhq8s5lp5ldqpcglwe',
  ),
  data: Schema.Struct({
    poolAddress: RadixDataTypeSchema.ComponentAddress,
    liquidityPool: RadixDataTypeSchema.PoolAddress,
    liquidityReceipt: RadixDataTypeSchema.ResourceAddress,
    xToken: AssetSchema,
    yToken: AssetSchema,
  }),
  tvl: Schema.Array(fungibleResourceBalanceSchema),
  url: Schema.String,
}) {
  static blueprintName = FlexPoolComponent.fields.blueprintName.literals[0];
  static packageAddresses = FlexPoolComponent.fields.packageAddress.literals;
  static matchPackageAddress = (input: string) =>
    input === FlexPoolComponent.fields.packageAddress.literals[0];
  static fromComponentEntityDetails = fromComponentEntityDetails;
}
