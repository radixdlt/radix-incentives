import fs from 'node:fs/promises';
import path from 'node:path';
import { flatTokenNameMap } from 'data';
import { Effect } from 'effect';

export class AssetManager extends Effect.Service<AssetManager>()(
  'AssetManager',
  {
    effect: Effect.gen(function* () {
      const assetsFilePath = path.join(
        process.cwd(),
        '../../packages/data/src/assets.ts',
      );

      // Track assets added during this session to prevent duplicates
      const addedAssetsInThisSession = new Set<string>();

      const checkAssetExists = (resourceAddress: string): boolean => {
        return resourceAddress in flatTokenNameMap;
      };

      const fetchTokenMetadata = Effect.fn(function* (resourceAddress: string) {
        const response = yield* Effect.tryPromise(() =>
          fetch('https://mainnet.radixdlt.com/state/entity/details', {
            method: 'POST',
            headers: {
              'RDX-Client-Version': '1.8.1',
              'sec-ch-ua-platform': '"macOS"',
              'RDX-App-Version': 'Unknown',
              'RDX-Client-Name': '@radixdlt/babylon-gateway-api-sdk',
              Referer: 'https://dashboard.radixdlt.com/',
              'sec-ch-ua':
                '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
              'sec-ch-ua-mobile': '?0',
              'RDX-App-Dapp-Definition': 'Unknown',
              'RDX-App-Name': 'Radix Dashboard',
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              opt_ins: {
                ancestor_identities: false,
                component_royalty_vault_balance: false,
                package_royalty_vault_balance: false,
                non_fungible_include_nfids: true,
                explicit_metadata: [],
                dapp_two_way_links: true,
                native_resource_details: true,
              },
              addresses: [resourceAddress],
              aggregation_level: 'Vault',
            }),
          }),
        );

        const data = yield* Effect.tryPromise(() => response.json());

        const metadataItems = data.items?.[0]?.metadata?.items;
        if (!metadataItems) {
          return null;
        }

        const symbolItem = metadataItems.find(
          (item: { key: string; value?: { typed?: { value?: string } } }) =>
            item.key === 'symbol',
        );
        if (!symbolItem) {
          return null;
        }

        return symbolItem.value?.typed?.value;
      });

      const addAssetToFile = Effect.fn(function* (
        resourceAddress: string,
        symbol: string,
      ) {
        const fileContent = yield* Effect.tryPromise(() =>
          fs.readFile(assetsFilePath, 'utf-8'),
        );

        // Check if asset already exists in the file content
        const symbolUpper = symbol.toUpperCase();
        if (fileContent.includes(`${symbolUpper}: '${resourceAddress}'`)) {
          return `Asset ${symbolUpper} already exists in file`;
        }

        const lines = fileContent.split('\n');

        // Step 1: Find and add to Assets.Fungible
        let fungibleInsertIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (
            lines[i].includes('  },') &&
            lines[i + 1]?.includes('} as const;')
          ) {
            fungibleInsertIndex = i;
            break;
          }
        }

        if (fungibleInsertIndex === -1) {
          return yield* Effect.fail(
            new Error('Could not find Assets.Fungible insertion point'),
          );
        }

        // Insert the new asset in Fungible
        const newFungibleAssetLine = `    ${symbolUpper}: '${resourceAddress}',`;
        lines.splice(fungibleInsertIndex, 0, newFungibleAssetLine);

        // Step 2: Find and add to nativeAssets mapping
        let nativeAssetsInsertIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('  // Native Radix assets')) {
            // Find the closing brace of nativeAssets
            for (let j = i + 1; j < lines.length; j++) {
              if (
                lines[j].includes('  },') &&
                lines[j + 1]?.includes('  // Wrapped/bridged assets')
              ) {
                nativeAssetsInsertIndex = j;
                break;
              }
            }
            break;
          }
        }

        if (nativeAssetsInsertIndex === -1) {
          return yield* Effect.fail(
            new Error('Could not find nativeAssets insertion point'),
          );
        }

        // Insert the new asset mapping in nativeAssets
        const symbolLower = symbol.toLowerCase();
        const newNativeAssetLine = `    [Assets.Fungible.${symbolUpper}]: '${symbolLower}',`;
        lines.splice(nativeAssetsInsertIndex, 0, newNativeAssetLine);

        const newContent = lines.join('\n');
        yield* Effect.tryPromise(() =>
          fs.writeFile(assetsFilePath, newContent),
        );

        return `Added ${symbolUpper}: '${resourceAddress}' to Assets.Fungible and '${symbolLower}' to nativeAssets mapping`;
      });

      const processTokenAndAddIfMissing = Effect.fn(function* (
        resourceAddress: string,
      ) {
        if (
          checkAssetExists(resourceAddress) ||
          addedAssetsInThisSession.has(resourceAddress)
        ) {
          return null; // Asset already exists or was added in this session
        }

        console.log(
          `Asset ${resourceAddress} not found in Assets.Fungible, fetching metadata...`,
        );

        const symbol = yield* fetchTokenMetadata(resourceAddress);
        if (!symbol) {
          console.warn(`Could not fetch symbol for ${resourceAddress}`);
          return null;
        }

        console.log(`Found symbol: ${symbol} for ${resourceAddress}`);

        // Mark as added to prevent duplicates in this session
        addedAssetsInThisSession.add(resourceAddress);

        const result = yield* addAssetToFile(resourceAddress, symbol);
        console.log(result);

        return {
          resourceAddress,
          symbol: symbol.toUpperCase(),
          added: true,
        };
      });

      return {
        checkAssetExists,
        fetchTokenMetadata,
        addAssetToFile,
        processTokenAndAddIfMissing,
      };
    }),
  },
) {}
