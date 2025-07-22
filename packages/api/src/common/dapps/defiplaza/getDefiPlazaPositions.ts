import { Effect } from "effect";
import BigNumber from "bignumber.js";

import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from "../../gateway/getFungibleBalance";

import { DappConstants } from "data";
import type { AtLedgerState } from "../../gateway/schemas";

const DefiPlazaConstants = DappConstants.DefiPlaza.constants;

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

type AccountAddress = string;

export class GetDefiPlazaPositionsService extends Effect.Service<GetDefiPlazaPositionsService>()(
  "GetDefiPlazaPositionsService",
  {
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;

      const getResourcePoolUnitsService = yield* GetResourcePoolUnitsService;

      return Effect.fn(function* (input: {
        accountAddresses: string[];
        at_ledger_state: AtLedgerState;
        fungibleBalance?: GetFungibleBalanceOutput;
      }) {
        const accountBalancesMap = new Map<
          AccountAddress,
          DefiPlazaPosition[]
        >();

        // Gather all pool addresses (base and quote) and LP resource addresses
        const allPoolAddresses = Object.values(DefiPlazaConstants).flatMap(
          (pool) => [pool.basePoolAddress, pool.quotePoolAddress]
        );
        const allLpResourceAddresses = Object.values(
          DefiPlazaConstants
        ).flatMap((pool) => [
          pool.baseLpResourceAddress,
          pool.quoteLpResourceAddress,
        ]);

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
          (typeof DefiPlazaConstants)[keyof typeof DefiPlazaConstants]
        >();
        for (const pool of Object.values(DefiPlazaConstants)) {
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
          for (const pool of Object.values(DefiPlazaConstants)) {
            const baseLp = userLpBalances.get(pool.baseLpResourceAddress);
            const quoteLp = userLpBalances.get(pool.quoteLpResourceAddress);

            // Get pool data for both LPs
            const basePool = poolMap.get(pool.baseLpResourceAddress);
            const quotePool = poolMap.get(pool.quoteLpResourceAddress);

            // Helper to sum resources
            const sumResourceAmounts = (
              resourcesA: { resourceAddress: string; amount: BigNumber }[] = [],
              resourcesB: { resourceAddress: string; amount: BigNumber }[] = []
            ) => {
              const map = new Map<string, BigNumber>();
              for (const r of resourcesA) {
                map.set(r.resourceAddress, r.amount ?? new BigNumber(0));
              }
              for (const r of resourcesB) {
                const prev = map.get(r.resourceAddress) ?? new BigNumber(0);
                map.set(
                  r.resourceAddress,
                  prev.plus(r.amount ?? new BigNumber(0))
                );
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

            const position = sumResourceAmounts(basePosition, quotePosition);

            // Ensure both base and quote resources are present in the position array
            const ensureResource = (resourceAddress: string) => {
              if (
                !position.some((p) => p.resourceAddress === resourceAddress)
              ) {
                position.push({ resourceAddress, amount: new BigNumber(0) });
              }
            };
            ensureResource(pool.baseResourceAddress);
            ensureResource(pool.quoteResourceAddress);

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
    }),
  }
) {}

export const GetDefiPlazaPositionsLive = GetDefiPlazaPositionsService.Default;
