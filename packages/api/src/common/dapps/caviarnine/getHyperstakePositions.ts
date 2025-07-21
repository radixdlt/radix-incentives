import { Context, Effect, Layer } from "effect";

import type { EntityNotFoundError, GatewayError } from "../../gateway/errors";

import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
  type InvalidInputError,
} from "../../gateway/getFungibleBalance";

import type { InvalidComponentStateError } from "../../gateway/getComponentState";
import { DappConstants } from "data";
import type { GetEntityDetailsError } from "../../gateway/getEntityDetails";
import type { AtLedgerState } from "../../gateway/schemas";

import {
  type GetResourcePoolOutput,
  GetResourcePoolUnitsService,
  type GetResourcePoolError,
  InvalidPoolResourceError,
} from "../../resource-pool/getResourcePoolUnits";

type HyperstakePosition = {
  lpResourceAddress: string;
  position: { resourceAddress: string; amount: BigNumber }[];
};

const CaviarNineConstants = DappConstants.CaviarNine.constants;

export type GetHyperstakePositionsOutput = {
  address: string;
  items: HyperstakePosition[];
}[];

export type GetHyperstakePositionsError =
  | GetEntityDetailsError
  | EntityNotFoundError
  | InvalidInputError
  | GatewayError
  | InvalidComponentStateError
  | GetResourcePoolError;

export class GetHyperstakePositionsService extends Context.Tag(
  "GetHyperstakePositionsService"
)<
  GetHyperstakePositionsService,
  (input: {
    accountAddresses: string[];
    at_ledger_state: AtLedgerState;
    fungibleBalance?: GetFungibleBalanceOutput;
  }) => Effect.Effect<GetHyperstakePositionsOutput, GetHyperstakePositionsError>
>() {}

type AccountAddress = string;

export const GetHyperstakePositionsLive = Layer.effect(
  GetHyperstakePositionsService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;
    const getResourcePoolUnitsService = yield* GetResourcePoolUnitsService;

    return (input) => {
      return Effect.gen(function* () {
        const accountBalancesMap = new Map<
          AccountAddress,
          HyperstakePosition[]
        >();

        // Get the hyperstake pool units
        const pools = yield* getResourcePoolUnitsService({
          addresses: [CaviarNineConstants.HLP.poolAddress],
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

          // Filter for hyperstake LP tokens
          const hyperstakeFungibleResources = fungibleResources.filter(
            (item) =>
              item.resourceAddress === CaviarNineConstants.HLP.resourceAddress
          );
          const accountAddress = accountBalance.address;

          for (const {
            resourceAddress,
            amount,
          } of hyperstakeFungibleResources) {
            // Get the pool for this LP token
            const pool = poolMap.get(resourceAddress);

            if (!pool) {
              return yield* Effect.fail(
                new InvalidPoolResourceError(
                  `Hyperstake pool details not found for LP token: ${resourceAddress}`
                )
              );
            }

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
