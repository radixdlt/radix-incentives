import { Effect } from 'effect';
import { ComponentRepo } from '../../../packages/api/src/incentives/component-definition/componentRepo';
import { AssetManager } from './assetManager';
import { DappConstantsManager } from './dappConstantsManager';

export class EnhancedComponentFetcher extends Effect.Service<EnhancedComponentFetcher>()(
  'EnhancedComponentFetcher',
  {
    dependencies: [ComponentRepo.Default, AssetManager.Default, DappConstantsManager.Default],
    effect: Effect.gen(function* () {
      const componentRepo = yield* ComponentRepo;
      const assetManager = yield* AssetManager;
      const dappConstantsManager = yield* DappConstantsManager;

      return {
        fetchComponentsWithAssetValidation: Effect.fn(function* (componentAddresses: string[]) {
          // First fetch the component details
          const components = yield* componentRepo.getByComponentAddresses(componentAddresses);

          // Process each component to check for missing assets and add to constants
          const processedComponents = yield* Effect.forEach(
            components,
            Effect.fnUntraced(function* (component) {
              const assetAdditions: Array<{ resourceAddress: string; symbol: string; added: boolean }> = [];
              const constantsAdditions: Array<string> = [];

              // Cast component to access data property
              const componentData = (component as any).data;

              // Check xToken if it exists
              if ('xToken' in componentData && componentData.xToken?.resourceAddress) {
                const result = yield* assetManager.processTokenAndAddIfMissing(
                  componentData.xToken.resourceAddress
                );
                if (result) {
                  assetAdditions.push(result);
                }
              }

              // Check yToken if it exists
              if ('yToken' in componentData && componentData.yToken?.resourceAddress) {
                const result = yield* assetManager.processTokenAndAddIfMissing(
                  componentData.yToken.resourceAddress
                );
                if (result) {
                  assetAdditions.push(result);
                }
              }

              // Check other token fields that might exist in different component types
              if ('x_address' in componentData && componentData.x_address?.resourceAddress) {
                const result = yield* assetManager.processTokenAndAddIfMissing(
                  componentData.x_address.resourceAddress
                );
                if (result) {
                  assetAdditions.push(result);
                }
              }

              if ('y_address' in componentData && componentData.y_address?.resourceAddress) {
                const result = yield* assetManager.processTokenAndAddIfMissing(
                  componentData.y_address.resourceAddress
                );
                if (result) {
                  assetAdditions.push(result);
                }
              }

              // Check TVL assets
              if ('tvl' in component && Array.isArray(component.tvl)) {
                for (const tvlItem of component.tvl) {
                  if (tvlItem.resourceAddress?.resourceAddress) {
                    const result = yield* assetManager.processTokenAndAddIfMissing(
                      tvlItem.resourceAddress.resourceAddress
                    );
                    if (result) {
                      assetAdditions.push(result);
                    }
                  }
                }
              }

              // Add component to appropriate constants file
              if (['c9', 'oc', 'dp'].includes((component as any).dappId)) {
                console.log(`Adding component to ${(component as any).dappId} constants...`);
                const constantsResult = yield* dappConstantsManager.addComponentToConstants({
                  componentAddress: component.componentAddress,
                  dappId: (component as any).dappId,
                  packageAddress: (component as any).packageAddress,
                  data: componentData,
                });
                constantsAdditions.push(constantsResult);
                console.log(constantsResult);
              }

              return {
                ...component,
                _assetAdditions: assetAdditions.length > 0 ? assetAdditions : undefined,
                _constantsAdditions: constantsAdditions.length > 0 ? constantsAdditions : undefined,
              };
            }),
            { concurrency: 5 }
          );

          return processedComponents;
        }),
      };
    }),
  }
) {}