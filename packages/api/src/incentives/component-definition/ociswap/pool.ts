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
    lp_address: RadixDataTypeSchema.ResourceAddress,
    x_address: RadixDataTypeSchema.ResourceAddress,
    y_address: RadixDataTypeSchema.ResourceAddress,
  }),
  Schema.Struct({
    lp_address: RadixDataTypeSchema.ResourceAddress,
    x_address: AssetSchema,
    y_address: AssetSchema,
  }),
  {
    decode: (value) =>
      Effect.gen(function* () {
        return {
          x_address: yield* parseAssetFromResourceAddress(value.x_address),
          y_address: yield* parseAssetFromResourceAddress(value.y_address),
          lp_address: value.lp_address,
        };
      }),
    encode: (value) =>
      Effect.gen(function* () {
        return {
          x_address: value.x_address.resourceAddress,
          y_address: value.y_address.resourceAddress,
          lp_address: value.lp_address,
        };
      }),
  },
);

const fromComponentEntityDetails = (
  input: ComponentEntityDetailsOutput[number],
) =>
  Effect.gen(function* () {
    const metadata = yield* Schema.Struct({
      x_address: MetadataSchema.ResourceAddress,

      lp_address: MetadataSchema.ResourceAddress,
      y_address: MetadataSchema.ResourceAddress,
    }).pipe(Schema.decodeUnknown)(input.metadata);

    const tvl = yield* Schema.decodeUnknown(
      fromFungibleResourcesVaultCollection,
    )(input.fungibleResources);

    return yield* PoolComponent.pipe(Schema.decodeUnknown)({
      ...input,
      tvl,
      data: yield* Schema.decode(DataSchema)(metadata).pipe(
        Effect.map((data) => ({
          liquidityReceipt: data.lp_address,
          xToken: data.x_address,
          yToken: data.y_address,
        })),
      ),
      url: `https://ociswap.com/pools/${input.componentAddress}`,
    });
  });

export class PoolComponent extends ComponentDefinition.extend<PoolComponent>(
  'PoolComponent',
)({
  dappId: OciswapLiteralSchema,
  packageAddress: Schema.Literal(
    'package_rdx1phyk2tszvfhz2ukht6pkg3f3q3ww3fsuwku4uyyzctslpfp6dqksqq',
  ),
  blueprintName: Schema.Literal('Pool'),
  data: Schema.Struct({
    liquidityReceipt: RadixDataTypeSchema.ResourceAddress,
    xToken: AssetSchema,
    yToken: AssetSchema,
  }),
  tvl: Schema.Array(fungibleResourceBalanceSchema),
  url: Schema.String,
}) {
  static blueprintName = PoolComponent.fields.blueprintName.literals[0];
  static packageAddresses = PoolComponent.fields.packageAddress.literals;
  static matchPackageAddress = (input: string) =>
    input === PoolComponent.fields.packageAddress.literals[0];
  static fromComponentEntityDetails = fromComponentEntityDetails;
}
