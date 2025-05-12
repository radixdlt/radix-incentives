import { Context, Effect, Layer } from "effect";
import { LoggerService } from "../logger/logger";
import { BigNumber } from "bignumber.js";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";
import { EntityFungiblesPageService } from "./entityFungiblesPage";
import type { GatewayError } from "./errors";
import {
  type GetStateVersionError,
  GetStateVersionService,
} from "./getStateVersion";
import type { StateEntityDetailsResponseItemDetails } from "@radixdlt/babylon-gateway-api-sdk";

import { chunker } from "../helpers/chunker";

export class GetEntityDetailsError {
  readonly _tag = "GetEntityDetailsError";
  constructor(readonly error: unknown) {}
}

export class EntityNotFoundError {
  readonly _tag = "EntityNotFoundError";
}

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
  state?: {
    timestamp?: Date;
    state_version?: number;
  };
};

export class GetFungibleBalanceService extends Context.Tag(
  "GetFungibleBalanceService"
)<
  GetFungibleBalanceService,
  (input: StateEntityDetailsInput) => Effect.Effect<
    {
      address: string;
      fungibleResources: {
        resourceAddress: string;
        amount: BigNumber;
        lastUpdatedStateVersion: number;
      }[];
      details?: StateEntityDetailsResponseItemDetails;
    }[],
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | GetStateVersionError,
    | GatewayApiClientService
    | LoggerService
    | EntityFungiblesPageService
    | GetStateVersionService
  >
>() {}

export const GetFungibleBalanceLive = Layer.effect(
  GetFungibleBalanceService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;
    const logger = yield* LoggerService;
    const entityFungiblesPageService = yield* EntityFungiblesPageService;
    const getStateVersionService = yield* GetStateVersionService;

    return (input) => {
      return Effect.gen(function* () {
        const aggregationLevel = "Global";
        let atStateVersion = input.state?.state_version;
        const atStateVersionTimestamp = input.state?.timestamp;

        if (atStateVersionTimestamp) {
          const stateVersionResult = yield* getStateVersionService(
            atStateVersionTimestamp
          );
          atStateVersion = stateVersionResult.stateVersion;
        }

        if (!atStateVersion) {
          const stateVersionResult = yield* getStateVersionService(new Date());
          atStateVersion = stateVersionResult.stateVersion;
        }

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
                        at_ledger_state: { state_version: atStateVersion },
                        aggregation_level: aggregationLevel,
                      },
                    }
                  ),
                catch: (error) => {
                  logger.error(error);
                  return new GetEntityDetailsError(error);
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
                        at_ledger_state: { state_version: atStateVersion },
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
