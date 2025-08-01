import { Effect } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { DappId } from "data";

import {
  AggregatePoolPositionsService,
  type LpPosition,
} from "./aggregatePoolPositions";
import { BigNumber } from "bignumber.js";

export type AggregateOciswapPositionsOutput = Effect.Effect.Success<
  ReturnType<typeof AggregateOciswapPositionsService.Service>
>;

type OciswapPositions = AccountBalanceFromSnapshot["ociswapPositions"];

export class AggregateOciswapPositionsService extends Effect.Service<AggregateOciswapPositionsService>()(
  "AggregateOciswapPositionsService",
  {
    effect: Effect.gen(function* () {
      const aggregatePoolPositionsService =
        yield* AggregatePoolPositionsService;

      const normalizePoolPositions = Effect.fn(function* (
        input: OciswapPositions
      ) {
        const positions: LpPosition[] = Object.entries(input).flatMap(
          ([componentAddress, poolPositions]) => {
            return poolPositions.map((position) => {
              const xTokenWithinPriceBounds = new BigNumber(
                position.xToken.amountInBounds
              ).toString();
              const xTokenOutsidePriceBounds = new BigNumber(
                position.xToken.totalAmount
              )
                .minus(xTokenWithinPriceBounds)
                .toString();

              const yTokenWithinPriceBounds = new BigNumber(
                position.yToken.amountInBounds
              ).toString();
              const yTokenOutsidePriceBounds = new BigNumber(
                position.yToken.totalAmount
              )
                .minus(yTokenWithinPriceBounds)
                .toString();

              return {
                componentAddress,
                xToken: {
                  resourceAddress: position.xToken.resourceAddress,
                  withinPriceBounds: xTokenWithinPriceBounds,
                  outsidePriceBounds: xTokenOutsidePriceBounds,
                },
                yToken: {
                  resourceAddress: position.yToken.resourceAddress,
                  withinPriceBounds: yTokenWithinPriceBounds,
                  outsidePriceBounds: yTokenOutsidePriceBounds,
                },
              };
            });
          }
        );
        return positions;
      });

      return Effect.fn("AggregateOciswapPositionsService")(function* (input: {
        accountBalance: OciswapPositions;
        timestamp: Date;
      }) {
        const positions = yield* normalizePoolPositions(input.accountBalance);

        return yield* aggregatePoolPositionsService.aggregate({
          positions,
          dAppId: DappId.ociswap,
          timestamp: input.timestamp,
        });
      });
    }),
  }
) {}

export const AggregateOciswapPositionsLive =
  AggregateOciswapPositionsService.Default;
