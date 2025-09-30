import { Effect } from 'effect';
import { ComponentRepo } from '../../../packages/api/src/incentives/component-definition/componentRepo';
import { AssetManager } from './assetManager';
import { DappConstantsManager } from './dappConstantsManager';
import { EnhancedComponentFetcher } from './enhancedComponentFetcher';

const runnable = Effect.gen(function* () {
  const enhancedFetcher = yield* EnhancedComponentFetcher;

  const input = process.argv[2];

  if (!input) {
    console.error('Usage: pnpm component <component_address>');
    return;
  }

  console.log(`Fetching component details for: ${input}`);
  console.log('Checking for missing assets...\n');

  const result = yield* enhancedFetcher.fetchComponentsWithAssetValidation([input]);

  // Remove the _assetAdditions and _constantsAdditions fields from the output for cleaner display
  const cleanResult = result.map(component => {
    const { _assetAdditions, _constantsAdditions, ...cleanComponent } = component as Record<string, unknown> & {
      _assetAdditions?: unknown;
      _constantsAdditions?: unknown;
    };
    return cleanComponent;
  });

  console.log('\nComponent details:');
  console.log(JSON.stringify(cleanResult, null, 2));

  // Summary of asset additions
  const allAssetAdditions = result.flatMap((component: Record<string, unknown> & {
    _assetAdditions?: Array<{ resourceAddress: string; symbol: string; added: boolean }>
  }) => component._assetAdditions || []);

  // Summary of constants additions
  const allConstantsAdditions = result.flatMap((component: Record<string, unknown> & {
    _constantsAdditions?: Array<string>
  }) => component._constantsAdditions || []);

  if (allAssetAdditions.length > 0) {
    console.log('\n=== Asset Additions Summary ===');
    for (const addition of allAssetAdditions) {
      console.log(`✅ Added ${addition.symbol}: '${addition.resourceAddress}'`);
    }
    console.log('\nPlease review the changes in packages/data/src/assets.ts');
  } else {
    console.log('\n✅ All assets already exist in Assets.Fungible');
  }

  if (allConstantsAdditions.length > 0) {
    console.log('\n=== Constants Additions Summary ===');
    for (const addition of allConstantsAdditions) {
      console.log(`📝 ${addition}`);
    }
    console.log('\nPlease review the changes in the DApp constants files');
  } else {
    console.log('\n✅ Component already exists in constants files or unsupported DApp');
  }
}).pipe(
  Effect.provide(ComponentRepo.Default),
  Effect.provide(AssetManager.Default),
  Effect.provide(DappConstantsManager.Default),
  Effect.provide(EnhancedComponentFetcher.Default)
);

await Effect.runPromise(runnable);
