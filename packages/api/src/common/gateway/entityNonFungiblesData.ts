import { Effect } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";
import { chunker } from "../helpers/chunker";

type EntityNonFungibleDataParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["nonFungibleData"]
>[0]["stateNonFungibleDataRequest"];

export class EntityNonFungibleDataService extends Effect.Service<EntityNonFungibleDataService>()(
  "EntityNonFungibleDataService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      return {
        run: Effect.fn(function* (
          input: Omit<EntityNonFungibleDataParams, "at_ledger_state"> & {
            at_ledger_state: AtLedgerState;
          }
        ) {
          const chunks = chunker(input.non_fungible_ids, 100);
          return yield* Effect.forEach(chunks, (chunk) => {
            return Effect.tryPromise({
              try: () =>
                gatewayClient.gatewayApiClient.state.innerClient.nonFungibleData(
                  {
                    stateNonFungibleDataRequest: {
                      ...input,
                      non_fungible_ids: chunk,
                    },
                  }
                ),
              catch: (error) => {
                console.log(error, input);
                return new GatewayError(error);
              },
            });
          }).pipe(
            Effect.map((res) => {
              const non_fungible_ids = res.flatMap(
                (item) => item.non_fungible_ids
              );

              return non_fungible_ids;
            })
          );
        }),
      };
    }),
  }
) {}
