import { Effect } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";

import { DappConstants, DappId } from "data";

import {
  AggregatePoolPositionsService,
  type LpPosition,
} from "./aggregatePoolPositions";

const CaviarNineConstants = DappConstants.CaviarNine.constants;

export type AggregateCaviarninePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export class AggregateCaviarninePositionsService extends Effect.Service<AggregateCaviarninePositionsService>()(
  "AggregateCaviarninePositionsService",
  {
    effect: Effect.gen(function* () {
      const aggregatePoolPositionsService =
        yield* AggregatePoolPositionsService;

      const normalizePoolPositions = Effect.fn(function* (
        input: AggregateCaviarninePositionsInput
      ) {
        // normalise hyperstake positions to be in the same format as caviarnine positions
        const hyperstakePositions =
          input.accountBalance.hyperstakePositions.items.flatMap((item) => {
            return item.position.map((position) => ({
              componentAddress: CaviarNineConstants.HLP.componentAddress,
              xToken: {
                resourceAddress: CaviarNineConstants.HLP.token_x,
                withinPriceBounds:
                  position.resourceAddress === CaviarNineConstants.HLP.token_x
                    ? position.amount.toString()
                    : "0",
                outsidePriceBounds: "0",
              },
              yToken: {
                resourceAddress: CaviarNineConstants.HLP.token_y,
                withinPriceBounds:
                  position.resourceAddress === CaviarNineConstants.HLP.token_y
                    ? position.amount.toString()
                    : "0",
                outsidePriceBounds: "0",
              },
            }));
          });

        const caviarninePositions = Object.entries(
          input.accountBalance.caviarninePositions
        ).flatMap(([componentAddress, poolPositions]) =>
          poolPositions.map((poolPosition) => ({
            componentAddress,
            xToken: {
              resourceAddress: poolPosition.xToken.resourceAddress,
              withinPriceBounds: poolPosition.xToken.withinPriceBounds,
              outsidePriceBounds: poolPosition.xToken.outsidePriceBounds,
            },
            yToken: {
              resourceAddress: poolPosition.yToken.resourceAddress,
              withinPriceBounds: poolPosition.yToken.withinPriceBounds,
              outsidePriceBounds: poolPosition.yToken.outsidePriceBounds,
            },
          }))
        );

        const allPositions: LpPosition[] = [
          ...hyperstakePositions,
          ...caviarninePositions,
        ];

        return allPositions;
      });

      return Effect.fn("aggregateCaviarninePositions")(function* (
        input: AggregateCaviarninePositionsInput
      ) {
        const positions = yield* normalizePoolPositions(input);

        // aggregate pool positions by componentAddress, add pool totals and derive activityId
        return yield* aggregatePoolPositionsService.aggregate({
          positions,
          dAppId: DappId.caviarnine,
          timestamp: input.timestamp,
        });
      });
    }),
  }
) {}

export const AggregateCaviarninePositionsLive =
  AggregateCaviarninePositionsService.Default;
