import type { ResourceHoldersCollectionItem } from '@radixdlt/babylon-gateway-api-sdk';
import { Effect } from 'effect';
import { GatewayApiClientService } from './gatewayApiClient';

export class GetResourceHoldersService extends Effect.Service<GetResourceHoldersService>()(
  'GetResourceHoldersService',
  {
    dependencies: [GatewayApiClientService.Default],
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;

      const getResourceHolders = Effect.fn(function* (input: {
        resourceAddress: string;
        cursor?: string;
      }) {
        return yield* gatewayClient.extensions.getResourceHolders(
          input.resourceAddress,
          input.cursor,
        );
      });

      return Effect.fn(function* (input: {
        resourceAddress: string;
        cursor?: string;
      }) {
        const result = yield* getResourceHolders(input);

        const allItems = [...result.items];

        let nextCursor = result.next_cursor;

        while (nextCursor) {
          const nextResult = yield* getResourceHolders({
            resourceAddress: input.resourceAddress,
            cursor: nextCursor,
          });

          allItems.push(...nextResult.items);
          nextCursor = nextResult.next_cursor;
        }

        const holders = new Map<string, ResourceHoldersCollectionItem>();

        for (const item of allItems) {
          holders.set(item.holder_address, item);
        }

        return Array.from(holders.values());
      });
    }),
  },
) {}
