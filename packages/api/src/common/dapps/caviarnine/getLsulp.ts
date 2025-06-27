import { Context, Effect, Layer } from "effect";
import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
  type InvalidInputError,
} from "../../gateway/getFungibleBalance";
import { CaviarNineConstants } from "./constants";
import { BigNumber } from "bignumber.js";
import type { EntityNotFoundError, GatewayError } from "../../gateway/errors";
import type { GetEntityDetailsError } from "../../gateway/getEntityDetails";
import type { AtLedgerState } from "../../gateway/schemas";

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
    at_ledger_state: AtLedgerState;
    addresses: string[];
    fungibleBalance?: GetFungibleBalanceOutput;
  }) => Effect.Effect<
    GetLsulpOutput,
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
  >
>() {}

export const GetLsulpLive = Layer.effect(
  GetLsulpService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;

    return (input) => {
      return Effect.gen(function* () {
        const fungibleBalanceResults = input.fungibleBalance
          ? input.fungibleBalance
          : yield* getFungibleBalanceService(input).pipe(
              Effect.withSpan("getFungibleBalanceService")
            );

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
