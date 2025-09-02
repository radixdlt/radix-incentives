import type { NonFungibleDataRequest } from '@radixdlt/babylon-gateway-api-sdk';
import { Config, Effect } from 'effect';
import { chunker } from '../helpers/chunker';
import { GatewayApiClientService } from './gatewayApiClient';
import type { AtLedgerState } from './schemas';

export class EntityNonFungibleDataService extends Effect.Service<EntityNonFungibleDataService>()(
  'EntityNonFungibleDataService',
  {
    dependencies: [GatewayApiClientService.Default],
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      const pageSize = yield* Config.number(
        'GatewayApi__Endpoint__MaxPageSize',
      ).pipe(Config.withDefault(100));

      return Effect.fn(function* (
        input: Omit<
          NonFungibleDataRequest['stateNonFungibleDataRequest'],
          'at_ledger_state'
        > & {
          at_ledger_state: AtLedgerState;
        },
      ) {
        const chunks = chunker(input.non_fungible_ids, pageSize);
        return yield* Effect.forEach(
          chunks,
          Effect.fn(function* (chunk) {
            return yield* gatewayClient.state.innerClient.nonFungibleData({
              stateNonFungibleDataRequest: {
                ...input,
                non_fungible_ids: chunk,
              },
            });
          }),
        ).pipe(
          Effect.map((res) => {
            const non_fungible_ids = res.flatMap(
              (item) => item.non_fungible_ids,
            );

            return non_fungible_ids;
          }),
        );
      });
    }),
  },
) {}
