import type { EntityFungiblesPageRequest } from '@radixdlt/babylon-gateway-api-sdk';
import { Config, Effect } from 'effect';

import { GatewayApiClientService } from './gatewayApiClient';
import type { AtLedgerState } from './schemas';

export class EntityFungiblesPageService extends Effect.Service<EntityFungiblesPageService>()(
  'EntityFungiblesPageService',
  {
    dependencies: [GatewayApiClientService.Default],
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      const pageSize = yield* Config.number(
        'GatewayApi__Endpoint__MaxPageSize',
      ).pipe(Config.withDefault(100));

      return Effect.fn(function* (
        input: Omit<
          EntityFungiblesPageRequest['stateEntityFungiblesPageRequest'],
          'at_ledger_state'
        > & {
          at_ledger_state: AtLedgerState;
        },
      ) {
        const result =
          yield* gatewayClient.state.innerClient.entityFungiblesPage({
            stateEntityFungiblesPageRequest: {
              ...input,
              limit_per_page: pageSize,
            },
          });

        return result;
      });
    }),
  },
) {}
