import { Effect } from 'effect';
import { GatewayApiClientService } from '../gateway/gatewayApiClient';

import type { AtLedgerState } from './schemas';

export type GetEntitiesByRoleRequirementInput = {
  requirements: Array<{
    resource_address: string;
    non_fungible_id: string;
  }>;
  at_ledger_state: AtLedgerState;
};

export class GetEntitiesByRoleRequirementService extends Effect.Service<GetEntitiesByRoleRequirementService>()(
  'GetEntitiesByRoleRequirementService',
  {
    dependencies: [GatewayApiClientService.Default],
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;

      return Effect.fn('getEntitiesByRoleRequirement')(function* (
        input: GetEntitiesByRoleRequirementInput,
      ) {
        return yield* gatewayClient.extensions.innerClient.entitiesByRoleRequirementLookup(
          {
            entitiesByRoleRequirementLookupRequest: {
              requirements: input.requirements,
            },
          },
        );
      });
    }),
  },
) {}
