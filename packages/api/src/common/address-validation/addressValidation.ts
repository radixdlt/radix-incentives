import { Context, Effect, Layer } from "effect";

// Import all protocol constants
import {
  DappConstants,
  type ActivityId,
  flatTokenNameMap,
  nativeAssets,
  type TokenInfo,
  Assets,
} from "data";

// Multiplier for constant product market maker pools (less efficient than precision pools)
export const CONSTANT_PRODUCT_MULTIPLIER = 0.5;

const CaviarNineConstants = DappConstants.CaviarNine.constants;
const DefiPlazaConstants = DappConstants.DefiPlaza.constants;
const WeftFinanceConstants = DappConstants.WeftFinance.constants;
const RootFinanceConstants = DappConstants.RootFinance.constants;
const OciswapConstants = DappConstants.Ociswap.constants;
const SurgeConstants = DappConstants.Surge.constants;

export type ProtocolValidation = {
  componentAddress: string;
  packageAddress?: string;
};

export type PoolTradingInfo = {
  componentAddress: string;
  activityId: ActivityId;
};

export class UnknownTokenError extends Error {
  readonly _tag = "UnknownTokenError";
  constructor(readonly resourceAddress: string) {
    super(`Unknown token resource address: ${resourceAddress}`);
  }
}

export type AddressValidationServiceError = UnknownTokenError;

export class AddressValidationService extends Context.Tag(
  "AddressValidationService"
)<
  AddressValidationService,
  {
    // Generic validation methods (for cases where any dApp is acceptable)
    isValidPoolComponent: (address: string) => boolean;
    isValidProtocolComponent: (
      address: string,
      packageAddress?: string
    ) => boolean;
    isValidResourceAddress: (address: string) => boolean;

    // dApp-specific validation methods (for strict event matching)
    isCaviarNinePoolComponent: (address: string) => boolean;
    isCaviarNinePrecisionPoolComponent: (address: string) => boolean;
    isCaviarNineHyperstakePoolComponent: (address: string) => boolean;
    isCaviarNineSimplePoolComponent: (address: string) => boolean;
    isDefiPlazaPoolComponent: (address: string) => boolean;
    isOciswapPoolComponent: (address: string) => boolean;
    isOciswapPrecisionPoolComponent: (address: string) => boolean;
    isOciswapFlexPoolComponent: (address: string) => boolean;
    isOciswapBasicPoolComponent: (address: string) => boolean;
    isWeftFinanceComponent: (
      address: string,
      packageAddress?: string
    ) => boolean;
    isRootFinanceComponent: (
      address: string,
      packageAddress?: string
    ) => boolean;

    // Resource validation by dApp
    isCaviarNineResource: (address: string) => boolean;
    isDefiPlazaResource: (address: string) => boolean;
    isOciswapResource: (address: string) => boolean;
    isWeftFinanceResource: (address: string) => boolean;
    isRootFinanceResource: (address: string) => boolean;
    isSurgeResource: (address: string) => boolean;
    isBaseAssetResource: (address: string) => boolean;

    // Trading and utility methods
    getTradingActivityIdForPool: (address: string) => ActivityId | undefined;
    getTokenName: (
      resourceAddress: string
    ) => Effect.Effect<string, UnknownTokenError>;
    getTokenNameAndNativeAssetStatus: (
      resourceAddress: string
    ) => Effect.Effect<TokenInfo, UnknownTokenError>;

    // Pool efficiency methods
    isConstantProductPool: (componentAddress: string) => boolean;
  }
>() {}

// Helper function to recursively extract all values of a specific property from nested objects
function extractPropertyValues(
  obj: Record<string, unknown>,
  propertyName: string
): string[] {
  const results: string[] = [];

  function traverse(current: unknown): void {
    if (current && typeof current === "object") {
      const currentObj = current as Record<string, unknown>;

      // If current object has the property we're looking for, add it
      if (
        propertyName in currentObj &&
        typeof currentObj[propertyName] === "string"
      ) {
        results.push(currentObj[propertyName]);
      }

      // Recursively traverse nested objects
      for (const value of Object.values(currentObj)) {
        traverse(value);
      }
    }
  }

  traverse(obj);
  return results;
}

// Helper function to extract component+package pairs for protocol validation
function extractProtocolValidations(
  obj: Record<string, unknown>
): ProtocolValidation[] {
  const results: ProtocolValidation[] = [];

  function traverse(current: unknown): void {
    if (current && typeof current === "object") {
      const currentObj = current as Record<string, unknown>;

      // If current object has componentAddress, it's a potential protocol component
      if (
        "componentAddress" in currentObj &&
        typeof currentObj.componentAddress === "string"
      ) {
        results.push({
          componentAddress: currentObj.componentAddress,
          packageAddress:
            typeof currentObj.packageAddress === "string"
              ? currentObj.packageAddress
              : undefined,
        });
      }

      // Recursively traverse nested objects
      for (const value of Object.values(currentObj)) {
        traverse(value);
      }
    }
  }

  traverse(obj);
  return results;
}

// Helper function to get token name from resource address
function getTokenNameSync(resourceAddress: string): string | undefined {
  return flatTokenNameMap[resourceAddress as keyof typeof flatTokenNameMap];
}

// Precompute sets for resource validation at module load
const validResourceAddresses = new Set([
  ...extractPropertyValues(Assets, "resourceAddress"),
  ...Object.values(Assets.Fungible),
  ...extractPropertyValues(CaviarNineConstants, "resourceAddress"),
  ...extractPropertyValues(CaviarNineConstants, "liquidity_receipt"),
  ...extractPropertyValues(DefiPlazaConstants, "baseLpResourceAddress"),
  ...extractPropertyValues(DefiPlazaConstants, "quoteLpResourceAddress"),
  ...extractPropertyValues(DefiPlazaConstants, "baseResourceAddress"),
  ...extractPropertyValues(DefiPlazaConstants, "quoteResourceAddress"),
  ...extractPropertyValues(OciswapConstants, "lpResourceAddress"),
  ...extractPropertyValues(OciswapConstants, "token_x"),
  ...extractPropertyValues(OciswapConstants, "token_y"),
  ...extractPropertyValues(WeftFinanceConstants, "resourceAddress"),
  ...extractPropertyValues(RootFinanceConstants, "resourceAddress"),
  RootFinanceConstants.receiptResourceAddress,
  ...extractPropertyValues(SurgeConstants, "resourceAddress"),
]);

const caviarNinePrecisionPoolComponents = new Set([
  // Shape liquidity pools (precision pools)
  ...Object.values(CaviarNineConstants.shapeLiquidityPools).map(
    (p) => p.componentAddress
  ),
] as string[]);

const caviarNineHyperstakePoolComponents = new Set([
  CaviarNineConstants.HLP.componentAddress,
] as string[]);

const caviarNineSimplePoolComponents = new Set([
  ...Object.values(CaviarNineConstants.simplePools).map(
    (p) => p.componentAddress
  ),
] as string[]);

// Keep the original combined set for backward compatibility
const caviarNineComponents = new Set([
  ...caviarNinePrecisionPoolComponents,
  ...caviarNineHyperstakePoolComponents,
  ...caviarNineSimplePoolComponents,
]);

const defiPlazaComponents = new Set(
  Object.values(DefiPlazaConstants)
    .map((pool) => pool.componentAddress)
    .filter((addr) => addr && addr.length > 0) as string[]
);

const ociswapPrecisionPoolComponents = new Set([
  ...Object.values(OciswapConstants.pools).map((pool) => pool.componentAddress),
  ...Object.values(OciswapConstants.poolsV2).map(
    (pool) => pool.componentAddress
  ),
] as string[]);

const ociswapFlexPoolComponents = new Set(
  Object.values(OciswapConstants.flexPools).map(
    (pool) => pool.componentAddress
  ) as string[]
);

const ociswapBasicPoolComponents = new Set(
  Object.values(OciswapConstants.basicPools).map(
    (pool) => pool.componentAddress
  ) as string[]
);

// Keep the original combined set for backward compatibility
const ociswapComponents = new Set([
  ...ociswapPrecisionPoolComponents,
  ...ociswapFlexPoolComponents,
  ...ociswapBasicPoolComponents,
]);

const caviarNineResources = new Set([
  CaviarNineConstants.LSULP.resourceAddress,
  CaviarNineConstants.HLP.resourceAddress,
  ...extractPropertyValues(
    CaviarNineConstants.shapeLiquidityPools,
    "liquidity_receipt"
  ),
  ...extractPropertyValues(CaviarNineConstants.shapeLiquidityPools, "token_x"),
  ...extractPropertyValues(CaviarNineConstants.shapeLiquidityPools, "token_y"),
  CaviarNineConstants.HLP.token_x,
  CaviarNineConstants.HLP.token_y,
  ...extractPropertyValues(
    CaviarNineConstants.simplePools,
    "lpResourceAddress"
  ),
  ...extractPropertyValues(CaviarNineConstants.simplePools, "token_x"),
  ...extractPropertyValues(CaviarNineConstants.simplePools, "token_y"),
]);

const defiPlazaResources = new Set([
  ...extractPropertyValues(DefiPlazaConstants, "baseLpResourceAddress"),
  ...extractPropertyValues(DefiPlazaConstants, "quoteLpResourceAddress"),
  ...extractPropertyValues(DefiPlazaConstants, "baseResourceAddress"),
  ...extractPropertyValues(DefiPlazaConstants, "quoteResourceAddress"),
]);

const ociswapResources = new Set([
  ...extractPropertyValues(OciswapConstants.pools, "lpResourceAddress"),
  ...extractPropertyValues(OciswapConstants.pools, "token_x"),
  ...extractPropertyValues(OciswapConstants.pools, "token_y"),
  ...extractPropertyValues(OciswapConstants.poolsV2, "lpResourceAddress"),
  ...extractPropertyValues(OciswapConstants.poolsV2, "token_x"),
  ...extractPropertyValues(OciswapConstants.poolsV2, "token_y"),
  ...extractPropertyValues(OciswapConstants.flexPools, "lpResourceAddress"),
  ...extractPropertyValues(OciswapConstants.flexPools, "token_x"),
  ...extractPropertyValues(OciswapConstants.flexPools, "token_y"),
  ...extractPropertyValues(OciswapConstants.basicPools, "lpResourceAddress"),
  ...extractPropertyValues(OciswapConstants.basicPools, "token_x"),
  ...extractPropertyValues(OciswapConstants.basicPools, "token_y"),
]);

const weftResources = new Set(
  extractPropertyValues(WeftFinanceConstants, "resourceAddress")
);

const rootResources = new Set([
  RootFinanceConstants.receiptResourceAddress,
  ...extractPropertyValues(RootFinanceConstants, "resourceAddress"),
]);

const surgeResources = new Set(
  extractPropertyValues(SurgeConstants, "resourceAddress")
);

// Constant product pools (less efficient, use CONSTANT_PRODUCT_MULTIPLIER)
const constantProductPools = new Set([
  // Ociswap FlexPools and BasicPools
  ...extractPropertyValues(OciswapConstants.flexPools, "componentAddress"),
  ...extractPropertyValues(OciswapConstants.basicPools, "componentAddress"),
  // Caviarnine SimplePools
  ...extractPropertyValues(CaviarNineConstants.simplePools, "componentAddress"),
  // DefiPlaza pools (all are constant product)
  ...extractPropertyValues(DefiPlazaConstants, "componentAddress"),
]);

const baseAssets = new Set(Object.values(Assets.Fungible) as string[]);

// Precompute pool trading map at module load
const poolTradingMap = (() => {
  const map = new Map<string, ActivityId>();
  // CaviarNine Shape Liquidity Pools
  for (const pool of Object.values(CaviarNineConstants.shapeLiquidityPools)) {
    const tokenX = getTokenNameSync(pool.token_x);
    const tokenY = getTokenNameSync(pool.token_y);
    if (tokenX && tokenY) {
      const [firstToken, secondToken] = [tokenX, tokenY].sort((a, b) =>
        a.localeCompare(b)
      );
      // TODO: improve this
      const activityId = `c9_trade_${firstToken}-${secondToken}` as ActivityId;
      map.set(pool.componentAddress, activityId);
    }
  }
  // CaviarNine HLP (Hyperstake Liquidity Pool)
  const hlpTokenX = getTokenNameSync(CaviarNineConstants.HLP.token_x);
  const hlpTokenY = getTokenNameSync(CaviarNineConstants.HLP.token_y);
  if (hlpTokenX && hlpTokenY) {
    const activityId = "c9_trade_hyperstake" as ActivityId;
    map.set(CaviarNineConstants.HLP.componentAddress, activityId);
  }
  // CaviarNine Simple Pools
  for (const pool of Object.values(CaviarNineConstants.simplePools)) {
    const tokenX = getTokenNameSync(pool.token_x);
    const tokenY = getTokenNameSync(pool.token_y);
    if (tokenX && tokenY) {
      const [firstToken, secondToken] = [tokenX, tokenY].sort((a, b) =>
        a.localeCompare(b)
      );
      // TODO: improve this
      const activityId = `c9_trade_${firstToken}-${secondToken}` as ActivityId;
      map.set(pool.componentAddress, activityId);
    }
  }
  // DefiPlaza Pools
  for (const [_poolKey, pool] of Object.entries(DefiPlazaConstants)) {
    if (pool.componentAddress && pool.componentAddress.length > 0) {
      const baseToken = getTokenNameSync(pool.baseResourceAddress);
      const quoteToken = getTokenNameSync(pool.quoteResourceAddress);
      if (baseToken && quoteToken) {
        const [firstToken, secondToken] = [baseToken, quoteToken].sort((a, b) =>
          a.localeCompare(b)
        );
        // TODO: improve this
        const activityId =
          `defiPlaza_trade_${firstToken}-${secondToken}` as ActivityId;
        map.set(pool.componentAddress, activityId);
      }
    }
  }
  // Ociswap Precision Pools (V1)
  for (const pool of Object.values(OciswapConstants.pools)) {
    const tokenX = getTokenNameSync(pool.token_x);
    const tokenY = getTokenNameSync(pool.token_y);
    if (tokenX && tokenY) {
      const [firstToken, secondToken] = [tokenX, tokenY].sort((a, b) =>
        a.localeCompare(b)
      );
      // TODO: improve this
      const activityId = `oci_trade_${firstToken}-${secondToken}` as ActivityId;
      map.set(pool.componentAddress, activityId);
    }
  }
  // Ociswap Precision Pools (V2)
  for (const pool of Object.values(OciswapConstants.poolsV2)) {
    const tokenX = getTokenNameSync(pool.token_x);
    const tokenY = getTokenNameSync(pool.token_y);
    if (tokenX && tokenY) {
      const [firstToken, secondToken] = [tokenX, tokenY].sort((a, b) =>
        a.localeCompare(b)
      );
      // TODO: improve this
      const activityId = `oci_trade_${firstToken}-${secondToken}` as ActivityId;
      map.set(pool.componentAddress, activityId);
    }
  }
  // Ociswap Flex Pools
  for (const pool of Object.values(OciswapConstants.flexPools)) {
    const tokenX = getTokenNameSync(pool.token_x) ?? "";
    const tokenY = getTokenNameSync(pool.token_y) ?? "";

    if (tokenX && tokenY) {
      const [firstToken, secondToken] = [tokenX, tokenY].sort((a, b) =>
        a.localeCompare(b)
      );
      // TODO: improve this
      const activityId = `oci_trade_${firstToken}-${secondToken}` as ActivityId;
      map.set(pool.componentAddress, activityId);
    }
  }
  // Ociswap Basic Pools
  for (const pool of Object.values(OciswapConstants.basicPools)) {
    const tokenX = getTokenNameSync(pool.token_x);
    const tokenY = getTokenNameSync(pool.token_y);
    if (tokenX && tokenY) {
      const [firstToken, secondToken] = [tokenX, tokenY].sort((a, b) =>
        a.localeCompare(b)
      );
      // TODO: improve this
      const activityId = `oci_trade_${firstToken}-${secondToken}` as ActivityId;
      map.set(pool.componentAddress, activityId);
    }
  }
  return map;
})();

// Standalone validation functions (can be used without service injection)
export const isValidResourceAddress = (resourceAddress: string): boolean => {
  return validResourceAddresses.has(resourceAddress);
};

export const isCaviarNinePrecisionPoolComponent = (
  componentAddress: string
): boolean => {
  return caviarNinePrecisionPoolComponents.has(componentAddress);
};

export const isCaviarNineHyperstakePoolComponent = (
  componentAddress: string
): boolean => {
  return caviarNineHyperstakePoolComponents.has(componentAddress);
};

export const isCaviarNineSimplePoolComponent = (
  componentAddress: string
): boolean => {
  return caviarNineSimplePoolComponents.has(componentAddress);
};

// Keep the original function for backward compatibility
export const isCaviarNinePoolComponent = (
  componentAddress: string
): boolean => {
  return caviarNineComponents.has(componentAddress);
};

export const isDefiPlazaPoolComponent = (componentAddress: string): boolean => {
  return defiPlazaComponents.has(componentAddress);
};

export const isOciswapPrecisionPoolComponent = (
  componentAddress: string
): boolean => {
  return ociswapPrecisionPoolComponents.has(componentAddress);
};

export const isOciswapFlexPoolComponent = (
  componentAddress: string
): boolean => {
  return ociswapFlexPoolComponents.has(componentAddress);
};

export const isOciswapBasicPoolComponent = (
  componentAddress: string
): boolean => {
  return ociswapBasicPoolComponents.has(componentAddress);
};

// Keep the original function for backward compatibility
export const isOciswapPoolComponent = (componentAddress: string): boolean => {
  return ociswapComponents.has(componentAddress);
};

export const isWeftFinanceComponent = (
  componentAddress: string,
  packageAddress: string
): boolean => {
  const isWeftV2Event =
    componentAddress === WeftFinanceConstants.v2.WeftyV2.componentAddress;
  const isExpectedPackage =
    packageAddress === WeftFinanceConstants.v2.WeftyV2.packageAddress;

  return isWeftV2Event && isExpectedPackage;
};

export const isRootFinanceComponent = (
  componentAddress: string,
  packageAddress: string
): boolean => {
  const isRootFinanceEvent =
    componentAddress === RootFinanceConstants.componentAddress;
  const isExpectedPackage =
    packageAddress === RootFinanceConstants.packageAddress;

  return isRootFinanceEvent && isExpectedPackage;
};

export const isHlpPoolComponent = (componentAddress: string): boolean => {
  return componentAddress === CaviarNineConstants.HLP.componentAddress;
};

export const AddressValidationServiceLive = Layer.succeed(
  AddressValidationService,
  {
    // Generic validation methods (cases where any dApp is acceptable)
    isValidPoolComponent: (componentAddress: string): boolean => {
      const validPoolComponents = new Set([
        ...extractPropertyValues(CaviarNineConstants, "componentAddress"),
        ...extractPropertyValues(CaviarNineConstants, "component"),
        ...extractPropertyValues(
          CaviarNineConstants.simplePools,
          "componentAddress"
        ),
        ...extractPropertyValues(DefiPlazaConstants, "componentAddress"),
        ...extractPropertyValues(OciswapConstants.pools, "componentAddress"),
        ...extractPropertyValues(OciswapConstants.poolsV2, "componentAddress"),
        ...extractPropertyValues(
          OciswapConstants.flexPools,
          "componentAddress"
        ),
        ...extractPropertyValues(
          OciswapConstants.basicPools,
          "componentAddress"
        ),
      ]);

      return validPoolComponents.has(componentAddress);
    },

    // dApp-specific pool component validation
    isCaviarNinePoolComponent,
    isCaviarNinePrecisionPoolComponent,
    isCaviarNineHyperstakePoolComponent,
    isCaviarNineSimplePoolComponent,
    isDefiPlazaPoolComponent,
    isOciswapPoolComponent,
    isOciswapPrecisionPoolComponent,
    isOciswapFlexPoolComponent,
    isOciswapBasicPoolComponent,

    isValidProtocolComponent: (
      componentAddress: string,
      packageAddress?: string
    ): boolean => {
      // Generic validation - checks ALL protocols
      const protocolValidations = [
        ...extractProtocolValidations(WeftFinanceConstants),
        ...extractProtocolValidations(RootFinanceConstants),
      ];

      return protocolValidations.some((validation) => {
        const componentMatches =
          validation.componentAddress === componentAddress;
        // If validation has no package requirement, only check component
        if (!validation.packageAddress) {
          return componentMatches;
        }
        // If validation requires package, both must match
        return componentMatches && validation.packageAddress === packageAddress;
      });
    },

    // dApp-specific protocol component validation
    isWeftFinanceComponent: (
      componentAddress: string,
      packageAddress?: string
    ): boolean => {
      return isWeftFinanceComponent(componentAddress, packageAddress || "");
    },

    isRootFinanceComponent: (
      componentAddress: string,
      packageAddress?: string
    ): boolean => {
      return isRootFinanceComponent(componentAddress, packageAddress || "");
    },

    isValidResourceAddress,

    // dApp-specific resource validation
    isCaviarNineResource: (resourceAddress: string): boolean => {
      return caviarNineResources.has(resourceAddress);
    },

    isDefiPlazaResource: (resourceAddress: string): boolean => {
      return defiPlazaResources.has(resourceAddress);
    },

    isOciswapResource: (resourceAddress: string): boolean => {
      return ociswapResources.has(resourceAddress);
    },

    isWeftFinanceResource: (resourceAddress: string): boolean => {
      return weftResources.has(resourceAddress);
    },

    isRootFinanceResource: (resourceAddress: string): boolean => {
      return rootResources.has(resourceAddress);
    },

    isSurgeResource: (resourceAddress: string): boolean => {
      return surgeResources.has(resourceAddress);
    },

    isBaseAssetResource: (resourceAddress: string): boolean => {
      return baseAssets.has(resourceAddress);
    },

    getTradingActivityIdForPool: (
      componentAddress: string
    ): ActivityId | undefined => {
      return poolTradingMap.get(componentAddress);
    },

    getTokenName: (
      resourceAddress: string
    ): Effect.Effect<string, UnknownTokenError> => {
      const tokenName =
        flatTokenNameMap[resourceAddress as keyof typeof flatTokenNameMap];

      if (tokenName) {
        return Effect.succeed(tokenName);
      }

      return Effect.fail(new UnknownTokenError(resourceAddress));
    },

    getTokenNameAndNativeAssetStatus: (
      resourceAddress: string
    ): Effect.Effect<TokenInfo, UnknownTokenError> => {
      const tokenName =
        flatTokenNameMap[resourceAddress as keyof typeof flatTokenNameMap];

      if (tokenName) {
        return Effect.succeed({
          name: tokenName,
          isNativeAsset: nativeAssets.has(resourceAddress),
        });
      }

      return Effect.fail(new UnknownTokenError(resourceAddress));
    },

    // Pool efficiency methods
    isConstantProductPool: (componentAddress: string): boolean => {
      return constantProductPools.has(componentAddress);
    },
  }
);
