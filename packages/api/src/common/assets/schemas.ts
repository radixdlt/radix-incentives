import {
  AssetType,
  flatTokenNameMap,
  getAssetByResourceAddress,
  resourceAddresses,
  tokenNameMap,
} from 'data';
import { flow, Schema } from 'effect';

const AssetTypeLiteral = {
  XRD_DERIVATIVE: Schema.transform(
    Schema.Void,
    Schema.Literal(AssetType.XRD_DERIVATIVE),
    {
      decode: () => Schema.Literal(AssetType.XRD_DERIVATIVE),
      encode: (value) => value,
      strict: false,
    },
  ),
  NATIVE: Schema.transform(Schema.Void, Schema.Literal(AssetType.NATIVE), {
    decode: () => Schema.Literal(AssetType.NATIVE),
    encode: (value) => value,
    strict: false,
  }),
  BLUECHIP: Schema.transform(Schema.Void, Schema.Literal(AssetType.BLUECHIP), {
    decode: () => Schema.Literal(AssetType.BLUECHIP),
    encode: (value) => value,
    strict: false,
  }),
  STABLE: Schema.transform(Schema.Void, Schema.Literal(AssetType.STABLE), {
    decode: () => Schema.Literal(AssetType.STABLE),
    encode: (value) => value,
    strict: false,
  }),
} as const;

const BluechipAssets = Object.entries(tokenNameMap.bluechipAssets).map(
  ([resourceAddress, symbol]) =>
    Schema.Struct({
      resourceAddress: Schema.Literal(resourceAddress),
      assetType: AssetTypeLiteral.BLUECHIP,
      symbol: Schema.transform(Schema.Void, Schema.Literal(symbol), {
        decode: () => Schema.Literal(symbol),
        encode: (value) => value,
        strict: false,
      }),
    }).annotations({ identifier: symbol }),
);

const NativeAssets = Object.entries(tokenNameMap.nativeAssets).map(
  ([resourceAddress, symbol]) =>
    Schema.Struct({
      resourceAddress: Schema.Literal(resourceAddress),
      assetType: AssetTypeLiteral.NATIVE,
      symbol: Schema.transform(Schema.Void, Schema.Literal(symbol), {
        decode: () => Schema.Literal(symbol),
        encode: (value) => value,
        strict: false,
      }),
    }).annotations({ identifier: symbol }),
);

const StableAssets = Object.entries(tokenNameMap.stableAssets).map(
  ([resourceAddress, symbol]) =>
    Schema.Struct({
      resourceAddress: Schema.Literal(resourceAddress),
      assetType: AssetTypeLiteral.STABLE,
      symbol: Schema.transform(Schema.Void, Schema.Literal(symbol), {
        decode: () => Schema.Literal(symbol),
        encode: (value) => value,
        strict: false,
      }),
    }).annotations({ identifier: symbol }),
);

const XRDDerivativeAssets = Object.entries(
  tokenNameMap.xrdDerivativeAssets,
).map(([resourceAddress, symbol]) =>
  Schema.Struct({
    resourceAddress: Schema.Literal(resourceAddress),
    assetType: AssetTypeLiteral.XRD_DERIVATIVE,
    symbol: Schema.transform(Schema.Void, Schema.Literal(symbol), {
      decode: () => Schema.Literal(symbol),
      encode: (value) => value,
      strict: false,
    }),
  }).annotations({ identifier: symbol }),
);

export const AssetUnionSchema = Schema.Union(
  ...BluechipAssets,
  ...NativeAssets,
  ...StableAssets,
  ...XRDDerivativeAssets,
);

export class AssetSchema extends Schema.Class<AssetSchema>('AssetSchema')({
  resourceAddress: Schema.Literal(...resourceAddresses),
  assetType: Schema.Literal(...Object.values(AssetType)),
  symbol: Schema.Literal(...Object.values(flatTokenNameMap)),
}) {
  static fromResourceAddress = flow(
    getAssetByResourceAddress,
    AssetSchema.pipe(Schema.decodeUnknown),
  );
}
