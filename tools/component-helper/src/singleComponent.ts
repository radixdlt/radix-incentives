import { Effect } from 'effect';
import { ComponentRepo } from '../../../packages/api/src/incentives/component-definition/componentRepo';
import { AssetManager } from './assetManager';
import { DappConstantsManager } from './dappConstantsManager';
import { EnhancedComponentFetcher } from './enhancedComponentFetcher';

// Process a single component address provided as command line argument
const runnable = Effect.gen(function* () {
  const enhancedFetcher = yield* EnhancedComponentFetcher;

  const componentAddress = process.argv[2];
  if (!componentAddress) {
    console.error('Error: Component address required as argument');
    process.exit(1);
  }

  console.log(`Processing component: ${componentAddress}`);

  const result = yield* enhancedFetcher.fetchComponentsWithAssetValidation([
    componentAddress,
  ]);

  const component = result[0];
  if (!component) {
    console.error(`Failed to fetch component: ${componentAddress}`);
    process.exit(1);
  }

  // Extract additions for reporting
  const assetAdditions = (component as any)._assetAdditions || [];
  const constantsAdditions = (component as any)._constantsAdditions || [];

  // Return structured result for parent process
  const output = {
    componentAddress,
    component: (() => {
      const { _assetAdditions, _constantsAdditions, ...cleanComponent } =
        component as any;
      return cleanComponent;
    })(),
    assetAdditions,
    constantsAdditions,
  };

  console.log(JSON.stringify(output));
}).pipe(
  Effect.provide(ComponentRepo.Default),
  Effect.provide(AssetManager.Default),
  Effect.provide(DappConstantsManager.Default),
  Effect.provide(EnhancedComponentFetcher.Default),
);

Effect.runPromise(runnable).catch((error) => {
  console.error('Error processing component:', error);
  process.exit(1);
});
