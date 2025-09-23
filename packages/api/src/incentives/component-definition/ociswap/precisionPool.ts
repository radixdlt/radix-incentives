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
    xToken: Schema.NonEmptyString,
    yToken: Schema.NonEmptyString,
    lpAddress: Schema.NonEmptyString,
    poolAddress: Schema.NonEmptyString,
  }),
  Schema.Struct({
    xToken: AssetSchema,
    yToken: AssetSchema,
    lpAddress: RadixDataTypeSchema.ResourceAddress,
    poolAddress: RadixDataTypeSchema.ComponentAddress,
  }),
  {
    decode: (value) =>
      Effect.gen(function* () {
        return {
          xToken: yield* parseAssetFromResourceAddress(value.xToken),
          yToken: yield* parseAssetFromResourceAddress(value.yToken),
          lpAddress: value.lpAddress,
          poolAddress: value.poolAddress,
        };
      }),
    encode: (value) =>
      Effect.gen(function* () {
        return {
          xToken: value.xToken.resourceAddress,
          yToken: value.yToken.resourceAddress,
          lpAddress: value.lpAddress,
          poolAddress: value.poolAddress,
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
      y_address: MetadataSchema.ResourceAddress,
      lp_address: MetadataSchema.ResourceAddress,
    }).pipe(Schema.decodeUnknown)(input.metadata);

    const tvl = yield* Schema.decodeUnknown(
      fromFungibleResourcesVaultCollection,
    )(input.fungibleResources);

    const data = yield* Schema.decode(DataSchema)({
      poolAddress: metadata.pool_address,
      xToken: metadata.x_address,
      yToken: metadata.y_address,
      lpAddress: metadata.lp_address,
    }).pipe(
      Effect.map((data) => ({
        poolAddress: data.poolAddress,
        xToken: data.xToken,
        yToken: data.yToken,
        liquidityReceipt: data.lpAddress,
      })),
    );

    return yield* PrecisionPoolComponent.pipe(Schema.decodeUnknown)({
      ...input,
      tvl,
      data,
      url: `https://ociswap.com/pools/${input.componentAddress}`,
    });
  });

export class PrecisionPoolComponent extends ComponentDefinition.extend<PrecisionPoolComponent>(
  'PrecisionPoolComponent',
)({
  dappId: OciswapLiteralSchema,
  blueprintName: Schema.Literal('PrecisionPool'),
  packageAddress: Schema.Literal(
    'package_rdx1pkrgvskdkglfd2ar4jkpw5r2tsptk85gap4hzr9h3qxw6ca40ts8dt',
    'package_rdx1pkl8tdw43xqx64etxwdf8rjtvptqurq4c3fky0kaj6vwa0zrkfmcmc',
  ),
  data: Schema.Struct({
    poolAddress: RadixDataTypeSchema.ComponentAddress,
    xToken: AssetSchema,
    yToken: AssetSchema,
    liquidityReceipt: RadixDataTypeSchema.ResourceAddress,
  }),
  tvl: Schema.Array(fungibleResourceBalanceSchema),
  url: Schema.String,
}) {
  static matchPackageAddress = (input: string) =>
    input === PrecisionPoolComponent.fields.packageAddress.literals[0] ||
    input === PrecisionPoolComponent.fields.packageAddress.literals[1];
  static fromComponentEntityDetails = fromComponentEntityDetails;
  static packageAddresses =
    PrecisionPoolComponent.fields.packageAddress.literals;
  static blueprintName =
    PrecisionPoolComponent.fields.blueprintName.literals[0];
}
