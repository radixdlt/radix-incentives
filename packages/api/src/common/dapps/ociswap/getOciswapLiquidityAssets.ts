import { Context, Effect, Layer } from "effect";
import { Decimal } from "decimal.js";

import type { AtLedgerState } from "../../gateway/schemas";
import type { GetEntityDetailsError } from "../../gateway/getEntityDetails";
import type { GatewayError, EntityNotFoundError } from "../../gateway/errors";
import {
  GetComponentStateService,
  type InvalidComponentStateError,
} from "../../gateway/getComponentState";
import {
  type GetNonFungibleBalanceOutput,
  GetNonFungibleBalanceService,
  type InvalidInputError,
  type GetNonFungibleBalanceServiceError,
} from "../../gateway/getNonFungibleBalance";
import {
  type FailedToParseOciswapLiquidityPositionError,
  GetOciswapLiquidityClaimsService,
} from "./getOciswapLiquidityClaims";
import { PrecisionPool, PrecisionPoolV2 } from "./schemas";
import { tickToPriceSqrt, removableAmounts } from "./tickCalculator";

export class FailedToParseOciswapComponentStateError {
  readonly _tag = "FailedToParseOciswapComponentStateError";
  constructor(readonly error: unknown) {}
}

export type OciswapLiquidityAsset = {
  xToken: {
    totalAmount: string;
    amountInBounds: string;
    resourceAddress: string;
  };
  yToken: {
    totalAmount: string;
    amountInBounds: string;
    resourceAddress: string;
  };
  isActive: boolean;
};

export class GetOciswapLiquidityAssetsService extends Context.Tag(
  "GetOciswapLiquidityAssetsService"
)<
  GetOciswapLiquidityAssetsService,
  (input: {
    componentAddress: string;
    addresses: string[];
    at_ledger_state: AtLedgerState;
    nonFungibleBalance?: GetNonFungibleBalanceOutput;
    lpResourceAddress: string;
    tokenXAddress: string;
    tokenYAddress: string;
    tokenXDivisibility: number;
    tokenYDivisibility: number;
    schemaVersion?: "v1" | "v2";
    priceBounds?: {
      lower: number;
      upper: number;
    };
  }) => Effect.Effect<
    {
      address: string;
      items: OciswapLiquidityAsset[];
    }[],
    | FailedToParseOciswapComponentStateError
    | GetEntityDetailsError
    | GatewayError
    | EntityNotFoundError
    | InvalidInputError
    | InvalidComponentStateError
    | FailedToParseOciswapLiquidityPositionError
    | GetNonFungibleBalanceServiceError
  >
>() {}

export const GetOciswapLiquidityAssetsLive = Layer.effect(
  GetOciswapLiquidityAssetsService,
  Effect.gen(function* () {
    const getComponentStateService = yield* GetComponentStateService;
    const getOciswapLiquidityClaimsService =
      yield* GetOciswapLiquidityClaimsService;
    const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;

    return (input) => {
      return Effect.gen(function* () {
        const componentStateResult =
          input.schemaVersion === "v2"
            ? yield* getComponentStateService({
                addresses: [input.componentAddress],
                schema: PrecisionPoolV2,
                at_ledger_state: input.at_ledger_state,
              })
            : yield* getComponentStateService({
                addresses: [input.componentAddress],
                schema: PrecisionPool,
                at_ledger_state: input.at_ledger_state,
              });

        if (componentStateResult.length === 0) {
          return yield* Effect.fail(
            new FailedToParseOciswapComponentStateError("Component not found")
          );
        }

        const componentResult = componentStateResult[0];
        if (!componentResult) {
          return yield* Effect.fail(
            new FailedToParseOciswapComponentStateError(
              "Component result is undefined"
            )
          );
        }

        const { state: poolState } = componentResult;

        const nonFungibleBalances = input.nonFungibleBalance
          ? input.nonFungibleBalance
          : yield* getNonFungibleBalanceService({
              addresses: input.addresses,
              at_ledger_state: input.at_ledger_state,
            });

        const ociswapLiquidityNfts = nonFungibleBalances.items.flatMap((item) =>
          item.nonFungibleResources
            .filter((nft) => nft.resourceAddress === input.lpResourceAddress)
            .flatMap((nft) => nft.items)
            .map((nft) => ({ ...nft, address: item.address }))
        );

        const nftIds = ociswapLiquidityNfts.map((nft) => nft.id);

        const nftOwnerMap = ociswapLiquidityNfts.reduce((acc, nft) => {
          acc.set(nft.id, nft.address);
          return acc;
        }, new Map<string, string>());

        if (nftIds.length === 0) {
          return yield* Effect.succeed([]);
        }

        const currentPriceSqrt = new Decimal(poolState.price_sqrt.toString());
        const currentTick =
          poolState.active_tick?.variant === "Some"
            ? poolState.active_tick.value
            : null;

        // Calculate price bounds only if provided
        const currentPrice = currentPriceSqrt.pow(2);
        let lowerBoundPriceSqrt: Decimal | undefined;
        let upperBoundPriceSqrt: Decimal | undefined;

        if (input.priceBounds) {
          lowerBoundPriceSqrt = currentPrice
            .mul(input.priceBounds.lower)
            .sqrt();
          upperBoundPriceSqrt = currentPrice
            .mul(input.priceBounds.upper)
            .sqrt();
        }

        const nfts = yield* getOciswapLiquidityClaimsService({
          lpResourceAddress: input.lpResourceAddress,
          nonFungibleLocalIds: nftIds,
          at_ledger_state: input.at_ledger_state,
        }).pipe(
          Effect.withSpan("getOciswapLiquidityClaimsService"),
          Effect.map((items) =>
            items.map((nft) => ({
              ...nft,
              // biome-ignore lint/style/noNonNullAssertion: guaranteed to exist
              address: nftOwnerMap.get(nft.nonFungibleId)!,
            }))
          )
        );

        return yield* Effect.forEach(nfts, ({ liquidityPosition, address }) => {
          return Effect.gen(function* () {
            const liquidity = new Decimal(liquidityPosition.liquidity);
            const leftBound = liquidityPosition.leftBound;
            const rightBound = liquidityPosition.rightBound;

            const positionLeftPriceSqrt = tickToPriceSqrt(leftBound);
            const positionRightPriceSqrt = tickToPriceSqrt(rightBound);

            const isActive =
              currentTick !== null &&
              currentTick >= leftBound &&
              currentTick < rightBound;

            // Calculate total amounts (full position)
            const [xTotalAmount, yTotalAmount] = removableAmounts(
              liquidity,
              currentPriceSqrt,
              positionLeftPriceSqrt,
              positionRightPriceSqrt,
              input.tokenXDivisibility,
              input.tokenYDivisibility
            );

            let xBoundedAmount: Decimal;
            let yBoundedAmount: Decimal;

            if (!input.priceBounds) {
              // No price bounds - everything is in bounds
              xBoundedAmount = xTotalAmount;
              yBoundedAmount = yTotalAmount;
            } else {
              // Check if position overlaps with price bounds
              const positionOverlapsWithBounds =
                // biome-ignore lint/style/noNonNullAssertion: guaranteed to exist
                positionLeftPriceSqrt.lt(upperBoundPriceSqrt!) &&
                // biome-ignore lint/style/noNonNullAssertion: guaranteed to exist
                positionRightPriceSqrt.gt(lowerBoundPriceSqrt!);

              if (!positionOverlapsWithBounds) {
                // Position is completely outside price bounds
                xBoundedAmount = new Decimal(0);
                yBoundedAmount = new Decimal(0);
              } else {
                // Calculate effective bounds (intersection of position bounds and price bounds)
                const effectiveLeftPriceSqrt = Decimal.max(
                  positionLeftPriceSqrt,
                  // biome-ignore lint/style/noNonNullAssertion: guaranteed to exist
                  lowerBoundPriceSqrt!
                );
                const effectiveRightPriceSqrt = Decimal.min(
                  positionRightPriceSqrt,
                  // biome-ignore lint/style/noNonNullAssertion: guaranteed to exist
                  upperBoundPriceSqrt!
                );

                // Calculate bounded amounts using effective bounds
                [xBoundedAmount, yBoundedAmount] = removableAmounts(
                  liquidity,
                  currentPriceSqrt,
                  effectiveLeftPriceSqrt,
                  effectiveRightPriceSqrt,
                  input.tokenXDivisibility,
                  input.tokenYDivisibility
                );
              }
            }

            return {
              address,
              xToken: {
                totalAmount: xTotalAmount.toString(),
                amountInBounds: xBoundedAmount.toString(),
                resourceAddress: input.tokenXAddress,
              },
              yToken: {
                totalAmount: yTotalAmount.toString(),
                amountInBounds: yBoundedAmount.toString(),
                resourceAddress: input.tokenYAddress,
              },
              isActive,
            };
          });
        }).pipe(
          Effect.map((items) => {
            const addressAssetMap = new Map<string, OciswapLiquidityAsset[]>();

            for (const { address, ...rest } of items) {
              const existing = addressAssetMap.get(address);
              if (!existing) {
                addressAssetMap.set(address, [rest]);
              } else {
                existing.push(rest);
              }
            }

            return Array.from(addressAssetMap.entries()).map(
              ([address, items]) => ({
                address,
                items,
              })
            );
          })
        );
      });
    };
  })
);
