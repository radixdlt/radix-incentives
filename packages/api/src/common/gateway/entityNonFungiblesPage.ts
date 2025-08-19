import type { EntityNonFungiblesPageRequest } from '@radixdlt/babylon-gateway-api-sdk';
import { Config, Effect } from 'effect';
import { GatewayError } from './errors';
import { GatewayApiClientService } from './gatewayApiClient';
import type { AtLedgerState } from './schemas';

export class EntityNonFungiblesPageService extends Effect.Service<EntityNonFungiblesPageService>()(
  'EntityNonFungiblesPageService',
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      const pageSize = yield* Config.number(
        'GatewayApi__Endpoint__MaxPageSize',
      ).pipe(Config.withDefault(100));
      return Effect.fn(function* (
        input: Omit<
          EntityNonFungiblesPageRequest['stateEntityNonFungiblesPageRequest'],
          'at_ledger_state'
        > & {
          at_ledger_state: AtLedgerState;
        },
      ) {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.state.innerClient.entityNonFungiblesPage({
              stateEntityNonFungiblesPageRequest: {
                ...input,
                limit_per_page: pageSize,
              },
            }),
          catch: (error) => new GatewayError({ error }),
        });

        return result;
      });
    }),
  },
) {}
