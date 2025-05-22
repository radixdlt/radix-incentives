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
import type { InvalidInputError } from "../../gateway/getNonFungibleBalance";
import type { GetLedgerStateService } from "../../gateway/getLedgerState";
import { GetQuantaSwapBinMapService } from "./getQuantaSwapBinMap";
import {
  type FailedToParseLiquidityClaimsError,
  GetShapeLiquidityClaimsService,
} from "./getShapeLiquidityClaims";
import { I192 } from "../../helpers/i192";

export class FailedToParseComponentStateError {
  readonly _tag = "FailedToParseComponentStateError";
  constructor(readonly error: unknown) {}
}

export class GetShapeLiquidityAssetsService extends Context.Tag(
  "GetShapeLiquidityAssetsService"
)<
  GetShapeLiquidityAssetsService,
  (input: {
    componentAddress: string;
    liquidityReceiptResourceAddress: string;
    nonFungibleLocalIds: string[];
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    {
      xToken: {
        amount: string;
        resourceAddress: string;
      };
      yToken: {
        amount: string;
        resourceAddress: string;
      };
      isActive: boolean;
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
  >
>() {}

export const GetShapeLiquidityAssetsLive = Layer.effect(
  GetShapeLiquidityAssetsService,
  Effect.gen(function* () {
    const getComponentStateService = yield* GetComponentStateService;
    const getQuantaSwapBinMapService = yield* GetQuantaSwapBinMapService;
    const getShapeLiquidityClaimsService =
      yield* GetShapeLiquidityClaimsService;

    return (input) => {
      return Effect.gen(function* () {
        const [{ state: quantaSwapState, details }] =
          yield* getComponentStateService({
            addresses: [input.componentAddress],
            schema: QuantaSwap,
            at_ledger_state: input.at_ledger_state,
            options: {
              explicitMetadata: ["token_x", "token_y"],
            },
          });

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

        const active_total_claim = new I192(quantaSwapState.active_total_claim);
        const active_x = new I192(quantaSwapState.active_x);
        const active_y = new I192(quantaSwapState.active_y);

        const currentTick =
          quantaSwapState.tick_index.current.variant === "Some"
            ? quantaSwapState.tick_index.current.value[0]
            : undefined;

        if (!currentTick)
          return yield* Effect.fail(
            new FailedToParseComponentStateError("Current tick is not defined")
          );

        const binMapData = yield* getQuantaSwapBinMapService({
          address: quantaSwapState.bin_map,
          at_ledger_state: input.at_ledger_state,
        });

        const nfts = yield* getShapeLiquidityClaimsService({
          componentAddress: input.componentAddress,
          liquidityReceiptResourceAddress:
            input.liquidityReceiptResourceAddress,
          nonFungibleLocalIds: input.nonFungibleLocalIds,
          at_ledger_state: input.at_ledger_state,
        });

        return yield* Effect.forEach(
          nfts,
          ({ liquidityClaims, nonFungibleId, resourceAddress }) => {
            return Effect.gen(function* () {
              let amount_x = I192.zero();
              let amount_y = I192.zero();
              let isActive = false;

              for (const [tick, claimAmount] of liquidityClaims.entries()) {
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
                  amount_y = amount_y.add(share.multiply(bin.amount));
                }

                if (tickIsGreaterThanCurrentTick) {
                  const share = new I192(claimAmount).divide(bin.total_claim);
                  amount_x = amount_x.add(share.multiply(bin.amount));
                }

                if (tickIsEqualToCurrentTick) {
                  // Bin at current tick - X and Y tokens
                  isActive = true;
                  const share = new I192(claimAmount).divide(
                    active_total_claim
                  );
                  amount_x = amount_x.add(active_x.multiply(share));
                  amount_y = amount_y.add(active_y.multiply(share));
                }
              }

              return yield* Effect.succeed({
                xToken: {
                  amount: amount_x.toString(),
                  resourceAddress: token_x_address,
                },
                yToken: {
                  amount: amount_y.toString(),
                  resourceAddress: token_y_address,
                },
                isActive,
                nonFungibleId,
                resourceAddress,
              });
            });
          }
        );
      });
    };
  })
);
