import type { ProgrammaticScryptoSborValue } from '@radixdlt/babylon-gateway-api-sdk';
import { DappId } from 'data';
import { Data, Effect, ParseResult, Schema } from 'effect';
import type { StructDefinition, StructSchema } from 'sbor-ez-mode';
import { AssetSchema } from '../../common/assets/schemas';

export class ComponentDefinition extends Schema.Class<ComponentDefinition>(
  'ComponentDefinition',
)({
  componentAddress: Schema.NonEmptyString,
}) {}

export const RadixDataTypeSchema = {
  ResourceAddress: Schema.String.pipe(
    Schema.filter((value) => value.startsWith('resource_')),
  ),
  PoolAddress: Schema.String.pipe(
    Schema.filter((value) => value.startsWith('pool_')),
  ),
  ComponentAddress: Schema.String.pipe(
    Schema.filter((value) => value.startsWith('component_')),
  ),
} as const;

export const MetadataSchema = {
  String: Schema.Struct({
    value: Schema.NonEmptyString,
    type: Schema.Literal('String'),
  }).pipe(
    Schema.transform(Schema.NonEmptyString, {
      decode: (value) => value.value,
      encode: (value) => ({ value }),
      strict: false,
    }),
  ),
  ResourceAddress: Schema.Struct({
    value: Schema.NonEmptyString,
    type: Schema.Literal('GlobalAddress'),
  }).pipe(
    Schema.filter(
      (value) =>
        (value.type === 'GlobalAddress' &&
          value.value.startsWith('resource_')) ||
        `invalid resource address: ${value.value}`,
    ),
    Schema.transform(Schema.NonEmptyString, {
      decode: (value) => value.value,
      encode: (value) => ({ value }),
      strict: false,
    }),
  ),
  PoolAddress: Schema.Struct({
    value: Schema.NonEmptyString,
    type: Schema.Literal('GlobalAddress'),
  }).pipe(
    Schema.filter(
      (value) =>
        (value.type === 'GlobalAddress' && value.value.startsWith('pool_')) ||
        `invalid pool address: ${value.value}`,
    ),
    Schema.transform(Schema.NonEmptyString, {
      decode: (value) => value.value,
      encode: (value) => ({ value }),
      strict: false,
    }),
  ),
  ComponentAddress: Schema.Struct({
    value: Schema.NonEmptyString,
    type: Schema.Literal('GlobalAddress'),
  }).pipe(
    Schema.filter(
      (value) =>
        (value.type === 'GlobalAddress' &&
          value.value.startsWith('component_')) ||
        `invalid pool address: ${value.value}`,
    ),
    Schema.transform(Schema.NonEmptyString, {
      decode: (value) => value.value,
      encode: (value) => ({ value }),
      strict: false,
    }),
  ),
} as const;

export const CaviarNineLiteralSchema = Schema.transform(
  Schema.Void,
  Schema.Literal(DappId.caviarnine),
  {
    decode: () => DappId.caviarnine,
    encode: () => undefined,
  },
);

export const OciswapLiteralSchema = Schema.transform(
  Schema.Void,
  Schema.Literal(DappId.ociswap),
  {
    decode: () => DappId.ociswap,
    encode: () => undefined,
  },
);

export const WeftFinanceLiteralSchema = Schema.transform(
  Schema.Void,
  Schema.Literal(DappId.weft),
  {
    decode: () => DappId.weft,
    encode: () => undefined,
  },
);

export const RootFinanceLiteralSchema = Schema.transform(
  Schema.Void,
  Schema.Literal(DappId.root),
  {
    decode: () => DappId.root,
    encode: () => undefined,
  },
);

export const DefiPlazaLiteralSchema = Schema.transform(
  Schema.Void,
  Schema.Literal(DappId.defiPlaza),
  {
    decode: () => DappId.defiPlaza,
    encode: () => undefined,
  },
);

export const SurgeLiteralSchema = Schema.transform(
  Schema.Void,
  Schema.Literal(DappId.surge),
  {
    decode: () => DappId.surge,
    encode: () => undefined,
  },
);

class FailedToParseComponentStateError extends Data.TaggedError(
  'FailedToParseComponentStateError',
)<{
  message: string;
  stack?: string;
  error: unknown;
}> {}

export const parseComponentStateSchema = <SD extends StructDefinition>(
  sbor: ProgrammaticScryptoSborValue,
  schema: StructSchema<SD, false>,
) =>
  Effect.gen(function* () {
    const parsed = schema.safeParse(sbor);
    if (parsed.isErr()) {
      return yield* Effect.fail(
        new FailedToParseComponentStateError({
          message: parsed.error.message,
          stack: parsed.error.stack,
          error: parsed.error,
        }),
      );
    }

    return parsed.value;
  });

export const parseAssetFromResourceAddress = (resourceAddress: string) =>
  AssetSchema.fromResourceAddress(resourceAddress).pipe(
    Effect.catchTags({
      ConfigError: (err) =>
        ParseResult.fail(new ParseResult.Unexpected(err, 'config error')),
      ParseError: (err) => ParseResult.fail(err.issue),
    }),
  );
