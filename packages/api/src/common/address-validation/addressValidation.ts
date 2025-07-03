import { Context, Effect, Layer } from "effect";
import type { ActivityId } from "db/incentives";

// Import all protocol constants
import { CaviarNineConstants } from "../dapps/caviarnine/constants";
import { DefiPlaza } from "../dapps/defiplaza/constants";
import { WeftFinance } from "../dapps/weftFinance/constants";
import { RootFinance } from "../dapps/rootFinance/constants";
import { OciswapConstants } from "../dapps/ociswap/constants";
import { Assets } from "../assets/constants";
import { tokenNameMap } from "./tokenNameMap";

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
    isDefiPlazaPoolComponent: (address: string) => boolean;
    isOciswapPoolComponent: (address: string) => boolean;
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
    isBaseAssetResource: (address: string) => boolean;

    // Trading and utility methods
    getTradingActivityIdForPool: (address: string) => ActivityId | undefined;
    getTokenName: (
      resourceAddress: string
    ) => Effect.Effect<string, UnknownTokenError>;
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
  return tokenNameMap[resourceAddress as keyof typeof tokenNameMap];
}

// Precompute sets for resource validation at module load
const validResourceAddresses = new Set([
  ...extractPropertyValues(Assets, "resourceAddress"),
  ...Object.values(Assets.Fungible),
  ...extractPropertyValues(CaviarNineConstants, "resourceAddress"),
  ...extractPropertyValues(CaviarNineConstants, "liquidity_receipt"),
  ...extractPropertyValues(DefiPlaza, "baseLpResourceAddress"),
  ...extractPropertyValues(DefiPlaza, "quoteLpResourceAddress"),
  ...extractPropertyValues(DefiPlaza, "baseResourceAddress"),
  ...extractPropertyValues(DefiPlaza, "quoteResourceAddress"),
  ...extractPropertyValues(OciswapConstants, "lpResourceAddress"),
  ...extractPropertyValues(OciswapConstants, "token_x"),
  ...extractPropertyValues(OciswapConstants, "token_y"),
  ...extractPropertyValues(WeftFinance, "resourceAddress"),
  ...extractPropertyValues(RootFinance, "resourceAddress"),
  RootFinance.receiptResourceAddress,
]);

const caviarNineComponents = new Set([
  // Shape liquidity pools
  ...Object.values(CaviarNineConstants.shapeLiquidityPools).map(
    (p) => p.componentAddress
  ),
  // TODO: think about uncommenting this if we ever need it, but we don't need to watch events from the LSULP pool for now
  //CaviarNineConstants.LSULP.component,
] as string[]);

const defiPlazaComponents = new Set(
  Object.values(DefiPlaza)
    .map((pool) => pool.componentAddress)
    .filter((addr) => addr && addr.length > 0) as string[]
);

const ociswapComponents = new Set(
  Object.values(OciswapConstants.pools).map(
    (pool) => pool.componentAddress
  ) as string[]
);

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
]);

const defiPlazaResources = new Set([
  ...extractPropertyValues(DefiPlaza, "baseLpResourceAddress"),
  ...extractPropertyValues(DefiPlaza, "quoteLpResourceAddress"),
  ...extractPropertyValues(DefiPlaza, "baseResourceAddress"),
  ...extractPropertyValues(DefiPlaza, "quoteResourceAddress"),
]);

const ociswapResources = new Set([
  ...extractPropertyValues(OciswapConstants.pools, "lpResourceAddress"),
  ...extractPropertyValues(OciswapConstants.pools, "token_x"),
  ...extractPropertyValues(OciswapConstants.pools, "token_y"),
]);

const weftResources = new Set(
  extractPropertyValues(WeftFinance, "resourceAddress")
);

const rootResources = new Set([
  RootFinance.receiptResourceAddress,
  ...extractPropertyValues(RootFinance, "resourceAddress"),
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
      const activityId: ActivityId = `c9_trade_${firstToken}-${secondToken}`;
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
  // DefiPlaza Pools
  for (const [_poolKey, pool] of Object.entries(DefiPlaza)) {
    if (pool.componentAddress && pool.componentAddress.length > 0) {
      const baseToken = getTokenNameSync(pool.baseResourceAddress);
      const quoteToken = getTokenNameSync(pool.quoteResourceAddress);
      if (baseToken && quoteToken) {
        const [firstToken, secondToken] = [baseToken, quoteToken].sort((a, b) =>
          a.localeCompare(b)
        );
        const activityId: ActivityId = `defiPlaza_trade_${firstToken}-${secondToken}`;
        map.set(pool.componentAddress, activityId);
      }
    }
  }
  // Ociswap Pools
  for (const pool of Object.values(OciswapConstants.pools)) {
    const tokenX = getTokenNameSync(pool.token_x);
    const tokenY = getTokenNameSync(pool.token_y);
    if (tokenX && tokenY) {
      const [firstToken, secondToken] = [tokenX, tokenY].sort((a, b) =>
        a.localeCompare(b)
      );
      const activityId: ActivityId = `oci_trade_${firstToken}-${secondToken}`;
      map.set(pool.componentAddress, activityId);
    }
  }
  return map;
})();

// Standalone validation functions (can be used without service injection)
export const isValidResourceAddress = (resourceAddress: string): boolean => {
  return validResourceAddresses.has(resourceAddress);
};

export const isCaviarNinePoolComponent = (
  componentAddress: string
): boolean => {
  return caviarNineComponents.has(componentAddress);
};

export const isDefiPlazaPoolComponent = (componentAddress: string): boolean => {
  return defiPlazaComponents.has(componentAddress);
};

export const isOciswapPoolComponent = (componentAddress: string): boolean => {
  return ociswapComponents.has(componentAddress);
};

export const isWeftFinanceComponent = (
  componentAddress: string,
  packageAddress: string
): boolean => {
  const isWeftV2Event =
    componentAddress === WeftFinance.v2.WeftyV2.componentAddress;
  const isExpectedPackage =
    packageAddress === WeftFinance.v2.WeftyV2.packageAddress;

  return isWeftV2Event && isExpectedPackage;
};

export const isRootFinanceComponent = (
  componentAddress: string,
  packageAddress: string
): boolean => {
  const isRootFinanceEvent = componentAddress === RootFinance.componentAddress;
  const isExpectedPackage = packageAddress === RootFinance.packageAddress;

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
        ...extractPropertyValues(DefiPlaza, "componentAddress"),
        ...extractPropertyValues(OciswapConstants.pools, "componentAddress"),
      ]);

      return validPoolComponents.has(componentAddress);
    },

    // dApp-specific pool component validation
    isCaviarNinePoolComponent,
    isDefiPlazaPoolComponent,
    isOciswapPoolComponent,

    isValidProtocolComponent: (
      componentAddress: string,
      packageAddress?: string
    ): boolean => {
      // Generic validation - checks ALL protocols
      const protocolValidations = [
        ...extractProtocolValidations(WeftFinance),
        ...extractProtocolValidations(RootFinance),
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
        tokenNameMap[resourceAddress as keyof typeof tokenNameMap];

      if (tokenName) {
        return Effect.succeed(tokenName);
      }

      return Effect.fail(new UnknownTokenError(resourceAddress));
    },
  }
);
