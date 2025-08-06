import { Data, Effect } from 'effect';
import {
  AssetType,
  bluechipAssets,
  flatTokenNameMap,
  nativeAssets,
  stableAssets,
  xrdDerivativeAssets,
} from '../assets';

/**
 * Sort tokens in ascending alphabetical order
 * @param token1 - The first token
 * @param token2 - The second token
 * @returns The token pair
 */
export const getTokenPair = (token1: string, token2: string) => {
  const [firstToken, secondToken] = [token1, token2].sort((a, b) =>
    a.localeCompare(b),
  );
  return `${firstToken}-${secondToken}`;
};

class TokenNotFoundError extends Data.TaggedError('TokenNotFoundError')<{
  resourceAddress: string;
  message: string;
}> {}

class AssetTypeNotFoundError extends Data.TaggedError(
  'AssetTypeNotFoundError',
)<{
  resourceAddress: string;
  message: string;
}> {}

export const getAssetTypeFromResourceAddress = Effect.fn(function* (
  resourceAddress: string,
) {
  if (xrdDerivativeAssets.has(resourceAddress)) {
    return AssetType.XRD_DERIVATIVE;
  }
  if (nativeAssets.has(resourceAddress)) {
    return AssetType.NATIVE;
  }
  if (bluechipAssets.has(resourceAddress)) {
    return AssetType.BLUECHIP;
  }
  if (stableAssets.has(resourceAddress)) {
    return AssetType.STABLE;
  }
  return yield* Effect.fail(
    new AssetTypeNotFoundError({
      resourceAddress,
      message: `Asset type not found for resource address: ${resourceAddress}`,
    }),
  );
});

export type TokenDetails = {
  name: string;
  resourceAddress: string;
  assetType: AssetType;
};

export const getTokenDetailsFromResourceAddress = Effect.fn(function* (
  resourceAddress: string,
) {
  const maybeToken =
    flatTokenNameMap[resourceAddress as keyof typeof flatTokenNameMap];

  if (!maybeToken) {
    return yield* Effect.fail(
      new TokenNotFoundError({
        resourceAddress,
        message: `Token not found for resource address: ${resourceAddress}`,
      }),
    );
  }
  const assetType = yield* getAssetTypeFromResourceAddress(resourceAddress);
  return {
    name: maybeToken,
    resourceAddress,
    assetType,
  } as TokenDetails;
});

export const getTokenPairFromResourceAddresses = Effect.fn(function* (
  resourceAddress1: string,
  resourceAddress2: string,
) {
  const tokenA = yield* getTokenDetailsFromResourceAddress(resourceAddress1);
  const tokenB = yield* getTokenDetailsFromResourceAddress(resourceAddress2);

  const tokenPair = getTokenPair(tokenA.name, tokenB.name);

  return { tokenPair, assets: [tokenA, tokenB] };
});
