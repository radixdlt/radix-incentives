import { Effect } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";
import { chunker } from "../helpers/chunker";
import type { NonFungibleDataRequest } from "@radixdlt/babylon-gateway-api-sdk";

export class EntityNonFungibleDataService extends Effect.Service<EntityNonFungibleDataService>()(
  "EntityNonFungibleDataService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      return Effect.fn(function* (
        input: Omit<
          NonFungibleDataRequest["stateNonFungibleDataRequest"],
          "at_ledger_state"
        > & {
          at_ledger_state: AtLedgerState;
        }
      ) {
        const chunks = chunker(input.non_fungible_ids, 100);
        return yield* Effect.forEach(chunks, (chunk) => {
          return Effect.tryPromise({
            try: () =>
              gatewayClient.state.innerClient.nonFungibleData({
                stateNonFungibleDataRequest: {
                  ...input,
                  non_fungible_ids: chunk,
                },
              }),
            catch: (error) => new GatewayError({ error }),
          });
        }).pipe(
          Effect.map((res) => {
            const non_fungible_ids = res.flatMap(
              (item) => item.non_fungible_ids
            );

            return non_fungible_ids;
          })
        );
      });
    }),
  }
) {}
