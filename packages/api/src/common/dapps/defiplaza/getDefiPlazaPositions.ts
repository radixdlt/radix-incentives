import { Context, Effect, Layer } from "effect";

import type { GatewayApiClientService } from "../../gateway/gatewayApiClient";

import type { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";
import type { GetLedgerStateService } from "../../gateway/getLedgerState";
import type { EntityNotFoundError, GatewayError } from "../../gateway/errors";

import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
  type InvalidInputError,
} from "../../gateway/getFungibleBalance";

import type { InvalidComponentStateError } from "../../gateway/getComponentState";
import { DefiPlaza } from "./constants";
import type {
  GetEntityDetailsError,
  GetEntityDetailsService,
} from "../../gateway/getEntityDetails";
import type { AtLedgerState } from "../../gateway/schemas";
import {
  type GetDefiPlazaPoolUnitsError,
  type GetDefiPlazaPoolUnitsOutput,
  GetDefiPlazaPoolUnitsService,
} from "./getDefiPlazaPoolUnits";

export class FailedToParseLendingPoolSchemaError {
  readonly _tag = "FailedToParseLendingPoolSchemaError";
  constructor(readonly lendingPool: unknown) {}
}

export class InvalidPoolResourceError extends Error {
  readonly _tag = "InvalidPoolResourceError";
  constructor(error: unknown) {
    super(
      `Invalid pool resource: ${error instanceof Error ? error.message : error}`
    );
  }
}

type AssetBalance = {
  resourceAddress: ResourceAddress;
  amount: BigNumber;
};

type DefiPlazaPosition = {
  baseAsset: AssetBalance;
  quoteAsset: AssetBalance;
};

export type GetDefiPlazaPositionsOutput = {
  address: string;
  items: DefiPlazaPosition[];
}[];

export type GetDefiPlazaPositionsDependencies =
  | GetFungibleBalanceService
  | GatewayApiClientService
  | GetEntityDetailsService
  | EntityFungiblesPageService
  | GetLedgerStateService
  | GetDefiPlazaPoolUnitsService;

export type GetDefiPlazaPositionsError =
  | GetEntityDetailsError
  | EntityNotFoundError
  | InvalidInputError
  | GatewayError
  | InvalidComponentStateError
  | FailedToParseLendingPoolSchemaError
  | InvalidPoolResourceError
  | GetDefiPlazaPoolUnitsError;

export class GetDefiPlazaPositionsService extends Context.Tag(
  "GetDefiPlazaPositionsService"
)<
  GetDefiPlazaPositionsService,
  (input: {
    accountAddresses: string[];
    at_ledger_state: AtLedgerState;
    fungibleBalance?: GetFungibleBalanceOutput;
  }) => Effect.Effect<
    GetDefiPlazaPositionsOutput,
    GetDefiPlazaPositionsError,
    GetDefiPlazaPositionsDependencies
  >
>() {}

type AccountAddress = string;
type ResourceAddress = string;

export const GetDefiPlazaPositionsLive = Layer.effect(
  GetDefiPlazaPositionsService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;
    const getDefiPlazaPoolUnitsService = yield* GetDefiPlazaPoolUnitsService;

    return (input) => {
      return Effect.gen(function* () {
        const accountBalancesMap = new Map<
          AccountAddress,
          DefiPlazaPosition[]
        >();

        for (const accountAddress of input.accountAddresses) {
          accountBalancesMap.set(accountAddress, []);
        }

        const accountBalances =
          input.fungibleBalance ??
          (yield* getFungibleBalanceService({
            addresses: input.accountAddresses,
            at_ledger_state: input.at_ledger_state,
          }));

        const pools = yield* getDefiPlazaPoolUnitsService({
          items: [DefiPlaza.xUSDCPool],
          at_ledger_state: input.at_ledger_state,
        });

        const poolMap = new Map<string, GetDefiPlazaPoolUnitsOutput[number]>(
          pools.map((pool) => [pool.lpResourceAddress, pool])
        );

        for (const accountBalance of accountBalances) {
          const fungibleResources = accountBalance.fungibleResources;
          const defiplazaFungibleResources = fungibleResources.filter((item) =>
            poolMap.has(item.resourceAddress)
          );
          const accountAddress = accountBalance.address;

          for (const {
            resourceAddress,
            amount,
          } of defiplazaFungibleResources) {
            // biome-ignore lint/style/noNonNullAssertion: only defiplaza lp resources at this point
            const pool = poolMap.get(resourceAddress)!;

            const items = accountBalancesMap.get(accountAddress) ?? [];

            accountBalancesMap.set(accountAddress, [
              ...items,
              {
                baseAsset: {
                  resourceAddress: pool.baseResourceAddress,
                  amount: pool.basePerPoolUnit.multipliedBy(amount),
                },
                quoteAsset: {
                  resourceAddress: pool.quoteResourceAddress,
                  amount: pool.quotePerPoolUnit.multipliedBy(amount),
                },
              },
            ]);
          }
        }

        return Array.from(accountBalancesMap.entries()).map(
          ([address, items]) => ({
            address,
            items,
          })
        );
      });
    };
  })
);
