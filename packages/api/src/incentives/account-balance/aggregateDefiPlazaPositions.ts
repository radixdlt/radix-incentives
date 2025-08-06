import { DappId, defiPlazaLpResourceAddressToComponentAddress } from 'data';
import { Data, Effect } from 'effect';
import type { AccountBalance as AccountBalanceFromSnapshot } from './getAccountBalancesAtStateVersion';

import {
  AggregatePoolPositionsService,
  type LpPosition,
} from './aggregatePoolPositions';

export class InvalidDefiPlazaPositionError extends Data.TaggedClass(
  'InvalidDefiPlazaPositionError',
)<{ lpResourceAddress: string; reason: string }> {}

export type AggregateDefiPlazaPositionsOutput = Effect.Effect.Success<
  ReturnType<typeof AggregateDefiPlazaPositionsService.Service>
>;

type DefiPlazaPositions = AccountBalanceFromSnapshot['defiPlazaPositions'];

export class AggregateDefiPlazaPositionsService extends Effect.Service<AggregateDefiPlazaPositionsService>()(
  'AggregateDefiPlazaPositionsService',
  {
    effect: Effect.gen(function* () {
      const aggregatePoolPositionsService =
        yield* AggregatePoolPositionsService;

      const normalizePoolPositions = Effect.fn(function* (
        input: DefiPlazaPositions,
      ) {
        const positions: LpPosition[] = yield* Effect.forEach(
          input.items,
          Effect.fn(function* (item) {
            const xToken = item.position[0]!;
            const yToken = item.position[1]!;

            const componentAddress =
              defiPlazaLpResourceAddressToComponentAddress.get(
                item.lpResourceAddress,
              );

            if (!componentAddress) {
              return yield* Effect.fail(
                new InvalidDefiPlazaPositionError({
                  lpResourceAddress: item.lpResourceAddress,
                  reason: `Component address not found for lpResourceAddress: ${item.lpResourceAddress}`,
                }),
              );
            }
            return {
              componentAddress: componentAddress,
              xToken: {
                resourceAddress: xToken.resourceAddress,
                withinPriceBounds: xToken.amount.toString(),
                outsidePriceBounds: '0',
              },
              yToken: {
                resourceAddress: yToken.resourceAddress,
                withinPriceBounds: yToken.amount.toString(),
                outsidePriceBounds: '0',
              },
            };
          }),
        );
        return positions;
      });

      return Effect.fn('AggregateDefiPlazaPositionsService')(function* (input: {
        accountBalance: DefiPlazaPositions;
        timestamp: Date;
      }) {
        const positions = yield* normalizePoolPositions(input.accountBalance);

        return yield* aggregatePoolPositionsService.aggregate({
          positions,
          dAppId: DappId.defiPlaza,
          timestamp: input.timestamp,
        });
      });
    }),
  },
) {}

export const AggregateDefiPlazaPositionsLive =
  AggregateDefiPlazaPositionsService.Default;
