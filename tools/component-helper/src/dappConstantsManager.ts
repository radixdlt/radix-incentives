import fs from 'node:fs/promises';
import path from 'node:path';
import { Effect } from 'effect';
import type { Assets } from '../../../packages/data/src/assets';

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
        const basePath = path.join(
          process.cwd(),
          '../../packages/data/src/dapps',
        );
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

      // Map symbol to correct Assets.Fungible key
      const getAssetKey = (symbol: string): string => {
        const symbolLower = symbol.toLowerCase();
        const symbolUpper = symbol.toUpperCase();

        // Create a lookup map of lowercase symbols to actual Assets.Fungible keys
        const symbolMap: Record<string, keyof typeof Assets.Fungible> = {
          xrd: 'XRD',
          xusdc: 'xUSDC',
          xusdt: 'xUSDT',
          xeth: 'xETH',
          xwbtc: 'wxBTC',
          husdc: 'hUSDC',
          husdt: 'hUSDT',
          heth: 'hETH',
          hwbtc: 'hwBTC',
          lsulp: 'LSULP',
          caviar: 'CAVIAR',
          gab: 'GAB',
          elt: 'ELT',
          foton: 'FOTON',
          floop: 'FLOOP',
          oci: 'OCI',
          early: 'EARLY',
          dfp2: 'DFP2',
          astrl: 'ASTRL',
          ilis: 'ILIS',
          reddicks: 'REDDICKS',
          weft: 'WEFT',
          hlp: 'HLP',
          susd: 'sUSD',
          dph: 'DPH',
          radit: 'RADIT',
          ida: 'IDA',
          scam: 'SCAM',
          notusdc: 'NOTUSDC',
          notusdt: 'NOTUSDT',
          notxrd: 'NOTXRD',
          noteth: 'NOTETH',
          notbtc: 'NOTBTC',
          slg: 'SLG',
          mrk: 'MRK',
          ist: 'IST',
          swt: 'SWT',
          fire: 'FIRE',
          hug: 'HUG',
          guh: 'GUH',
          thc: 'THC',
          twerk: 'TWERK',
          rst: 'RST',
          scorp: 'SCORP',
          hodl: 'HODL',
          naka: 'NAKA',
          jit: 'JIT',
          mnc: 'MNC',
          now: 'NOW',
          farm: 'FARM',
          sim: 'SIM',
          chug: 'CHUG',
          blss: 'BLSS',
          zrck: 'ZRCK',
          popey: 'POPEY',
          dgc: 'DGC',
          long: 'LONG',
          wowo: 'WOWO',
          crew: 'CREW',
          rdv: 'RDV',
          'i£': 'I£',
          ipound: 'IPOUND',
          box: 'BOX',
          panda: 'PANDA',
        };

        // First try the exact symbol mapping
        if (symbolMap[symbolLower]) {
          return symbolMap[symbolLower];
        }

        // If not found, try direct uppercase (for new tokens)
        return symbolUpper;
      };

      // Format Assets.Fungible access for special characters
      const formatAssetAccess = (assetKey: string): string => {
        return assetKey.includes('£')
          ? `Assets.Fungible['${assetKey}']`
          : `Assets.Fungible.${assetKey}`;
      };

      // Format pool key for special characters
      const formatPoolKey = (key: string): string => {
        return key.includes('£') ? `'${key}'` : key;
      };

      // Package address mappings
      const PACKAGE_MAPPINGS = {
        c9: {
          shapeLiquidityPools:
            'package_rdx1p4r9rkp0cq67wmlve544zgy0l45mswn6h798qdqm47x4762h383wa3', // QuantaSwap
          simplePools:
            'package_rdx1pkhxu8zy5t7h3rww6jsftca22e2jdgqpc28rje7lnmkjxxf50zagr7', // WeightedPool
        },
        oc: {
          pools:
            'package_rdx1pkrgvskdkglfd2ar4jkpw5r2tsptk85gap4hzr9h3qxw6ca40ts8dt',
          poolsV2:
            'package_rdx1pkl8tdw43xqx64etxwdf8rjtvptqurq4c3fky0kaj6vwa0zrkfmcmc',
          basicPools:
            'package_rdx1p5l6dp3slnh9ycd7gk700czwlck9tujn0zpdnd0efw09n2zdnn0lzx',
          flexPools:
            'package_rdx1pkzxm6nw55wvz0e2fn79hd8t07834cxa8kpdlhq8s5lp5ldqpcglwe',
        },
      };

      const getPoolTypeFromPackageAddress = (
        dappId: string,
        packageAddress: string,
      ): string | null => {
        const mappings =
          PACKAGE_MAPPINGS[dappId as keyof typeof PACKAGE_MAPPINGS];
        if (!mappings) return null;

        for (const [poolType, packageAddr] of Object.entries(mappings)) {
          if (packageAddr === packageAddress) {
            return poolType;
          }
        }
        return null;
      };

      const addToCaviarNineConstants = Effect.fn(function* (
        component: ComponentData,
      ) {
        const filePath = getConstantsFilePath(component.dappId);
        const fileContent = yield* Effect.tryPromise(() =>
          fs.readFile(filePath, 'utf-8'),
        );

        // Determine pool type based on package address
        const poolType = getPoolTypeFromPackageAddress(
          component.dappId,
          component.packageAddress,
        );
        if (!poolType) {
          return `🚫 Component ${component.componentAddress} skipped - unknown package address for CaviarNine: ${component.packageAddress}`;
        }

        // Extract token information
        const xToken = component.data.xToken || component.data.x_address;
        const yToken = component.data.yToken || component.data.y_address;

        if (!xToken || !yToken) {
          return yield* Effect.fail(
            new Error('Missing token information for CaviarNine component'),
          );
        }

        // Skip components with invalid symbols (must start with letter and be alphanumeric)
        const isValidSymbol = (symbol: string) =>
          /^[a-zA-Z][a-zA-Z0-9]*$/.test(symbol);
        if (!isValidSymbol(xToken.symbol) || !isValidSymbol(yToken.symbol)) {
          return `🚫 Component ${component.componentAddress} skipped - invalid symbol (must start with letter and contain only alphanumeric characters): ${xToken.symbol} or ${yToken.symbol}`;
        }

        let poolKey = generatePoolKey(xToken.symbol, yToken.symbol);
        const poolName = `${xToken.symbol.toLowerCase()}/${yToken.symbol.toLowerCase()}`;

        // Check if component already exists
        if (fileContent.includes(component.componentAddress)) {
          return `Component ${component.componentAddress} already exists in CaviarNine constants`;
        }

        // Check for duplicate pool key and generate unique key if needed
        let keyCounter = 1;
        const originalPoolKey = poolKey;
        while (fileContent.includes(`    ${poolKey}: {`)) {
          keyCounter++;
          poolKey = `${originalPoolKey}_${keyCounter}`;
        }

        // Check for duplicate token pairs
        const xTokenKey = getAssetKey(xToken.symbol);
        const yTokenKey = getAssetKey(yToken.symbol);

        // Look for existing token pairs in the same pool type
        const tokenPairPattern = new RegExp(
          `token_x: Assets\\.Fungible\\.${xTokenKey},\\s*\\n\\s*token_y: Assets\\.Fungible\\.${yTokenKey},|` +
            `token_x: Assets\\.Fungible\\.${yTokenKey},\\s*\\n\\s*token_y: Assets\\.Fungible\\.${xTokenKey},`,
        );

        // Check if this token pair already exists in the specified pool type section
        let inTargetPoolSection = false;
        let existingPairFound = false;

        const lines = fileContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Detect when we enter the target pool type section
          if (line.includes(`${poolType}: {`)) {
            inTargetPoolSection = true;
            continue;
          }

          // Detect when we exit the target pool type section
          if (
            inTargetPoolSection &&
            (line.includes('  },') || line.includes('} as const;'))
          ) {
            break;
          }

          // Check for token pair match within the target section
          if (
            inTargetPoolSection &&
            line.includes('token_x: Assets.Fungible.')
          ) {
            const nextLine = lines[i + 1];
            if (nextLine?.includes('token_y: Assets.Fungible.')) {
              const currentPair = `${line.trim()}\n${nextLine.trim()}`;
              if (tokenPairPattern.test(currentPair)) {
                existingPairFound = true;
                break;
              }
            }
          }
        }

        if (existingPairFound) {
          return `🔴 Component ${component.componentAddress} ignored - token pair ${xToken.symbol.toUpperCase()}/${yToken.symbol.toUpperCase()} already exists in ${poolType}`;
        }

        // Find the correct insertion point based on pool type
        let insertIndex = -1;
        if (poolType === 'shapeLiquidityPools') {
          // Find the closing brace of shapeLiquidityPools (before simplePools)
          for (let i = 0; i < lines.length; i++) {
            if (
              lines[i].includes('  },') &&
              lines[i + 1]?.includes('  simplePools: {')
            ) {
              insertIndex = i;
              break;
            }
          }
        } else if (poolType === 'simplePools') {
          // Find the closing brace of simplePools (before } as const;)
          for (let i = 0; i < lines.length; i++) {
            if (
              lines[i].includes('  },') &&
              lines[i + 1]?.includes('} as const;')
            ) {
              insertIndex = i;
              break;
            }
          }
        }

        if (insertIndex === -1) {
          return yield* Effect.fail(
            new Error(
              `Could not find insertion point in CaviarNine ${poolType}`,
            ),
          );
        }

        // Generate the new pool entry based on pool type
        let newPoolEntry: string[];
        if (poolType === 'shapeLiquidityPools') {
          newPoolEntry = [
            `    ${formatPoolKey(poolKey)}: {`,
            `      name: '${poolName}',`,
            `      componentAddress:`,
            `        '${component.componentAddress}',`,
            `      token_x: ${formatAssetAccess(getAssetKey(xToken.symbol))},`,
            `      token_y: ${formatAssetAccess(getAssetKey(yToken.symbol))},`,
            `      liquidity_receipt:`,
            `        '${component.data.liquidityReceipt || 'UNKNOWN_LIQUIDITY_RECEIPT'}',`,
            `    },`,
          ];
        } else {
          // simplePools
          newPoolEntry = [
            `    ${formatPoolKey(poolKey)}: {`,
            `      name: '${poolName.toUpperCase()}',`,
            `      componentAddress:`,
            `        '${component.componentAddress}',`,
            `      poolAddress:`,
            `        '${component.data.poolAddress || component.data.liquidityPool || 'UNKNOWN_POOL_ADDRESS'}',`,
            `      lpResourceAddress:`,
            `        '${component.data.liquidityReceipt || 'UNKNOWN_LP_RESOURCE'}',`,
            `      token_x: ${formatAssetAccess(getAssetKey(xToken.symbol))},`,
            `      token_y: ${formatAssetAccess(getAssetKey(yToken.symbol))},`,
            `    },`,
          ];
        }

        // Insert the new pool entry
        lines.splice(insertIndex, 0, ...newPoolEntry);

        const newContent = lines.join('\n');
        yield* Effect.tryPromise(() => fs.writeFile(filePath, newContent));

        return `Added ${poolKey} to CaviarNine ${poolType}`;
      });

      const addToOciswapConstants = Effect.fn(function* (
        component: ComponentData,
      ) {
        const filePath = getConstantsFilePath(component.dappId);
        const fileContent = yield* Effect.tryPromise(() =>
          fs.readFile(filePath, 'utf-8'),
        );

        // Determine pool type based on package address
        const poolType = getPoolTypeFromPackageAddress(
          component.dappId,
          component.packageAddress,
        );
        if (!poolType) {
          return `🚫 Component ${component.componentAddress} skipped - unknown package address for Ociswap: ${component.packageAddress}`;
        }

        // Extract token information
        const xToken = component.data.xToken || component.data.x_address;
        const yToken = component.data.yToken || component.data.y_address;

        if (!xToken || !yToken) {
          return yield* Effect.fail(
            new Error('Missing token information for Ociswap component'),
          );
        }

        // Skip components with invalid symbols (must start with letter and be alphanumeric)
        const isValidSymbol = (symbol: string) =>
          /^[a-zA-Z][a-zA-Z0-9]*$/.test(symbol);
        if (!isValidSymbol(xToken.symbol) || !isValidSymbol(yToken.symbol)) {
          return `🚫 Component ${component.componentAddress} skipped - invalid symbol (must start with letter and contain only alphanumeric characters): ${xToken.symbol} or ${yToken.symbol}`;
        }

        let poolKey = generatePoolKey(xToken.symbol, yToken.symbol);
        const poolName = `${xToken.symbol}/${yToken.symbol}`;

        // Check if component already exists
        if (fileContent.includes(component.componentAddress)) {
          return `Component ${component.componentAddress} already exists in Ociswap constants`;
        }

        // Check for duplicate pool key and generate unique key if needed
        let keyCounter = 1;
        const originalPoolKey = poolKey;
        while (fileContent.includes(`    ${poolKey}: {`)) {
          keyCounter++;
          poolKey = `${originalPoolKey}_${keyCounter}`;
        }

        const lines = fileContent.split('\n');

        // Find the correct insertion point based on pool type
        let insertIndex = -1;
        if (poolType === 'pools') {
          // Find closing brace of pools
          for (let i = lines.length - 1; i >= 0; i--) {
            if (
              lines[i].includes('  },') &&
              lines[i + 1]?.includes('  poolsV2: {')
            ) {
              insertIndex = i;
              break;
            }
          }
        } else if (poolType === 'poolsV2') {
          // Find closing brace of poolsV2
          for (let i = lines.length - 1; i >= 0; i--) {
            if (
              lines[i].includes('  },') &&
              lines[i + 1]?.includes('  basicPools: {')
            ) {
              insertIndex = i;
              break;
            }
          }
        } else if (poolType === 'basicPools') {
          // Find closing brace of basicPools
          for (let i = lines.length - 1; i >= 0; i--) {
            if (
              lines[i].includes('  },') &&
              lines[i + 1]?.includes('  flexPools: {')
            ) {
              insertIndex = i;
              break;
            }
          }
        } else if (poolType === 'flexPools') {
          // Find closing brace of flexPools
          for (let i = lines.length - 1; i >= 0; i--) {
            if (
              lines[i].includes('  },') &&
              lines[i + 1]?.includes('} as const;')
            ) {
              insertIndex = i;
              break;
            }
          }
        }

        if (insertIndex === -1) {
          return yield* Effect.fail(
            new Error(`Could not find insertion point in Ociswap ${poolType}`),
          );
        }

        // Generate the new pool entry based on pool type
        let newPoolEntry: string[];
        if (poolType === 'basicPools') {
          newPoolEntry = [
            `    ${formatPoolKey(poolKey)}: {`,
            `      name: '${poolName}',`,
            `      componentAddress:`,
            `        '${component.componentAddress}',`,
            `      poolAddress:`,
            `        '${component.data.poolAddress || component.data.liquidityPool || 'UNKNOWN_POOL_ADDRESS'}',`,
            `      lpResourceAddress:`,
            `        '${component.data.liquidityReceipt || 'UNKNOWN_LP_RESOURCE'}',`,
            `      token_x: ${formatAssetAccess(getAssetKey(xToken.symbol))},`,
            `      token_y: ${formatAssetAccess(getAssetKey(yToken.symbol))},`,
            `    },`,
          ];
        } else {
          // For pools, poolsV2, and flexPools
          newPoolEntry = [
            `    ${formatPoolKey(poolKey)}: {`,
            `      name: '${poolName}',`,
            `      componentAddress:`,
            `        '${component.componentAddress}',`,
            `      lpResourceAddress:`,
            `        '${component.data.liquidityReceipt || 'UNKNOWN_LP_RESOURCE'}',`,
            `      token_x: ${formatAssetAccess(getAssetKey(xToken.symbol))},`,
            `      token_y: ${formatAssetAccess(getAssetKey(yToken.symbol))},`,
            `      divisibility_x: 18,`,
            `      divisibility_y: 18,`,
            `    },`,
          ];
        }

        // Insert the new pool entry
        lines.splice(insertIndex, 0, ...newPoolEntry);

        const newContent = lines.join('\n');
        yield* Effect.tryPromise(() => fs.writeFile(filePath, newContent));

        return `Added ${poolKey} to Ociswap ${poolType}`;
      });

      const addToDefiPlazaConstants = Effect.fn(function* (
        component: ComponentData,
      ) {
        const filePath = getConstantsFilePath(component.dappId);
        const fileContent = yield* Effect.tryPromise(() =>
          fs.readFile(filePath, 'utf-8'),
        );

        // Extract token information
        const xToken = component.data.xToken || component.data.x_address;
        const yToken = component.data.yToken || component.data.y_address;

        if (!xToken || !yToken) {
          return yield* Effect.fail(
            new Error('Missing token information for DefiPlaza component'),
          );
        }

        // Skip components with invalid symbols (must start with letter and be alphanumeric)
        const isValidSymbol = (symbol: string) =>
          /^[a-zA-Z][a-zA-Z0-9]*$/.test(symbol);
        if (!isValidSymbol(xToken.symbol) || !isValidSymbol(yToken.symbol)) {
          return `🚫 Component ${component.componentAddress} skipped - invalid symbol (must start with letter and contain only alphanumeric characters): ${xToken.symbol} or ${yToken.symbol}`;
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
          if (
            lines[i].includes('  },') &&
            lines[i + 1]?.includes('} as const;')
          ) {
            insertIndex = i;
            break;
          }
        }

        if (insertIndex === -1) {
          return yield* Effect.fail(
            new Error('Could not find insertion point in DefiPlaza constants'),
          );
        }

        // Generate the new pool entry (simplified structure for DefiPlaza)
        const newPoolEntry = [
          `  ${poolKey}: {`,
          `    type: 'component',`,
          `    baseResourceAddress: Assets.Fungible.${getAssetKey(xToken.symbol)},`,
          `    quoteResourceAddress: Assets.Fungible.${getAssetKey(yToken.symbol)},`,
          `    componentAddress:`,
          `      '${component.componentAddress}',`,
          `    basePoolAddress: 'UNKNOWN_BASE_POOL',`,
          `    baseLpResourceAddress: 'UNKNOWN_BASE_LP',`,
          `    quotePoolAddress: 'UNKNOWN_QUOTE_POOL',`,
          `    quoteLpResourceAddress: 'UNKNOWN_QUOTE_LP',`,
          `  },`,
        ];

        // Insert the new pool entry
        lines.splice(insertIndex, 0, ...newPoolEntry);

        const newContent = lines.join('\n');
        yield* Effect.tryPromise(() => fs.writeFile(filePath, newContent));

        return `Added ${poolKey} to DefiPlaza constants`;
      });

      const addComponentToConstants = Effect.fn(function* (
        component: ComponentData,
      ) {
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
  },
) {}
