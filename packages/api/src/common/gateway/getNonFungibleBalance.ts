import { Context, Effect, Layer } from "effect";
import type { GatewayApiClientImpl } from "./gatewayApiClient";

import type { EntityNotFoundError, GatewayError } from "./errors";
import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { EntityNonFungibleDataService } from "./entityNonFungiblesData";

import type { AtLedgerState } from "./schemas";
import { GetNftResourceManagersService } from "./getNftResourceManagers";

export class InvalidInputError {
  readonly _tag = "InvalidInputError";
  constructor(readonly error: unknown) {}
}

type StateEntityDetailsParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["stateEntityDetails"]
>[0]["stateEntityDetailsRequest"];

type StateEntityDetailsOptionsParams = StateEntityDetailsParams["opt_ins"];

export type GetNonFungibleBalanceOutput = {
  items: {
    address: string;
    nonFungibleResources: {
      resourceAddress: string;
      items: {
        id: string;
        lastUpdatedStateVersion: number;
        sbor?: ProgrammaticScryptoSborValue;
        isBurned: boolean;
      }[];
    }[];
  }[];
};

type GetNonFungibleBalanceInput = {
  addresses: string[];
  at_ledger_state: AtLedgerState;
  resourceAddresses?: string[];
  options?: StateEntityDetailsOptionsParams;
};

export type GetNonFungibleBalanceServiceError =
  | EntityNotFoundError
  | InvalidInputError
  | GatewayError;

export class GetNonFungibleBalanceService extends Context.Tag(
  "GetNonFungibleBalanceService"
)<
  GetNonFungibleBalanceService,
  (
    input: GetNonFungibleBalanceInput
  ) => Effect.Effect<
    GetNonFungibleBalanceOutput,
    GetNonFungibleBalanceServiceError
  >
>() {}

export const GetNonFungibleBalanceLive = Layer.effect(
  GetNonFungibleBalanceService,
  Effect.gen(function* () {
    const entityNonFungibleDataService = yield* EntityNonFungibleDataService;
    const getNftResourceManagersService = yield* GetNftResourceManagersService;

    return (input) => {
      return Effect.gen(function* () {
        yield* Effect.logTrace(input);

        const optIns = { ...input.options, non_fungible_include_nfids: true };

        const resourceManagersResults = yield* getNftResourceManagersService({
          addresses: input.addresses,
          at_ledger_state: input.at_ledger_state,
          resourceAddresses: input.resourceAddresses,
          options: optIns,
        }).pipe(Effect.withSpan("getNftResourceManagersService"));

        const result = yield* Effect.forEach(
          resourceManagersResults,
          (resourceManagerResult) => {
            return Effect.gen(function* () {
              const nonFungibleResources = yield* Effect.forEach(
                resourceManagerResult.items,
                (resourceManager) => {
                  return Effect.gen(function* () {
                    if (resourceManager.nftIds.length === 0) {
                      return yield* Effect.succeed({
                        resourceAddress: resourceManager.resourceAddress,
                        items: [],
                      });
                    }
                    return yield* entityNonFungibleDataService
                      .run({
                        resource_address: resourceManager.resourceAddress,
                        non_fungible_ids: resourceManager.nftIds,
                        at_ledger_state: input.at_ledger_state,
                      })
                      .pipe(
                        Effect.withSpan("entityNonFungibleDataService"),
                        Effect.map((nftDataResult) => {
                          const items = nftDataResult.map((nftDataItem) => ({
                            id: nftDataItem.non_fungible_id,
                            lastUpdatedStateVersion:
                              nftDataItem.last_updated_at_state_version,
                            sbor: nftDataItem.data?.programmatic_json,
                            isBurned: nftDataItem.is_burned,
                          }));

                          return {
                            resourceAddress: resourceManager.resourceAddress,
                            items,
                          };
                        })
                      );
                  });
                }
              );

              return {
                address: resourceManagerResult.address,
                nonFungibleResources,
              };
            });
          },
          { concurrency: 10 }
        );

        return { items: result };
      });
    };
  })
);
