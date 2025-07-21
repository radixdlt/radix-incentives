import { Context, Effect, Layer } from "effect";
import {
  GetFungibleBalanceService,
  type GetFungibleBalanceServiceError,
} from "../gateway/getFungibleBalance";
import {
  type GetEntityDetailsError,
  GetEntityDetailsService,
} from "../gateway/getEntityDetails";
import type { GatewayError } from "../gateway/errors";
import type { AtLedgerState } from "../gateway/schemas";
import { BigNumber } from "bignumber.js";
import { PoolUnitSchema, PoolResourcesSchema } from "./schemas";

export class InvalidPoolResourceError extends Error {
  readonly _tag = "InvalidPoolResourceError";
  constructor(error: unknown) {
    super(
      `Invalid pool resource: ${error instanceof Error ? error.message : error}`
    );
  }
}

export type GetResourcePoolInput = {
  addresses: string[];
  at_ledger_state: AtLedgerState;
};

export type GetResourcePoolOutput = {
  address: string;
  lpResourceAddress: string;
  totalSupply: BigNumber;
  poolResources: {
    resourceAddress: string;
    poolUnitValue: BigNumber;
  }[];
}[];

export type GetResourcePoolError =
  | GatewayError
  | InvalidPoolResourceError
  | GetEntityDetailsError
  | GetFungibleBalanceServiceError;

export class GetResourcePoolUnitsService extends Context.Tag(
  "GetResourcePoolUnitsService"
)<
  GetResourcePoolUnitsService,
  (
    input: GetResourcePoolInput
  ) => Effect.Effect<GetResourcePoolOutput, GetResourcePoolError>
>() {}

export const GetResourcePoolUnitsLive = Layer.effect(
  GetResourcePoolUnitsService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;
    const getEntityDetailsService = yield* GetEntityDetailsService;

    return (input) => {
      return Effect.gen(function* () {
        const entityDetails = yield* getFungibleBalanceService({
          addresses: input.addresses,
          at_ledger_state: input.at_ledger_state,
        });

        return yield* Effect.forEach(
          entityDetails,
          (item) =>
            Effect.gen(function* () {
              const { poolUnit, poolResources } = item.metadata.items.reduce<{
                poolUnit?: string;
                poolResources: string[];
              }>(
                (acc, curr) => {
                  if (curr.key === "pool_unit") {
                    const poolUnitResult = PoolUnitSchema.safeParse({
                      ...curr.value.programmatic_json,
                      // @ts-expect-error: missing variant_name
                      variant_name: "PoolUnit",
                    });

                    if (poolUnitResult.isOk()) {
                      const poolUnit = poolUnitResult.value.value[0];
                      acc.poolUnit = poolUnit;
                    }
                  }

                  if (curr.key === "pool_resources") {
                    const poolResourcesResult = PoolResourcesSchema.safeParse({
                      ...curr.value.programmatic_json,
                      // @ts-expect-error: missing variant_name
                      variant_name: "PoolResources",
                    });

                    if (poolResourcesResult.isOk()) {
                      const poolResources = poolResourcesResult.value.value[0];
                      acc.poolResources = poolResources;
                    }
                  }

                  return acc;
                },
                {
                  poolUnit: undefined,
                  poolResources: [],
                }
              );

              if (!poolUnit || poolResources.length === 0) {
                return yield* Effect.fail(
                  new InvalidPoolResourceError(
                    `Pool ${item.address} has no pool unit or pool resources`
                  )
                );
              }

              const totalSupply = yield* getEntityDetailsService(
                [poolUnit],
                {},
                input.at_ledger_state
              ).pipe(
                Effect.flatMap((responses) => {
                  if (responses[0]?.details?.type !== "FungibleResource") {
                    return Effect.fail(
                      new InvalidPoolResourceError(
                        `${responses[0]?.address ?? poolUnit} is not a fungible resource`
                      )
                    );
                  }
                  return Effect.succeed(
                    new BigNumber(responses[0].details.total_supply)
                  );
                })
              );

              const poolResourcesFungibleResources = poolResources
                .map((poolResource) => {
                  const value = item.fungibleResources.find(
                    (item) => item.resourceAddress === poolResource
                  )?.amount;

                  if (value) {
                    return {
                      resourceAddress: poolResource,
                      poolUnitValue: totalSupply.gt(0)
                        ? value.dividedBy(totalSupply)
                        : new BigNumber(0),
                    };
                  }
                })
                .filter((item) => item !== undefined);

              return {
                address: item.address,
                lpResourceAddress: poolUnit,
                totalSupply,
                poolResources: poolResourcesFungibleResources,
              };
            }),
          { concurrency: "inherit" }
        );
      });
    };
  })
);
