import { Effect, Schema } from 'effect';
import { AssetSchema } from '../../../common/assets/schemas';
import { GetEntityDetailsService } from '../../../common/gateway/getEntityDetails';
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
    liquidity_pool: RadixDataTypeSchema.PoolAddress,
    lp_address: RadixDataTypeSchema.ResourceAddress,
    x_address: RadixDataTypeSchema.ResourceAddress,
    y_address: RadixDataTypeSchema.ResourceAddress,
  }),
  Schema.Struct({
    liquidity_pool: RadixDataTypeSchema.PoolAddress,
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
          liquidity_pool: value.liquidity_pool,
        };
      }),
    encode: (value) =>
      Effect.gen(function* () {
        return {
          x_address: value.x_address.resourceAddress,
          y_address: value.y_address.resourceAddress,
          lp_address: value.lp_address,
          liquidity_pool: value.liquidity_pool,
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
      x_address: MetadataSchema.ResourceAddress,
      liquidity_pool: MetadataSchema.PoolAddress,
      lp_address: MetadataSchema.ResourceAddress,
      y_address: MetadataSchema.ResourceAddress,
    }).pipe(Schema.decodeUnknown)(input.metadata);

    const [poolEntityDetails] = yield* getEntityDetails(
      [metadata.liquidity_pool],
      {},
      {
        timestamp: new Date(),
      },
    );

    const tvl = yield* Schema.decodeUnknown(
      fromFungibleResourcesVaultCollection,
    )(poolEntityDetails?.fungible_resources);

    return yield* BasicPoolComponent.pipe(Schema.decodeUnknown)({
      ...input,
      tvl,
      data: yield* Schema.decode(DataSchema)(metadata).pipe(
        Effect.map((data) => ({
          liquidityPool: data.liquidity_pool,
          liquidityReceipt: data.lp_address,
          xToken: data.x_address,
          yToken: data.y_address,
        })),
      ),
      url: `https://ociswap.com/pools/${input.componentAddress}`,
    });
  }).pipe(Effect.provide(GetEntityDetailsService.Default));

export class BasicPoolComponent extends ComponentDefinition.extend<BasicPoolComponent>(
  'BasicPoolComponent',
)({
  dappId: OciswapLiteralSchema,
  packageAddress: Schema.Literal(
    'package_rdx1p5l6dp3slnh9ycd7gk700czwlck9tujn0zpdnd0efw09n2zdnn0lzx',
  ),
  blueprintName: Schema.Literal('BasicPool'),
  data: Schema.Struct({
    liquidityPool: RadixDataTypeSchema.PoolAddress,
    liquidityReceipt: RadixDataTypeSchema.ResourceAddress,
    xToken: AssetSchema,
    yToken: AssetSchema,
  }),
  tvl: Schema.Array(fungibleResourceBalanceSchema),
  url: Schema.String,
}) {
  static blueprintName = BasicPoolComponent.fields.blueprintName.literals[0];
  static packageAddresses = BasicPoolComponent.fields.packageAddress.literals;
  static matchPackageAddress = (input: string) =>
    input === BasicPoolComponent.fields.packageAddress.literals[0];
  static fromComponentEntityDetails = fromComponentEntityDetails;
}
