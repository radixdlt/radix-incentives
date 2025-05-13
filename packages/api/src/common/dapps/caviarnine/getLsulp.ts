import { Context, Effect, Layer } from "effect";
import {
  type EntityNotFoundError,
  GetFungibleBalanceService,
  type InvalidInputError,
  type StateEntityDetailsInput,
} from "../../gateway/getFungibleBalance";
import { CaviarNineConstants } from "./constants";
import { BigNumber } from "bignumber.js";
import type { GatewayApiClientService } from "../../gateway/gatewayApiClient";
import type { LoggerService } from "../../logger/logger";
import type { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";
import type { GetLedgerStateService } from "../../gateway/getLedgerState";
import type { GatewayError } from "../../gateway/errors";
import type { GetEntityDetailsError } from "../../gateway/getEntityDetails";

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
    | GatewayError,
    | GetLedgerStateService
    | GatewayApiClientService
    | LoggerService
    | EntityFungiblesPageService
    | GetLedgerStateService
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
