import { Context, Effect, Layer } from "effect";
import type { EntityNotFoundError, GatewayError } from "../../gateway/errors";

import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
  type InvalidInputError,
} from "../../gateway/getFungibleBalance";

import type { InvalidComponentStateError } from "../../gateway/getComponentState";
import { DefiPlaza } from "./constants";
import type { GetEntityDetailsError } from "../../gateway/getEntityDetails";
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
  }) => Effect.Effect<GetDefiPlazaPositionsOutput, GetDefiPlazaPositionsError>
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

        // Gather all pool addresses (base and quote) and LP resource addresses
        const allPoolAddresses = Object.values(DefiPlaza).flatMap((pool) => [
          pool.basePoolAddress,
          pool.quotePoolAddress,
        ]);
        const allLpResourceAddresses = Object.values(DefiPlaza).flatMap(
          (pool) => [pool.baseLpResourceAddress, pool.quoteLpResourceAddress]
        );

        // Fetch pool data for all pools (base and quote)
        const pools = yield* getResourcePoolUnitsService({
          addresses: allPoolAddresses,
          at_ledger_state: input.at_ledger_state,
        });

        // Map LP resource address to pool data
        const poolMap = new Map<string, GetResourcePoolOutput[number]>();
        for (const pool of pools) {
          poolMap.set(pool.lpResourceAddress, pool);
        }

        // Map pool key (baseLpResourceAddress) to pool config
        const poolConfigMap = new Map<
          string,
          (typeof DefiPlaza)[keyof typeof DefiPlaza]
        >();
        for (const pool of Object.values(DefiPlaza)) {
          poolConfigMap.set(pool.baseLpResourceAddress, pool);
        }

        for (const accountAddress of input.accountAddresses) {
          accountBalancesMap.set(accountAddress, []);
        }

        const accountBalances =
          input.fungibleBalance ??
          (yield* getFungibleBalanceService({
            addresses: input.accountAddresses,
            at_ledger_state: input.at_ledger_state,
          }));

        for (const accountBalance of accountBalances) {
          const fungibleResources = accountBalance.fungibleResources;
          const userLpBalances = new Map<string, { amount: BigNumber }>();
          for (const item of fungibleResources) {
            if (
              (allLpResourceAddresses as string[]).includes(
                item.resourceAddress
              )
            ) {
              userLpBalances.set(item.resourceAddress, { amount: item.amount });
            }
          }

          // For each pool, aggregate both base and quote LPs
          for (const pool of Object.values(DefiPlaza)) {
            const baseLp = userLpBalances.get(pool.baseLpResourceAddress);
            const quoteLp = userLpBalances.get(pool.quoteLpResourceAddress);
            if (!baseLp && !quoteLp) continue; // User holds neither LP

            // Get pool data for both LPs
            const basePool = poolMap.get(pool.baseLpResourceAddress);
            const quotePool = poolMap.get(pool.quoteLpResourceAddress);

            // Only proceed if at least one pool exists
            if (!basePool && !quotePool) continue;

            // Helper to sum resources
            const sumResourceAmounts = (
              resourcesA: { resourceAddress: string; amount: BigNumber }[] = [],
              resourcesB: { resourceAddress: string; amount: BigNumber }[] = []
            ) => {
              const map = new Map<string, BigNumber>();
              for (const r of resourcesA) {
                map.set(r.resourceAddress, r.amount);
              }
              for (const r of resourcesB) {
                const prev =
                  map.get(r.resourceAddress) ?? r.amount.constructor(0);
                map.set(r.resourceAddress, prev.plus(r.amount));
              }
              return Array.from(map.entries()).map(
                ([resourceAddress, amount]) => ({ resourceAddress, amount })
              );
            };

            // Calculate underlying resources for each LP
            const basePosition =
              baseLp && basePool
                ? basePool.poolResources.map((i) => ({
                    resourceAddress: i.resourceAddress,
                    amount: i.poolUnitValue.multipliedBy(baseLp.amount),
                  }))
                : [];
            const quotePosition =
              quoteLp && quotePool
                ? quotePool.poolResources.map((i) => ({
                    resourceAddress: i.resourceAddress,
                    amount: i.poolUnitValue.multipliedBy(quoteLp.amount),
                  }))
                : [];

            // Sum base and quote positions
            const position = sumResourceAmounts(basePosition, quotePosition);

            // Use baseLpResourceAddress as the pool key for output (as before)
            const items = accountBalancesMap.get(accountBalance.address) ?? [];
            accountBalancesMap.set(accountBalance.address, [
              ...items,
              { lpResourceAddress: pool.baseLpResourceAddress, position },
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
