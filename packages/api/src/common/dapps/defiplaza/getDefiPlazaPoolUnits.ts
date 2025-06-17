import { Context, Effect, Layer } from "effect";
import {
  GetFungibleBalanceService,
  type GetFungibleBalanceServiceDependencies,
  type GetFungibleBalanceServiceError,
} from "../../gateway/getFungibleBalance";
import {
  type GetEntityDetailsError,
  GetEntityDetailsService,
} from "../../gateway/getEntityDetails";
import type { GatewayError } from "../../gateway/errors";
import type { AtLedgerState } from "../../gateway/schemas";
import { BigNumber } from "bignumber.js";

export class InvalidPoolResourceError extends Error {
  readonly _tag = "InvalidPoolResourceError";
  constructor(error: unknown) {
    super(
      `Invalid pool resource: ${error instanceof Error ? error.message : error}`
    );
  }
}

export type GetDefiPlazaPoolUnitsInput = {
  items: {
    poolAddress: string;
    lpResourceAddress: string;
    baseResourceAddress: string;
    quoteResourceAddress: string;
  }[];
  at_ledger_state: AtLedgerState;
};

export type GetDefiPlazaPoolUnitsOutput = {
  poolAddress: string;
  lpResourceAddress: string;
  baseResourceAddress: string;
  quoteResourceAddress: string;
  totalSupply: BigNumber;
  basePerPoolUnit: BigNumber;
  quotePerPoolUnit: BigNumber;
}[];

export type GetDefiPlazaPoolUnitsError =
  | GatewayError
  | InvalidPoolResourceError
  | GetEntityDetailsError
  | GetFungibleBalanceServiceError;

export type GetDefiPlazaPoolUnitsDependencies =
  | GetFungibleBalanceService
  | GetEntityDetailsService
  | GetFungibleBalanceServiceDependencies;

export class GetDefiPlazaPoolUnitsService extends Context.Tag(
  "GetDefiPlazaPoolUnitsService"
)<
  GetDefiPlazaPoolUnitsService,
  (
    input: GetDefiPlazaPoolUnitsInput
  ) => Effect.Effect<
    GetDefiPlazaPoolUnitsOutput,
    GetDefiPlazaPoolUnitsError,
    GetDefiPlazaPoolUnitsDependencies
  >
>() {}

export const GetDefiPlazaPoolUnitsLive = Layer.effect(
  GetDefiPlazaPoolUnitsService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;
    const getEntityDetailsService = yield* GetEntityDetailsService;

    return (input) => {
      return Effect.gen(function* () {
        const withTotalSupply = yield* getEntityDetailsService(
          input.items.map((item) => item.lpResourceAddress),
          {},
          input.at_ledger_state
        ).pipe(
          Effect.flatMap((response) =>
            Effect.forEach(response, (item) =>
              Effect.gen(function* () {
                if (item?.details?.type !== "FungibleResource") {
                  return yield* Effect.fail(
                    new InvalidPoolResourceError(
                      `${item.address} is not a fungible resource`
                    )
                  );
                }

                const pool = input.items.find(
                  (p) => item.address === p.lpResourceAddress
                );

                if (!pool) {
                  return yield* Effect.fail(
                    new InvalidPoolResourceError(
                      `Pool ${item.address} not found`
                    )
                  );
                }

                const totalSupply = new BigNumber(item.details.total_supply);

                return yield* Effect.succeed({
                  ...pool,
                  totalSupply,
                });
              })
            )
          )
        );

        return yield* getFungibleBalanceService({
          addresses: input.items.map((item) => item.poolAddress),
          at_ledger_state: input.at_ledger_state,
        }).pipe(
          Effect.flatMap((response) =>
            Effect.forEach(response, (poolEntity) => {
              return Effect.gen(function* () {
                const pool = withTotalSupply.find(
                  (item) => item.poolAddress === poolEntity.address
                );

                if (!pool) {
                  return yield* Effect.fail(
                    new InvalidPoolResourceError(
                      `Pool ${poolEntity.address} not found`
                    )
                  );
                }

                const { baseResource, quoteResource } =
                  poolEntity.fungibleResources.reduce<{
                    baseResource: BigNumber | undefined;
                    quoteResource: BigNumber | undefined;
                  }>(
                    (acc, curr) => {
                      if (curr.resourceAddress === pool.baseResourceAddress) {
                        acc.baseResource = new BigNumber(curr.amount);
                      }

                      if (curr.resourceAddress === pool.quoteResourceAddress) {
                        acc.quoteResource = new BigNumber(curr.amount);
                      }

                      return acc;
                    },
                    {
                      baseResource: undefined,
                      quoteResource: undefined,
                    }
                  );

                if (!baseResource || !quoteResource) {
                  return yield* Effect.fail(
                    new InvalidPoolResourceError(
                      `Pool ${poolEntity.address} has no base or quote resource`
                    )
                  );
                }

                const basePerPoolUnit = pool.totalSupply.gt(0)
                  ? baseResource.dividedBy(pool.totalSupply)
                  : new BigNumber(0);

                const quotePerPoolUnit = pool.totalSupply.gt(0)
                  ? quoteResource.dividedBy(pool.totalSupply)
                  : new BigNumber(0);

                return {
                  ...pool,
                  basePerPoolUnit,
                  quotePerPoolUnit,
                };
              });
            })
          )
        );
      });
    };
  })
);
