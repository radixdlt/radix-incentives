import { Effect } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";

export type GetNonFungibleIdsInput = {
  vaultAddress: string;
  resourceAddress: string;
  at_ledger_state: AtLedgerState;
  address: string;
  cursor?: string;
};

export class GetNonFungibleIdsService extends Effect.Service<GetNonFungibleIdsService>()(
  "GetNonFungibleIdsService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      return Effect.fn(function* (input: GetNonFungibleIdsInput) {
        const makeRequest = (cursor?: string) =>
          Effect.tryPromise({
            try: () =>
              gatewayClient.state.innerClient.entityNonFungibleIdsPage({
                stateEntityNonFungibleIdsPageRequest: {
                  resource_address: input.resourceAddress,
                  vault_address: input.vaultAddress,
                  address: input.address,
                  at_ledger_state: input.at_ledger_state,
                  cursor: cursor,
                  limit_per_page: 100,
                },
              }),
            catch: (error) => new GatewayError({ error }),
          });

        const result = yield* makeRequest(input.cursor);

        let next_cursor = result.next_cursor;
        const totalCount = result.total_count ?? 0;

        const ids: string[] = [...result.items];

        while (next_cursor && totalCount > 0) {
          const result = yield* makeRequest(next_cursor);
          ids.push(...result.items);
          next_cursor = result.next_cursor;
        }

        return { ids, address: input.address };
      });
    }),
  }
) {}
