import { Decimal } from 'decimal.js';
import {
  Array as A,
  Cache,
  Config,
  Data,
  Duration,
  Effect,
  flow,
  Option,
} from 'effect';
import s from 'sbor-ez-mode';
import type { LiquidityPosition } from '../../../../../common/dapps/ociswap/schemas';
import {
  removableAmounts,
  tickToPriceSqrt,
} from '../../../../../common/dapps/ociswap/tickCalculator';
import { GetComponentStateService } from '../../../../../common/gateway';
import {
  ComponentAddress,
  type FungibleResourceAddress,
  StateVersion,
} from '../../schemas';

export const PrecisionPool = s.struct({
  price_sqrt: s.decimal(),
  active_tick: s.option(s.number()),
});

class ComponentStateNotFoundError extends Data.TaggedError(
  'ComponentStateNotFoundError',
)<{ message: string }> {}

export class PrecisionPoolState extends Effect.Service<PrecisionPoolState>()(
  'PrecisionPoolState',
  {
    dependencies: [GetComponentStateService.Default],
    effect: Effect.gen(function* () {
      const getComponentStateService = yield* GetComponentStateService;

      const lowerPriceBound = yield* Config.number(
        'OCISWAP_PRECISION_POOL_LOWER_PRICE_BOUND',
      ).pipe(Config.withDefault(0.7));

      const upperPriceBound = yield* Config.number(
        'OCISWAP_PRECISION_POOL_UPPER_PRICE_BOUND',
      ).pipe(Config.withDefault(1.3));

      const cacheTimeToLive = yield* Config.duration(
        'OCISWAP_PRECISION_POOL_CACHE_TIME_TO_LIVE',
      ).pipe(Config.withDefault(Duration.minutes(15)));

      const cacheCapacity = yield* Config.number(
        'OCISWAP_PRECISION_POOL_CACHE_CAPACITY',
      ).pipe(Config.withDefault(100));

      const getComponentState = (input: {
        componentAddress: ComponentAddress;
        stateVersion: StateVersion;
      }) =>
        getComponentStateService
          .run({
            addresses: [input.componentAddress],
            schema: PrecisionPool,
            at_ledger_state: {
              state_version: input.stateVersion,
            },
          })
          .pipe(
            Effect.map(
              flow(
                A.head,
                Option.map(({ state }) => {
                  const currentTick =
                    state.active_tick?.variant === 'Some'
                      ? state.active_tick.value
                      : null;
                  const currentPriceSqrt = state.price_sqrt;
                  return {
                    currentTick,
                    currentPriceSqrt,
                  };
                }),
              ),
            ),
          );

      const cache = yield* Cache.make({
        capacity: cacheCapacity,
        timeToLive: cacheTimeToLive,
        lookup: (key: `${ComponentAddress}:${StateVersion}`) =>
          Effect.gen(function* () {
            const [componentAddress, stateVersion] = key.split(':');
            return yield* getComponentState({
              componentAddress: ComponentAddress(componentAddress),
              stateVersion: StateVersion(Number(stateVersion)),
            });
          }),
      });

      return {
        parseLiquidityPositions: (input: {
          componentAddress: ComponentAddress;
          stateVersion: StateVersion;
          liquidityPositions: ReadonlyArray<LiquidityPosition>;
          tokenXDivisibility: number;
          tokenYDivisibility: number;
          tokenXAddress: FungibleResourceAddress;
          tokenYAddress: FungibleResourceAddress;
        }) =>
          Effect.gen(function* () {
            const poolState = yield* cache
              .get(`${input.componentAddress}:${input.stateVersion}`)
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () =>
                      Effect.fail(
                        new ComponentStateNotFoundError({
                          message: `Component state not found for component address ${input.componentAddress} at state version ${input.stateVersion}`,
                        }),
                      ),
                    onSome: (componentState) => Effect.succeed(componentState),
                  }),
                ),
              );

            const currentPriceSqrt = new Decimal(poolState.currentPriceSqrt);
            const currentTick = poolState.currentTick;

            const currentPrice = currentPriceSqrt.pow(2);
            const lowerBoundPriceSqrt = currentPrice
              .mul(lowerPriceBound)
              .sqrt();
            const upperBoundPriceSqrt = currentPrice
              .mul(upperPriceBound)
              .sqrt();

            return yield* Effect.forEach(
              input.liquidityPositions,
              (liquidityPosition) =>
                Effect.gen(function* () {
                  const liquidity = new Decimal(liquidityPosition.liquidity);
                  const leftBound = liquidityPosition.left_bound;
                  const rightBound = liquidityPosition.right_bound;

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
                    input.tokenYDivisibility,
                  );

                  let xBoundedAmount: Decimal;
                  let yBoundedAmount: Decimal;

                  // Check if position overlaps with price bounds
                  const positionOverlapsWithBounds =
                    positionLeftPriceSqrt.lt(upperBoundPriceSqrt!) &&
                    positionRightPriceSqrt.gt(lowerBoundPriceSqrt!);

                  if (!positionOverlapsWithBounds) {
                    // Position is completely outside price bounds
                    xBoundedAmount = new Decimal(0);
                    yBoundedAmount = new Decimal(0);
                  } else {
                    // Calculate effective bounds (intersection of position bounds and price bounds)
                    const effectiveLeftPriceSqrt = Decimal.max(
                      positionLeftPriceSqrt,
                      lowerBoundPriceSqrt!,
                    );
                    const effectiveRightPriceSqrt = Decimal.min(
                      positionRightPriceSqrt,
                      upperBoundPriceSqrt!,
                    );

                    // Calculate bounded amounts using effective bounds
                    [xBoundedAmount, yBoundedAmount] = removableAmounts(
                      liquidity,
                      currentPriceSqrt,
                      effectiveLeftPriceSqrt,
                      effectiveRightPriceSqrt,
                      input.tokenXDivisibility,
                      input.tokenYDivisibility,
                    );

                    const outsidePriceBounds = {
                      x: xTotalAmount.minus(xBoundedAmount).toString(),
                      y: yTotalAmount.minus(yBoundedAmount).toString(),
                    };

                    return {
                      componentAddress: input.componentAddress,
                      isActive,
                      xToken: {
                        outsidePriceBounds: outsidePriceBounds.x,
                        withinPriceBounds: xBoundedAmount.toString(),
                        resourceAddress: input.tokenXAddress,
                      },
                      yToken: {
                        outsidePriceBounds: outsidePriceBounds.y,
                        withinPriceBounds: yBoundedAmount.toString(),
                        resourceAddress: input.tokenYAddress,
                      },
                    };
                  }
                }),
            );
          }),
      };
    }),
  },
) {}
