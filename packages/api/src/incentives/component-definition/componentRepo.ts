import { Data, Effect } from 'effect';

import { GetEntityDetailsService } from '../../common/gateway';
import { getComponentDefinitionByPackageAddress } from './componentDefinitions';
import { GetComponentEntityDetails } from './getComponentEntityDetails';

class ComponentDefinitionNotFound extends Data.TaggedError(
  'ComponentDefinitionNotFound',
)<{
  message: string;
  componentAddress: string;
  packageAddress: string;
}> {}

export class ComponentRepo extends Effect.Service<ComponentRepo>()(
  'ComponentRepo',
  {
    dependencies: [
      GetEntityDetailsService.Default,
      GetComponentEntityDetails.Default,
    ],
    effect: Effect.gen(function* () {
      const getComponentEntityDetails = yield* GetComponentEntityDetails;

      return {
        getByComponentAddresses: Effect.fn(function* (
          componentAddresses: string[],
        ) {
          const componentEntityDetails = yield* getComponentEntityDetails({
            componentAddresses,
            at_ledger_state: {
              timestamp: new Date(),
            },
          });

          const components = yield* Effect.forEach(
            componentEntityDetails,
            Effect.fnUntraced(function* (componentEntityDetail) {
              const componentDefinition =
                getComponentDefinitionByPackageAddress(
                  componentEntityDetail.packageAddress,
                );

              if (!componentDefinition) {
                return yield* Effect.fail(
                  new ComponentDefinitionNotFound({
                    message: `Component definition not found for ${componentEntityDetail.componentAddress} (${componentEntityDetail.blueprintName})`,
                    componentAddress: componentEntityDetail.componentAddress,
                    packageAddress: componentEntityDetail.packageAddress,
                  }),
                );
              }

              return yield* componentDefinition.fromComponentEntityDetails(
                componentEntityDetail,
              );
            }),
          );

          return components;
        }),
      };
    }),
  },
) {}
