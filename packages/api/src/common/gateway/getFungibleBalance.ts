import { Context, Effect, Layer } from "effect";
import { BigNumber } from "bignumber.js";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";
import { EntityFungiblesPageService } from "./entityFungiblesPage";
import { EntityNotFoundError, GatewayError } from "./errors";
import type { GetLedgerStateService } from "./getLedgerState";
import type { StateEntityDetailsResponseItemDetails } from "@radixdlt/babylon-gateway-api-sdk";

import { chunker } from "../helpers/chunker";

import type { AtLedgerState } from "./schemas";

export class InvalidInputError {
  readonly _tag = "InvalidInputError";
  constructor(readonly error: unknown) {}
}

type StateEntityDetailsParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["stateEntityDetails"]
>[0]["stateEntityDetailsRequest"];

type StateEntityDetailsOptionsParams = StateEntityDetailsParams["opt_ins"];

export type StateEntityDetailsInput = {
  addresses: string[];
  options?: StateEntityDetailsOptionsParams;
  at_ledger_state: AtLedgerState;
};

export type GetFungibleBalanceOutput = {
  address: string;
  fungibleResources: {
    resourceAddress: string;
    amount: BigNumber;
    lastUpdatedStateVersion: number;
  }[];
  details?: StateEntityDetailsResponseItemDetails;
}[];

export type GetFungibleBalanceServiceError =
  | EntityNotFoundError
  | InvalidInputError
  | GatewayError;

export type GetFungibleBalanceServiceDependencies =
  | GatewayApiClientService
  | EntityFungiblesPageService
  | GetLedgerStateService;

export class GetFungibleBalanceService extends Context.Tag(
  "GetFungibleBalanceService"
)<
  GetFungibleBalanceService,
  (
    input: StateEntityDetailsInput
  ) => Effect.Effect<
    GetFungibleBalanceOutput,
    GetFungibleBalanceServiceError,
    GetFungibleBalanceServiceDependencies
  >
>() {}

export const GetFungibleBalanceLive = Layer.effect(
  GetFungibleBalanceService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    const entityFungiblesPageService = yield* EntityFungiblesPageService;

    return (input) => {
      return Effect.gen(function* () {
        const aggregationLevel = "Global";

        return yield* Effect.all(
          chunker(input.addresses, 20).map((chunk) =>
            Effect.gen(function* () {
              const results = yield* Effect.tryPromise({
                try: () =>
                  gatewayClient.gatewayApiClient.state.innerClient.stateEntityDetails(
                    {
                      stateEntityDetailsRequest: {
                        addresses: chunk,
                        opt_ins: input.options,
                        at_ledger_state: input.at_ledger_state,
                        aggregation_level: aggregationLevel,
                      },
                    }
                  ),
                catch: (error) => {
                  return new GatewayError(error);
                },
              });

              return yield* Effect.all(
                results.items.map((result) => {
                  return Effect.gen(function* () {
                    if (!result) {
                      return yield* Effect.fail(new EntityNotFoundError());
                    }

                    const address = result.address;

                    const allFungibleResources =
                      result.fungible_resources?.items ?? [];

                    let nextCursor = result.fungible_resources?.next_cursor;

                    while (nextCursor) {
                      const result = yield* entityFungiblesPageService({
                        address,
                        aggregation_level: aggregationLevel,
                        cursor: nextCursor,
                        at_ledger_state: input.at_ledger_state,
                      });
                      nextCursor = result.next_cursor;
                      allFungibleResources.push(...result.items);
                    }

                    const fungibleResources = allFungibleResources
                      .map((item) => {
                        if (item.aggregation_level === "Global") {
                          const { resource_address: resourceAddress, amount } =
                            item;

                          return {
                            resourceAddress,
                            amount: new BigNumber(amount),
                            lastUpdatedStateVersion:
                              item.last_updated_at_state_version,
                          };
                        }
                      })
                      .filter(
                        (
                          item
                        ): item is {
                          resourceAddress: string;
                          amount: BigNumber;
                          lastUpdatedStateVersion: number;
                        } => !!item && item?.amount.gt(0)
                      );

                    return {
                      address: result.address,
                      fungibleResources,
                      details: result.details,
                    };
                  });
                }),
                {
                  concurrency: "inherit",
                }
              );
            })
          ),
          {
            concurrency: "unbounded",
          }
        ).pipe(Effect.map((results) => results.flat()));
      });
    };
  })
);
