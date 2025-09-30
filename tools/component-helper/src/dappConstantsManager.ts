import { Effect } from 'effect';
import fs from 'node:fs/promises';
import path from 'node:path';

type ComponentData = {
  componentAddress: string;
  dappId: string;
  packageAddress: string;
  data: {
    xToken?: { resourceAddress: string; symbol: string };
    yToken?: { resourceAddress: string; symbol: string };
    x_address?: { resourceAddress: string; symbol: string };
    y_address?: { resourceAddress: string; symbol: string };
    liquidityReceipt?: string;
    liquidityPool?: string;
    poolAddress?: string;
  };
};

export class DappConstantsManager extends Effect.Service<DappConstantsManager>()(
  'DappConstantsManager',
  {
    effect: Effect.gen(function* () {
      const getConstantsFilePath = (dappId: string): string => {
        const basePath = path.join(process.cwd(), '../../packages/data/src/dapps');
        switch (dappId) {
          case 'c9':
            return path.join(basePath, 'caviarnine/constants.ts');
          case 'oc':
            return path.join(basePath, 'ociswap/constants.ts');
          case 'dp':
            return path.join(basePath, 'defiPlaza/constants.ts');
          default:
            throw new Error(`Unsupported dapp ID: ${dappId}`);
        }
      };


      const generatePoolKey = (xToken: string, yToken: string): string => {
        return `${xToken.toUpperCase()}_${yToken.toUpperCase()}`;
      };

      // Package address mappings
      const PACKAGE_MAPPINGS = {
        c9: {
          shapeLiquidityPools: 'package_rdx1p4r9rkp0cq67wmlve544zgy0l45mswn6h798qdqm47x4762h383wa3', // QuantaSwap
          simplePools: 'package_rdx1pkhxu8zy5t7h3rww6jsftca22e2jdgqpc28rje7lnmkjxxf50zagr7', // WeightedPool
        },
        oc: {
          pools: 'package_rdx1pkrgvskdkglfd2ar4jkpw5r2tsptk85gap4hzr9h3qxw6ca40ts8dt',
          poolsV2: 'package_rdx1pkl8tdw43xqx64etxwdf8rjtvptqurq4c3fky0kaj6vwa0zrkfmcmc',
          basicPools: 'package_rdx1p5l6dp3slnh9ycd7gk700czwlck9tujn0zpdnd0efw09n2zdnn0lzx',
          flexPools: 'package_rdx1pkzxm6nw55wvz0e2fn79hd8t07834cxa8kpdlhq8s5lp5ldqpcglwe',
        },
      };

      const getPoolTypeFromPackageAddress = (dappId: string, packageAddress: string): string | null => {
        const mappings = PACKAGE_MAPPINGS[dappId as keyof typeof PACKAGE_MAPPINGS];
        if (!mappings) return null;

        for (const [poolType, packageAddr] of Object.entries(mappings)) {
          if (packageAddr === packageAddress) {
            return poolType;
          }
        }
        return null;
      };

      const addToCaviarNineConstants = Effect.fn(function* (component: ComponentData) {
        const filePath = getConstantsFilePath(component.dappId);
        const fileContent = yield* Effect.tryPromise(() => fs.readFile(filePath, 'utf-8'));

        // Determine pool type based on package address
        const poolType = getPoolTypeFromPackageAddress(component.dappId, component.packageAddress);
        if (!poolType) {
          return yield* Effect.fail(new Error(`Unknown package address for CaviarNine: ${component.packageAddress}`));
        }

        // Extract token information
        const xToken = component.data.xToken || component.data.x_address;
        const yToken = component.data.yToken || component.data.y_address;

        if (!xToken || !yToken) {
          return yield* Effect.fail(new Error('Missing token information for CaviarNine component'));
        }

        const poolKey = generatePoolKey(xToken.symbol, yToken.symbol);
        const poolName = `${xToken.symbol.toLowerCase()}/${yToken.symbol.toLowerCase()}`;

        // Check if component already exists
        if (fileContent.includes(component.componentAddress)) {
          return `Component ${component.componentAddress} already exists in CaviarNine constants`;
        }

        const lines = fileContent.split('\n');

        // Find the correct insertion point based on pool type
        let insertIndex = -1;
        if (poolType === 'shapeLiquidityPools') {
          // Find the closing brace of shapeLiquidityPools
          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('  },') &&
                lines[i + 1]?.includes('  simplePools: {')) {
              insertIndex = i;
              break;
            }
          }
        } else if (poolType === 'simplePools') {
          // Find the closing brace of simplePools
          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('  },') &&
                lines[i + 1]?.includes('} as const;')) {
              insertIndex = i;
              break;
            }
          }
        }

        if (insertIndex === -1) {
          return yield* Effect.fail(new Error(`Could not find insertion point in CaviarNine ${poolType}`));
        }

        // Generate the new pool entry based on pool type
        let newPoolEntry: string[];
        if (poolType === 'shapeLiquidityPools') {
          newPoolEntry = [
            `    ${poolKey}: {`,
            `      name: '${poolName}',`,
            `      componentAddress:`,
            `        '${component.componentAddress}',`,
            `      token_x: Assets.Fungible.${xToken.symbol.toUpperCase()},`,
            `      token_y: Assets.Fungible.${yToken.symbol.toUpperCase()},`,
            `      liquidity_receipt:`,
            `        '${component.data.liquidityReceipt || 'UNKNOWN_LIQUIDITY_RECEIPT'}',`,
            `    },`
          ];
        } else { // simplePools
          newPoolEntry = [
            `    ${poolKey}: {`,
            `      name: '${poolName.toUpperCase()}',`,
            `      componentAddress:`,
            `        '${component.componentAddress}',`,
            `      poolAddress:`,
            `        '${component.data.poolAddress || component.data.liquidityPool || 'UNKNOWN_POOL_ADDRESS'}',`,
            `      lpResourceAddress:`,
            `        '${component.data.liquidityReceipt || 'UNKNOWN_LP_RESOURCE'}',`,
            `      token_x: Assets.Fungible.${xToken.symbol.toUpperCase()},`,
            `      token_y: Assets.Fungible.${yToken.symbol.toUpperCase()},`,
            `    },`
          ];
        }

        // Insert the new pool entry
        lines.splice(insertIndex, 0, ...newPoolEntry);

        const newContent = lines.join('\n');
        yield* Effect.tryPromise(() => fs.writeFile(filePath, newContent));

        return `Added ${poolKey} to CaviarNine ${poolType}`;
      });

      const addToOciswapConstants = Effect.fn(function* (component: ComponentData) {
        const filePath = getConstantsFilePath(component.dappId);
        const fileContent = yield* Effect.tryPromise(() => fs.readFile(filePath, 'utf-8'));

        // Determine pool type based on package address
        const poolType = getPoolTypeFromPackageAddress(component.dappId, component.packageAddress);
        if (!poolType) {
          return yield* Effect.fail(new Error(`Unknown package address for Ociswap: ${component.packageAddress}`));
        }

        // Extract token information
        const xToken = component.data.xToken || component.data.x_address;
        const yToken = component.data.yToken || component.data.y_address;

        if (!xToken || !yToken) {
          return yield* Effect.fail(new Error('Missing token information for Ociswap component'));
        }

        const poolKey = generatePoolKey(xToken.symbol, yToken.symbol);
        const poolName = `${xToken.symbol}/${yToken.symbol}`;

        // Check if component already exists
        if (fileContent.includes(component.componentAddress)) {
          return `Component ${component.componentAddress} already exists in Ociswap constants`;
        }

        const lines = fileContent.split('\n');

        // Find the correct insertion point based on pool type
        let insertIndex = -1;
        if (poolType === 'pools') {
          // Find closing brace of pools
          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('  },') &&
                lines[i + 1]?.includes('  poolsV2: {')) {
              insertIndex = i;
              break;
            }
          }
        } else if (poolType === 'poolsV2') {
          // Find closing brace of poolsV2
          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('  },') &&
                lines[i + 1]?.includes('  basicPools: {')) {
              insertIndex = i;
              break;
            }
          }
        } else if (poolType === 'basicPools') {
          // Find closing brace of basicPools
          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('  },') &&
                lines[i + 1]?.includes('  flexPools: {')) {
              insertIndex = i;
              break;
            }
          }
        } else if (poolType === 'flexPools') {
          // Find closing brace of flexPools
          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('  },') &&
                lines[i + 1]?.includes('} as const;')) {
              insertIndex = i;
              break;
            }
          }
        }

        if (insertIndex === -1) {
          return yield* Effect.fail(new Error(`Could not find insertion point in Ociswap ${poolType}`));
        }

        // Generate the new pool entry based on pool type
        let newPoolEntry: string[];
        if (poolType === 'basicPools') {
          newPoolEntry = [
            `    ${poolKey}: {`,
            `      name: '${poolName}',`,
            `      componentAddress:`,
            `        '${component.componentAddress}',`,
            `      poolAddress:`,
            `        '${component.data.poolAddress || component.data.liquidityPool || 'UNKNOWN_POOL_ADDRESS'}',`,
            `      lpResourceAddress:`,
            `        '${component.data.liquidityReceipt || 'UNKNOWN_LP_RESOURCE'}',`,
            `      token_x: Assets.Fungible.${xToken.symbol.toUpperCase()},`,
            `      token_y: Assets.Fungible.${yToken.symbol.toUpperCase()},`,
            `    },`
          ];
        } else {
          // For pools, poolsV2, and flexPools
          newPoolEntry = [
            `    ${poolKey}: {`,
            `      name: '${poolName}',`,
            `      componentAddress:`,
            `        '${component.componentAddress}',`,
            `      lpResourceAddress:`,
            `        '${component.data.liquidityReceipt || 'UNKNOWN_LP_RESOURCE'}',`,
            `      token_x: Assets.Fungible.${xToken.symbol.toUpperCase()},`,
            `      token_y: Assets.Fungible.${yToken.symbol.toUpperCase()},`,
            `      divisibility_x: 18,`,
            `      divisibility_y: 18,`,
            `    },`
          ];
        }

        // Insert the new pool entry
        lines.splice(insertIndex, 0, ...newPoolEntry);

        const newContent = lines.join('\n');
        yield* Effect.tryPromise(() => fs.writeFile(filePath, newContent));

        return `Added ${poolKey} to Ociswap ${poolType}`;
      });

      const addToDefiPlazaConstants = Effect.fn(function* (component: ComponentData) {
        const filePath = getConstantsFilePath(component.dappId);
        const fileContent = yield* Effect.tryPromise(() => fs.readFile(filePath, 'utf-8'));

        // Extract token information
        const xToken = component.data.xToken || component.data.x_address;
        const yToken = component.data.yToken || component.data.y_address;

        if (!xToken || !yToken) {
          return yield* Effect.fail(new Error('Missing token information for DefiPlaza component'));
        }

        const poolKey = `${xToken.symbol.toLowerCase()}${yToken.symbol.toLowerCase()}Pool`;

        // Check if component already exists
        if (fileContent.includes(component.componentAddress)) {
          return `Component ${component.componentAddress} already exists in DefiPlaza constants`;
        }

        const lines = fileContent.split('\n');

        // Find the closing brace before '} as const;'
        let insertIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].includes('  },') &&
              lines[i + 1]?.includes('} as const;')) {
            insertIndex = i;
            break;
          }
        }

        if (insertIndex === -1) {
          return yield* Effect.fail(new Error('Could not find insertion point in DefiPlaza constants'));
        }

        // Generate the new pool entry (simplified structure for DefiPlaza)
        const newPoolEntry = [
          `  ${poolKey}: {`,
          `    type: 'component',`,
          `    baseResourceAddress: Assets.Fungible.${xToken.symbol.toUpperCase()},`,
          `    quoteResourceAddress: Assets.Fungible.${yToken.symbol.toUpperCase()},`,
          `    componentAddress:`,
          `      '${component.componentAddress}',`,
          `    basePoolAddress: 'UNKNOWN_BASE_POOL',`,
          `    baseLpResourceAddress: 'UNKNOWN_BASE_LP',`,
          `    quotePoolAddress: 'UNKNOWN_QUOTE_POOL',`,
          `    quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',`,
          `  },`
        ];

        // Insert the new pool entry
        lines.splice(insertIndex, 0, ...newPoolEntry);

        const newContent = lines.join('\n');
        yield* Effect.tryPromise(() => fs.writeFile(filePath, newContent));

        return `Added ${poolKey} to DefiPlaza constants`;
      });

      const addComponentToConstants = Effect.fn(function* (component: ComponentData) {
        switch (component.dappId) {
          case 'c9':
            return yield* addToCaviarNineConstants(component);
          case 'oc':
            return yield* addToOciswapConstants(component);
          case 'dp':
            return yield* addToDefiPlazaConstants(component);
          default:
            return `Unsupported dapp ID: ${component.dappId}`;
        }
      });

      return {
        addComponentToConstants,
      };
    }),
  }
) {}