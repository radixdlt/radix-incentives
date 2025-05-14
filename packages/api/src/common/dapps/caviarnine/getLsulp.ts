import { Context, Effect, Layer } from "effect";
import {
  type EntityNotFoundError,
  type GetEntityDetailsError,
  GetFungibleBalanceService,
  type InvalidInputError,
  type StateEntityDetailsInput,
} from "../../gateway/getFungibleBalance";
import { CaviarNineConstants } from "./constants";
import { BigNumber } from "bignumber.js";
import type { GatewayApiClientService } from "../../gateway/gatewayApiClient";
import type { LoggerService } from "../../logger/logger";
import type { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";
import type {
  GetStateVersionError,
  GetStateVersionService,
} from "../../gateway/getStateVersion";
import type { GatewayError } from "../../gateway/errors";

export type GetLsulpOutput = {
  address: string;
  lsulp: {
    resourceAddress: string;
    amount: BigNumber;
  };
}[];

export class GetLsulpService extends Context.Tag("GetLsulpService")<
  GetLsulpService,
  (input: {
    state?: StateEntityDetailsInput["state"];
    addresses: string[];
  }) => Effect.Effect<
    GetLsulpOutput,
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | GetStateVersionError,
    | GetFungibleBalanceService
    | GatewayApiClientService
    | LoggerService
    | EntityFungiblesPageService
    | GetStateVersionService
  >
>() {}

export const GetLsulpLive = Layer.effect(
  GetLsulpService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;

    return (input) => {
      return Effect.gen(function* () {
        const fungibleBalanceResults = yield* getFungibleBalanceService(input);

        return fungibleBalanceResults.map((item) => {
          const lsulpAmount = item.fungibleResources.find(
            (resource) =>
              resource.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress
          ) ?? {
            amount: new BigNumber(0),
          };
          return {
            address: item.address,
            lsulp: {
              resourceAddress: CaviarNineConstants.LSULP.resourceAddress,
              amount: lsulpAmount.amount,
            },
          };
        });
      });
    };
  })
);
