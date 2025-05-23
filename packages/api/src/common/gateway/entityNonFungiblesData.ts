import { Context, Effect, Layer } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";
import type { StateNonFungibleDataResponse } from "@radixdlt/babylon-gateway-api-sdk";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";
import { chunker } from "../helpers/chunker";

type EntityNonFungibleDataParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["nonFungibleData"]
>[0]["stateNonFungibleDataRequest"];

export class EntityNonFungibleDataService extends Context.Tag(
  "EntityNonFungibleDataService"
)<
  EntityNonFungibleDataService,
  (
    input: Omit<EntityNonFungibleDataParams, "at_ledger_state"> & {
      at_ledger_state: AtLedgerState;
    }
  ) => Effect.Effect<
    StateNonFungibleDataResponse,
    GatewayError,
    GatewayApiClientService
  >
>() {}

export const EntityNonFungibleDataLive = Layer.effect(
  EntityNonFungibleDataService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      const chunks = chunker(input.non_fungible_ids, 100);

      return Effect.gen(function* () {
        return yield* Effect.forEach(chunks, (chunk) => {
          return Effect.tryPromise({
            try: () =>
              gatewayClient.gatewayApiClient.state.innerClient.nonFungibleData({
                stateNonFungibleDataRequest: {
                  ...input,
                  non_fungible_ids: chunk,
                },
              }),
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
            const { non_fungible_id_type, ledger_state, resource_address } =
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              res[0]!;

            return {
              non_fungible_id_type,
              ledger_state,
              resource_address,
              non_fungible_ids,
            };
          })
        );
      });
    };
  })
);
