import { Effect, ParseResult, Schema } from 'effect';
import { AssetSchema } from '../../../common/assets/schemas';
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

const DataSchema = Schema.transformOrFail(
  Schema.Struct({
    token_x: Schema.NonEmptyString,
    token_y: Schema.NonEmptyString,
    liquidity_receipt: Schema.NonEmptyString,
  }),
  Schema.Struct({
    token_x: AssetSchema,
    token_y: AssetSchema,
    liquidity_receipt: RadixDataTypeSchema.ResourceAddress,
  }),
  {
    decode: (value, ast) =>
      Effect.gen(function* () {
        const token_x = yield* AssetSchema.fromResourceAddress(
          value.token_x,
        ).pipe(
          Effect.catchTags({
            ConfigError: () =>
              ParseResult.fail(new ParseResult.Unexpected(ast, 'config error')),
            ParseError: (err) => ParseResult.fail(err.issue),
          }),
        );

        const token_y = yield* AssetSchema.fromResourceAddress(
          value.token_y,
        ).pipe(
          Effect.catchTags({
            ConfigError: () =>
              ParseResult.fail(new ParseResult.Unexpected(ast, 'config error')),
            ParseError: (err) => ParseResult.fail(err.issue),
          }),
        );

        return {
          token_x,
          token_y,
          liquidity_receipt: value.liquidity_receipt,
        };
      }),
    encode: (value) =>
      Effect.gen(function* () {
        return {
          token_x: value.token_x.resourceAddress,
          token_y: value.token_y.resourceAddress,
          liquidity_receipt: value.liquidity_receipt,
        };
      }),
  },
);

const fromComponentEntityDetails = (
  input: ComponentEntityDetailsOutput[number],
) =>
  Effect.gen(function* () {
    const metadata = yield* Schema.decodeUnknown(
      Schema.Struct({
        token_x: MetadataSchema.ResourceAddress,
        token_y: MetadataSchema.ResourceAddress,
        liquidity_receipt: MetadataSchema.ResourceAddress,
      }),
    )(input.metadata);

    const data = yield* Schema.decode(DataSchema)(metadata);

    const tvl = yield* Schema.decodeUnknown(
      fromFungibleResourcesVaultCollection,
    )(input.fungibleResources);

    return yield* Schema.decodeUnknown(QuantaSwapComponent)({
      ...input,
      data: {
        xToken: data.token_x,
        yToken: data.token_y,
        liquidityReceipt: data.liquidity_receipt,
      },
      tvl,
      url: `https://www.caviarnine.com/earn/shape-liquidity/pool/${input.componentAddress}`,
    });
  });

export class QuantaSwapComponent extends ComponentDefinition.extend<QuantaSwapComponent>(
  'QuantaSwapComponent',
)({
  dappId: CaviarNineLiteralSchema,
  blueprintName: Schema.Literal('QuantaSwap'),
  packageAddress: Schema.Literal(
    'package_rdx1p4r9rkp0cq67wmlve544zgy0l45mswn6h798qdqm47x4762h383wa3',
  ),
  data: Schema.Struct({
    xToken: AssetSchema,
    yToken: AssetSchema,
    liquidityReceipt: RadixDataTypeSchema.ResourceAddress,
  }),
  tvl: Schema.Array(fungibleResourceBalanceSchema),
  url: Schema.String,
}) {
  static packageAddresses = QuantaSwapComponent.fields.packageAddress.literals;
  static fromComponentEntityDetails = fromComponentEntityDetails;
  static matchPackageAddress = (input: string) =>
    input === QuantaSwapComponent.fields.packageAddress.literals[0];
  static blueprintName = QuantaSwapComponent.fields.blueprintName.literals[0];
}
