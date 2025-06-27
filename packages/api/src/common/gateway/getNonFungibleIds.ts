import { Context, Effect, Layer } from "effect";
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

export type GetNonFungibleIdsOutput = {
  ids: string[];
};

export class GetNonFungibleIdsService extends Context.Tag(
  "GetNonFungibleIdsService"
)<
  GetNonFungibleIdsService,
  (
    input: GetNonFungibleIdsInput
  ) => Effect.Effect<GetNonFungibleIdsOutput, GatewayError>
>() {}

export const GetNonFungibleIdsLive = Layer.effect(
  GetNonFungibleIdsService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        const makeRequest = (cursor?: string) =>
          Effect.tryPromise({
            try: () =>
              gatewayClient.gatewayApiClient.state.innerClient.entityNonFungibleIdsPage(
                {
                  stateEntityNonFungibleIdsPageRequest: {
                    resource_address: input.resourceAddress,
                    vault_address: input.vaultAddress,
                    address: input.address,
                    at_ledger_state: input.at_ledger_state,
                    cursor: cursor,
                    limit_per_page: 100,
                  },
                }
              ),
            catch: (error) => new GatewayError(error),
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
    };
  })
);
