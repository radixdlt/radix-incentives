import { Context, Effect, Layer } from "effect";

import type { AtLedgerState } from "../../gateway/schemas";
import type {
  GetEntityDetailsError,
  GetEntityDetailsService,
} from "../../gateway/getEntityDetails";
import type { EntityNonFungibleDataService } from "../../gateway/entityNonFungiblesData";
import type { GatewayApiClientService } from "../../gateway/gatewayApiClient";
import { QuantaSwap } from "./schemas";
import type { EntityNotFoundError, GatewayError } from "../../gateway/errors";
import type { KeyValueStoreDataService } from "../../gateway/keyValueStoreData";
import type { KeyValueStoreKeysService } from "../../gateway/keyValueStoreKeys";

import {
  GetComponentStateService,
  type InvalidComponentStateError,
} from "../../gateway/getComponentState";
import {
  type GetNonFungibleBalanceOutput,
  GetNonFungibleBalanceService,
  type InvalidInputError,
} from "../../gateway/getNonFungibleBalance";
import type { GetLedgerStateService } from "../../gateway/getLedgerState";
import { GetQuantaSwapBinMapService } from "./getQuantaSwapBinMap";
import {
  type FailedToParseLiquidityClaimsError,
  GetShapeLiquidityClaimsService,
} from "./getShapeLiquidityClaims";
import { I192 } from "../../helpers/i192";
import type { EntityNonFungiblesPageService } from "../../gateway/entityNonFungiblesPage";
import { calculatePrice, calculateTick } from "./tickCalculator";

export class FailedToParseComponentStateError {
  readonly _tag = "FailedToParseComponentStateError";
  constructor(readonly error: unknown) {}
}

export type ShapeLiquidityAsset = {
  xToken: {
    withinPriceBounds: string;
    outsidePriceBounds: string;
    resourceAddress: string;
  };
  yToken: {
    withinPriceBounds: string;
    outsidePriceBounds: string;
    resourceAddress: string;
  };
  currentPrice: string;
  nonFungibleId: string;
  resourceAddress: string;
  isActive: boolean;
};

export class GetShapeLiquidityAssetsService extends Context.Tag(
  "GetShapeLiquidityAssetsService"
)<
  GetShapeLiquidityAssetsService,
  (input: {
    componentAddress: string;
    addresses: string[];
    at_ledger_state: AtLedgerState;
    nonFungibleBalance?: GetNonFungibleBalanceOutput;
    priceBounds: {
      lower: number;
      upper: number;
    };
  }) => Effect.Effect<
    {
      address: string;
      items: ShapeLiquidityAsset[];
    }[],
    | FailedToParseComponentStateError
    | GetEntityDetailsError
    | GatewayError
    | EntityNotFoundError
    | GetEntityDetailsError
    | InvalidInputError
    | InvalidComponentStateError
    | FailedToParseLiquidityClaimsError,
    | GetEntityDetailsService
    | EntityNonFungibleDataService
    | GatewayApiClientService
    | KeyValueStoreDataService
    | KeyValueStoreKeysService
    | GetComponentStateService
    | GetLedgerStateService
    | GetQuantaSwapBinMapService
    | GetShapeLiquidityClaimsService
    | GetNonFungibleBalanceService
    | EntityNonFungiblesPageService
  >
>() {}

export const GetShapeLiquidityAssetsLive = Layer.effect(
  GetShapeLiquidityAssetsService,
  Effect.gen(function* () {
    const getComponentStateService = yield* GetComponentStateService;
    const getQuantaSwapBinMapService = yield* GetQuantaSwapBinMapService;
    const getShapeLiquidityClaimsService =
      yield* GetShapeLiquidityClaimsService;
    const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;

    return (input) => {
      return Effect.gen(function* () {
        const componentStateResult = yield* getComponentStateService({
          addresses: [input.componentAddress],
          schema: QuantaSwap,
          at_ledger_state: input.at_ledger_state,
          options: {
            explicitMetadata: ["token_x", "token_y"],
          },
        });

        if (componentStateResult.length === 0) {
          return yield* Effect.fail(
            new FailedToParseComponentStateError("Component not found")
          );
        }

        const componentResult = componentStateResult[0];
        if (!componentResult) {
          return yield* Effect.fail(
            new FailedToParseComponentStateError(
              "Component result is undefined"
            )
          );
        }

        const { state: quantaSwapState, details } = componentResult;

        const metadata = details.explicit_metadata?.items;
        const token_x = metadata?.find((item) => item.key === "token_x");
        const token_y = metadata?.find((item) => item.key === "token_y");

        const token_x_address =
          token_x?.value.typed.type === "GlobalAddress"
            ? token_x.value.typed.value
            : undefined;

        const token_y_address =
          token_y?.value.typed.type === "GlobalAddress"
            ? token_y.value.typed.value
            : undefined;

        if (!token_x_address || !token_y_address) {
          return yield* Effect.fail(
            new FailedToParseComponentStateError("Token X or Y is not defined")
          );
        }

        const binSpan = quantaSwapState.bin_span;
        const currentTick =
          quantaSwapState.tick_index.current.variant === "Some"
            ? quantaSwapState.tick_index.current.value[0]
            : undefined;

        if (!currentTick)
          return yield* Effect.fail(
            new FailedToParseComponentStateError("Current tick is not defined")
          );

        const nonFungibleBalances = input.nonFungibleBalance
          ? input.nonFungibleBalance
          : yield* getNonFungibleBalanceService({
              addresses: input.addresses,
              at_ledger_state: input.at_ledger_state,
            });

        const shapeLiquidityNfts = nonFungibleBalances.items.flatMap((item) =>
          item.nonFungibleResources
            .filter(
              (nft) =>
                nft.resourceAddress ===
                quantaSwapState.liquidity_receipt_manager
            )
            .flatMap((nft) => nft.items)
            .map((nft) => ({ ...nft, address: item.address }))
        );

        const nftIds = shapeLiquidityNfts.map((nft) => nft.id);

        const nftOwnerMap = shapeLiquidityNfts.reduce((acc, nft) => {
          acc.set(nft.id, nft.address);
          return acc;
        }, new Map<string, string>());

        if (nftIds.length === 0) {
          return yield* Effect.succeed([]);
        }

        const active_total_claim = new I192(quantaSwapState.active_total_claim);
        const active_x = new I192(quantaSwapState.active_x);
        const active_y = new I192(quantaSwapState.active_y);

        const middleTick = currentTick + Math.floor(binSpan / 2);
        const currentPrice = calculatePrice(middleTick);

        const lowerPrice = currentPrice.mul(input.priceBounds.lower);
        const upperPrice = currentPrice.mul(input.priceBounds.upper);
        const lowerTick = calculateTick(lowerPrice);
        const upperTick = calculateTick(upperPrice);

        const binMapData = yield* getQuantaSwapBinMapService({
          address: quantaSwapState.bin_map,
          at_ledger_state: input.at_ledger_state,
        });

        const nfts = yield* getShapeLiquidityClaimsService({
          componentAddress: input.componentAddress,
          liquidityReceiptResourceAddress:
            quantaSwapState.liquidity_receipt_manager,
          nonFungibleLocalIds: nftIds,
          at_ledger_state: input.at_ledger_state,
        }).pipe(
          Effect.map((items) =>
            items.map((nft) => ({
              ...nft,
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              address: nftOwnerMap.get(nft.nonFungibleId)!,
            }))
          )
        );

        return yield* Effect.forEach(
          nfts,
          ({ liquidityClaims, nonFungibleId, resourceAddress, address }) => {
            return Effect.gen(function* () {
              let isActive = false;

              const withinPriceBounds = {
                amount_x: I192.zero(),
                amount_y: I192.zero(),
              };
              const outsidePriceBounds = {
                amount_x: I192.zero(),
                amount_y: I192.zero(),
              };

              for (const [tick, claimAmount] of liquidityClaims.entries()) {
                const isTickWithinPriceBounds =
                  tick >= lowerTick && tick <= upperTick;

                const bin = binMapData.get(tick);
                const binIsDefined = !!bin;

                // Bin below current tick - only Y tokens
                const tickIsLessThanCurrentTick =
                  tick < currentTick && binIsDefined;

                // Bin above current tick - only X tokens
                const tickIsGreaterThanCurrentTick =
                  tick > currentTick && binIsDefined;

                // Bin at current tick - X and Y tokens
                const tickIsEqualToCurrentTick = tick === currentTick;

                if (tickIsLessThanCurrentTick) {
                  const share = new I192(claimAmount).divide(bin.total_claim);
                  const amount = share.multiply(bin.amount);
                  if (isTickWithinPriceBounds) {
                    withinPriceBounds.amount_y =
                      withinPriceBounds.amount_y.add(amount);
                  } else {
                    outsidePriceBounds.amount_y =
                      outsidePriceBounds.amount_y.add(amount);
                  }
                }

                if (tickIsGreaterThanCurrentTick) {
                  const share = new I192(claimAmount).divide(bin.total_claim);
                  const amount = share.multiply(bin.amount);
                  if (isTickWithinPriceBounds) {
                    withinPriceBounds.amount_x =
                      withinPriceBounds.amount_x.add(amount);
                  } else {
                    outsidePriceBounds.amount_x =
                      outsidePriceBounds.amount_x.add(amount);
                  }
                }

                if (tickIsEqualToCurrentTick) {
                  // Bin at current tick - X and Y tokens
                  isActive = true;
                  const share = new I192(claimAmount).divide(
                    active_total_claim
                  );
                  const amount_x = active_x.multiply(share);
                  const amount_y = active_y.multiply(share);

                  withinPriceBounds.amount_x =
                    withinPriceBounds.amount_x.add(amount_x);
                  withinPriceBounds.amount_y =
                    withinPriceBounds.amount_y.add(amount_y);
                }
              }

              return yield* Effect.succeed({
                address,
                xToken: {
                  withinPriceBounds: withinPriceBounds.amount_x.toString(),
                  outsidePriceBounds: outsidePriceBounds.amount_x.toString(),
                  resourceAddress: token_x_address,
                },
                yToken: {
                  withinPriceBounds: withinPriceBounds.amount_y.toString(),
                  outsidePriceBounds: outsidePriceBounds.amount_y.toString(),
                  resourceAddress: token_y_address,
                },
                isActive,
                nonFungibleId,
                resourceAddress,
                currentPrice: currentPrice.toString(),
              });
            });
          }
        ).pipe(
          Effect.map((items) => {
            const addressAssetMap = new Map<string, ShapeLiquidityAsset[]>();

            for (const { address, ...rest } of items) {
              const existing = addressAssetMap.get(address);
              if (!existing) {
                addressAssetMap.set(address, [rest]);
              } else {
                existing.push(rest);
              }
            }

            const result = Array.from(addressAssetMap.entries()).map(
              ([address, items]) => ({
                at_ledger_state: input.at_ledger_state,
                address,
                items,
              })
            );

            return result;
          })
        );
      });
    };
  })
);
