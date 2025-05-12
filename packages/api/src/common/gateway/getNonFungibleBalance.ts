import { Context, Effect, Layer } from "effect";
import { LoggerService } from "../logger/logger";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";

import type { GatewayError } from "./errors";
import {
  type GetStateVersionError,
  GetStateVersionService,
} from "./getStateVersion";
import type {
  ProgrammaticScryptoSborValue,
  StateEntityDetailsResponseItemDetails,
  StateNonFungibleDataResponse,
} from "@radixdlt/babylon-gateway-api-sdk";
import { EntityNonFungiblesPageService } from "./entityNonFungiblesPage";
import { EntityNonFungibleDataService } from "./entityNonFungiblesData";
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

export type GetNonFungibleBalanceOutput = {
  address: string;
  nonFungibleResources: {
    resourceAddress: string;
    lastUpdatedStateVersion: number;
    nonFungibleIdType: StateNonFungibleDataResponse["non_fungible_id_type"];
    items: {
      id: string;
      lastUpdatedStateVersion: number;
      sbor?: ProgrammaticScryptoSborValue;
      isBurned: boolean;
    }[];
  }[];
  details?: StateEntityDetailsResponseItemDetails;
}[];

export class GetNonFungibleBalanceService extends Context.Tag(
  "GetNonFungibleBalanceService"
)<
  GetNonFungibleBalanceService,
  (
    input: StateEntityDetailsInput
  ) => Effect.Effect<
    { items: GetNonFungibleBalanceOutput; stateVersion: number },
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | GetStateVersionError,
    | GatewayApiClientService
    | LoggerService
    | EntityNonFungiblesPageService
    | GetStateVersionService
  >
>() {}

export const GetNonFungibleBalanceLive = Layer.effect(
  GetNonFungibleBalanceService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;
    const logger = yield* LoggerService;
    const entityNonFungiblesPageService = yield* EntityNonFungiblesPageService;
    const entityNonFungibleDataService = yield* EntityNonFungibleDataService;
    const getStateVersionService = yield* GetStateVersionService;

    return (input) => {
      return Effect.gen(function* () {
        yield* Effect.logTrace(input);
        const aggregationLevel = "Vault";
        let atStateVersion = input.state?.state_version;
        const atStateVersionTimestamp = input.state?.timestamp;
        const optIns = { ...input.options, non_fungible_include_nfids: true };

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

        const chunks = chunker(input.addresses, 20);

        const results = yield* Effect.all(
          chunks.map((chunk) =>
            Effect.tryPromise({
              try: () =>
                gatewayClient.gatewayApiClient.state.innerClient.stateEntityDetails(
                  {
                    stateEntityDetailsRequest: {
                      addresses: chunk,
                      opt_ins: optIns,
                      at_ledger_state: { state_version: atStateVersion },
                      aggregation_level: aggregationLevel,
                    },
                  }
                ),
              catch: (error) => {
                logger.error(error);
                return new GetEntityDetailsError(error);
              },
            })
          ),
          {
            concurrency: 3,
          }
        ).pipe(
          Effect.map((results) => {
            const items = results.flatMap((result) => result.items);

            return {
              items,
              ledger_state: results[0].ledger_state,
            };
          })
        );

        const stateVersion = results.ledger_state.state_version;

        return yield* Effect.all(
          results.items.map((result) => {
            return Effect.gen(function* () {
              if (!result) {
                return yield* Effect.fail(new EntityNotFoundError());
              }

              const address = result.address;

              const allNonFungibleResources =
                result.non_fungible_resources?.items ?? [];

              let next_cursor = result.non_fungible_resources?.next_cursor;

              while (next_cursor) {
                const nextBalances = yield* entityNonFungiblesPageService({
                  address,
                  at_ledger_state: { state_version: atStateVersion },
                  aggregation_level: aggregationLevel,
                  opt_ins: optIns,
                  cursor: next_cursor,
                });

                next_cursor = nextBalances.next_cursor;
                allNonFungibleResources.push(...nextBalances.items);
              }

              const nfts: {
                resourceAddress: string;
                items: string[];
                lastUpdatedStateVersion: number;
              }[] = [];

              for (const nonFungible of allNonFungibleResources) {
                if (nonFungible.aggregation_level !== "Vault")
                  return yield* Effect.fail(new InvalidInputError(nonFungible));

                const resourceAddress = nonFungible.resource_address;

                for (const vault of nonFungible.vaults.items) {
                  nfts.push({
                    resourceAddress,
                    items: vault.items ?? [],
                    lastUpdatedStateVersion:
                      vault.last_updated_at_state_version,
                  });
                }
              }

              const nftsWithData: {
                resourceAddress: string;
                lastUpdatedStateVersion: number;
                nonFungibleIdType: StateNonFungibleDataResponse["non_fungible_id_type"];
                items: {
                  id: string;
                  lastUpdatedStateVersion: number;
                  sbor?: ProgrammaticScryptoSborValue;
                  isBurned: boolean;
                }[];
              }[] = [];

              for (const nft of nfts) {
                if (!nft.items.length) continue;

                const nftData = yield* entityNonFungibleDataService({
                  resource_address: nft.resourceAddress,
                  non_fungible_ids: nft.items,
                });

                const items: {
                  id: string;
                  lastUpdatedStateVersion: number;
                  sbor?: ProgrammaticScryptoSborValue;
                  isBurned: boolean;
                }[] = [];

                for (const nftDataItem of nftData.non_fungible_ids) {
                  const id = nftDataItem.non_fungible_id;
                  const sbor = nftDataItem.data?.programmatic_json;
                  const lastUpdatedStateVersion =
                    nftDataItem.last_updated_at_state_version;
                  const isBurned = nftDataItem.is_burned;

                  items.push({ id, lastUpdatedStateVersion, sbor, isBurned });
                }

                nftsWithData.push({
                  resourceAddress: nft.resourceAddress,
                  lastUpdatedStateVersion: nft.lastUpdatedStateVersion,
                  nonFungibleIdType: nftData.non_fungible_id_type,
                  items,
                });
              }

              return {
                address: result.address,
                nonFungibleResources: nftsWithData,
                details: result.details,
              };
            });
          }),
          { concurrency: "unbounded" }
        ).pipe(
          Effect.map((result) => {
            return {
              items: result,
              stateVersion,
            };
          })
        );
      });
    };
  })
);
