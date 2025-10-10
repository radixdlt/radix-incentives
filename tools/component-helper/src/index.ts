import { Effect } from 'effect';
import { ComponentRepo } from '../../../packages/api/src/incentives/component-definition/componentRepo';
import { AssetManager } from './assetManager';
import { DappConstantsManager } from './dappConstantsManager';
import { EnhancedComponentFetcher } from './enhancedComponentFetcher';
import { InteractiveInput } from './interactiveInput';
import { SequentialProcessor } from './sequentialProcessor';

const runnable = Effect.gen(function* () {
  const enhancedFetcher = yield* EnhancedComponentFetcher;
  const interactiveInput = yield* InteractiveInput;
  const sequentialProcessor = yield* SequentialProcessor;

  // Check if component address was provided as command line argument
  const commandLineInput = process.argv[2];
  let componentAddresses: string[];

  if (commandLineInput) {
    if (commandLineInput.endsWith('.csv')) {
      // CSV file provided via command line
      console.log(`Processing CSV file: ${commandLineInput}`);
      componentAddresses =
        yield* interactiveInput.parseCsvFile(commandLineInput);
      console.log(
        `Found ${componentAddresses.length} component addresses in CSV file`,
      );
    } else {
      // Use command line input (backward compatibility)
      console.log(`Using command line input: ${commandLineInput}`);
      componentAddresses = [commandLineInput];
    }
  } else {
    // Check for default CSV file location
    const defaultCsvPath = 'data/c9-components.csv';
    const csvExists = yield* Effect.tryPromise(() =>
      import('node:fs/promises').then((fs) => fs.access(defaultCsvPath)),
    ).pipe(
      Effect.map(() => true),
      Effect.catchAll(() => Effect.succeed(false)),
    );

    if (csvExists) {
      console.log(`Found default CSV file: ${defaultCsvPath}`);
      console.log('Processing components from default CSV file...');
      componentAddresses = yield* interactiveInput.parseCsvFile(defaultCsvPath);
      console.log(
        `Found ${componentAddresses.length} component addresses in CSV file`,
      );
    } else {
      // Use interactive input
      console.log('🔧 Enhanced Component Manager\n');
      componentAddresses = yield* interactiveInput.getComponentAddresses();

      // Confirm processing for multiple components
      const shouldProceed =
        yield* interactiveInput.confirmProcessing(componentAddresses);
      if (!shouldProceed) {
        console.log('Operation cancelled.');
        return;
      }
    }
  }

  // Use sequential processing for multiple components to avoid import cache issues
  let result: any[];
  if (componentAddresses.length > 1) {
    // Use child processes for multiple components to ensure fresh file imports
    const sequentialResults =
      yield* sequentialProcessor.processComponentSequentially(
        componentAddresses,
      );
    result = sequentialResults.map((r) => ({
      ...r.component,
      _assetAdditions: r.assetAdditions,
      _constantsAdditions: r.constantsAdditions,
    }));
  } else {
    // Single component can use the regular fetcher
    console.log(
      `\nFetching component details for ${componentAddresses.length} component(s)...`,
    );
    console.log(
      'Checking for missing assets and updating constants files...\n',
    );
    result =
      yield* enhancedFetcher.fetchComponentsWithAssetValidation(
        componentAddresses,
      );
  }

  // Remove the _assetAdditions and _constantsAdditions fields from the output for cleaner display
  const cleanResult = result.map((component) => {
    const { _assetAdditions, _constantsAdditions, ...cleanComponent } =
      component as Record<string, unknown> & {
        _assetAdditions?: unknown;
        _constantsAdditions?: unknown;
      };
    return cleanComponent;
  });

  console.log('\nComponent details:');
  console.log(JSON.stringify(cleanResult, null, 2));

  // Summary of asset additions
  const allAssetAdditions = result.flatMap(
    (
      component: Record<string, unknown> & {
        _assetAdditions?: Array<{
          resourceAddress: string;
          symbol: string;
          added: boolean;
        }>;
      },
    ) => component._assetAdditions || [],
  );

  // Summary of constants additions
  const allConstantsAdditions = result.flatMap(
    (
      component: Record<string, unknown> & {
        _constantsAdditions?: Array<string>;
      },
    ) => component._constantsAdditions || [],
  );

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
    console.log(
      '\n✅ Component already exists in constants files or unsupported DApp',
    );
  }
}).pipe(
  Effect.provide(ComponentRepo.Default),
  Effect.provide(AssetManager.Default),
  Effect.provide(DappConstantsManager.Default),
  Effect.provide(EnhancedComponentFetcher.Default),
  Effect.provide(InteractiveInput.Default),
  Effect.provide(SequentialProcessor.Default),
);

await Effect.runPromise(runnable);
