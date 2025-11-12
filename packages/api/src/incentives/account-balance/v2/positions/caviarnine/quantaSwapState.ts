import { Cache, Config, Data, Duration, Effect, Schema } from 'effect';
import { GetQuantaSwapBinMapService } from '../../../../../common/dapps/caviarnine/getQuantaSwapBinMap';
import { QuantaSwap as QuantaSwapSchema } from '../../../../../common/dapps/caviarnine/schemas';
import {
  calculatePrice,
  calculateTick,
} from '../../../../../common/dapps/caviarnine/tickCalculator';
import { I192 } from '../../../../../common/helpers/i192';
import { QuantaSwapMetadataSchema } from '../../../../component-definition/caviarnine/quantaSwap';
import { GetComponentEntityDetails } from '../../../../component-definition/getComponentEntityDetails';
import { parseSbor } from '../../helpers/parseSbor';
import {
  ComponentAddress,
  FungibleResourceAddress,
  NonFungibleResourceAddress,
  StateVersion,
} from '../../schemas';

class CurrentTickNotDefinedError extends Data.TaggedError(
  'CurrentTickNotDefinedError',
)<{ message: string }> {}

export class QuantaSwapState extends Effect.Service<QuantaSwapState>()(
  'QuantaSwapState',
  {
    dependencies: [
      GetComponentEntityDetails.Default,
      GetQuantaSwapBinMapService.Default,
    ],
    effect: Effect.gen(function* () {
      const getComponentEntityDetails = yield* GetComponentEntityDetails;
      const getQuantaSwapBinMapService = yield* GetQuantaSwapBinMapService;

      const lowerPriceBound = yield* Config.number(
        'QUANTA_SWAP_LOWER_PRICE_BOUND',
      ).pipe(Config.withDefault(0.7));

      const upperPriceBound = yield* Config.number(
        'QUANTA_SWAP_UPPER_PRICE_BOUND',
      ).pipe(Config.withDefault(1.3));

      const QUANTA_SWAP_CACHE_TIME_TO_LIVE = yield* Config.duration(
        'QUANTA_SWAP_CACHE_TIME_TO_LIVE',
      ).pipe(Config.withDefault(Duration.minutes(15)));

      const QUANTA_SWAP_CACHE_CAPACITY = yield* Config.number(
        'QUANTA_SWAP_CACHE_CAPACITY',
      ).pipe(Config.withDefault(100));

      const cache = yield* Cache.make({
        capacity: QUANTA_SWAP_CACHE_CAPACITY,
        timeToLive: QUANTA_SWAP_CACHE_TIME_TO_LIVE,
        lookup: (key: `${ComponentAddress}:${StateVersion}`) =>
          Effect.gen(function* () {
            const [componentAddress, stateVersion] = key.split(':');
            return yield* getComponentState({
              componentAddress: ComponentAddress(componentAddress),
              stateVersion: StateVersion(Number(stateVersion)),
            });
          }),
      });

      const getComponentState = ({
        componentAddress,
        stateVersion,
      }: {
        componentAddress: ComponentAddress;
        stateVersion: StateVersion;
      }) =>
        Effect.gen(function* () {
          const [item] = yield* getComponentEntityDetails({
            componentAddresses: [componentAddress],
            at_ledger_state: { state_version: Number(stateVersion) },
          });
          const metadata = yield* Schema.decodeUnknown(
            QuantaSwapMetadataSchema,
          )(item.metadata);

          const state = yield* parseSbor(QuantaSwapSchema, item.componentState);

          const binMap = yield* getQuantaSwapBinMapService({
            address: state.bin_map,
            at_ledger_state: { state_version: Number(stateVersion) },
          });

          const binSpan = state.bin_span;
          const currentTick =
            state.tick_index.current.variant === 'Some'
              ? state.tick_index.current.value[0]
              : undefined;

          if (!currentTick) {
            return yield* new CurrentTickNotDefinedError({
              message: `current tick is not defined for component ${item.componentAddress} at state version ${stateVersion}`,
            });
          }

          const active_total_claim = new I192(state.active_total_claim);
          const active_x = new I192(state.active_x);
          const active_y = new I192(state.active_y);

          const middleTick = currentTick + Math.floor(binSpan / 2);
          const currentPrice = calculatePrice(middleTick);

          const lowerPrice = currentPrice.mul(lowerPriceBound);
          const upperPrice = currentPrice.mul(upperPriceBound);
          const lowerTick = calculateTick(lowerPrice);
          const upperTick = calculateTick(upperPrice);

          return {
            componentAddress: ComponentAddress(item.componentAddress),
            binMap,
            state,
            lowerTick,
            upperTick,
            currentTick,
            currentPrice,
            active_total_claim,
            active_x,
            active_y,
            xToken: FungibleResourceAddress(metadata.token_x),
            yToken: FungibleResourceAddress(metadata.token_y),
            liquidityReceipt: NonFungibleResourceAddress(
              metadata.liquidity_receipt,
            ),
          };
        });

      const getComponentStateFromCache = (input: {
        componentAddress: ComponentAddress;
        stateVersion: StateVersion;
      }) =>
        Effect.gen(function* () {
          return yield* cache.get(
            `${input.componentAddress}:${input.stateVersion}`,
          );
        });

      const parseLiquidityClaims = (input: {
        liquidityClaims: Map<number, string>[];
        componentState: Effect.Effect.Success<
          ReturnType<typeof getComponentStateFromCache>
        >;
      }) =>
        Effect.forEach(input.liquidityClaims, (liquidityClaims) =>
          Effect.gen(function* () {
            let isActive = false;

            const {
              lowerTick,
              upperTick,
              currentTick,
              active_total_claim,
              active_x,
              active_y,
              binMap,
              xToken,
              yToken,
            } = input.componentState;

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

              const bin = binMap.get(tick);
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
                const share = new I192(claimAmount).divide(active_total_claim);
                const amount_x = active_x.multiply(share);
                const amount_y = active_y.multiply(share);

                withinPriceBounds.amount_x =
                  withinPriceBounds.amount_x.add(amount_x);
                withinPriceBounds.amount_y =
                  withinPriceBounds.amount_y.add(amount_y);
              }
            }

            return {
              componentAddress: input.componentState.componentAddress,
              isActive,
              xToken: {
                withinPriceBounds: withinPriceBounds.amount_x.toString(),
                outsidePriceBounds: outsidePriceBounds.amount_x.toString(),
                resourceAddress: xToken,
              },
              yToken: {
                withinPriceBounds: withinPriceBounds.amount_y.toString(),
                outsidePriceBounds: outsidePriceBounds.amount_y.toString(),
                resourceAddress: yToken,
              },
            };
          }),
        );

      return {
        getComponentState: getComponentStateFromCache,
        parseLiquidityClaims,
      };
    }),
  },
) {}
