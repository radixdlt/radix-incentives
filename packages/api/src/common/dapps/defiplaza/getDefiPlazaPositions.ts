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
  type GetResourcePoolOutput,
  GetResourcePoolUnitsService,
} from "../../resource-pool/getResourcePoolUnits";

export class InvalidPoolResourceError extends Error {
  readonly _tag = "InvalidPoolResourceError";
  constructor(error: unknown) {
    super(
      `Invalid pool resource: ${error instanceof Error ? error.message : error}`
    );
  }
}

type DefiPlazaPosition = {
  lpResourceAddress: string;
  position: { resourceAddress: string; amount: BigNumber }[];
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
  | GetResourcePoolUnitsService;

export type GetDefiPlazaPositionsError =
  | GetEntityDetailsError
  | EntityNotFoundError
  | InvalidInputError
  | GatewayError
  | InvalidComponentStateError
  | InvalidPoolResourceError;

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

export const GetDefiPlazaPositionsLive = Layer.effect(
  GetDefiPlazaPositionsService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;

    const getResourcePoolUnitsService = yield* GetResourcePoolUnitsService;

    return (input) => {
      return Effect.gen(function* () {
        const accountBalancesMap = new Map<
          AccountAddress,
          DefiPlazaPosition[]
        >();

        const pools = yield* getResourcePoolUnitsService({
          addresses: Object.values(DefiPlaza).map(pool => pool.poolAddress),
          at_ledger_state: input.at_ledger_state,
        });

        for (const accountAddress of input.accountAddresses) {
          accountBalancesMap.set(accountAddress, []);
        }

        const accountBalances =
          input.fungibleBalance ??
          (yield* getFungibleBalanceService({
            addresses: input.accountAddresses,
            at_ledger_state: input.at_ledger_state,
          }));

        const poolMap = new Map<string, GetResourcePoolOutput[number]>(
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

            const position = pool.poolResources.map((i) => ({
              resourceAddress: i.resourceAddress,
              amount: i.poolUnitValue.multipliedBy(amount),
            }));

            accountBalancesMap.set(accountAddress, [
              ...items,
              { lpResourceAddress: pool.lpResourceAddress, position },
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
