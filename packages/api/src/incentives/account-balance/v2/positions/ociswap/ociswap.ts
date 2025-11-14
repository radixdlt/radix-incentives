import BigNumber from 'bignumber.js';
import { DappId, OciswapConstants } from 'data';
import { Array as A, Effect, flow, Record as R } from 'effect';
import { LiquidityPosition } from '../../../../../common/dapps/ociswap/schemas';
import {
  AggregatePoolPositionsService,
  type LpPosition,
} from '../../../aggregatePoolPositions';
import { AccountBalanceState } from '../../accountBalanceState';
import {
  type AccountAddress,
  AmountUsd,
  ComponentAddress,
  FungibleResourceAddress,
  NonFungibleResourceAddress,
  StateVersion,
} from '../../schemas';
import { PrecisionPoolState } from './precisionPoolState';

const v1PrecisionPools = Object.values(OciswapConstants.pools);
const v2PrecisionPools = Object.values(OciswapConstants.poolsV2);
const precisionPools = [...v1PrecisionPools, ...v2PrecisionPools];
const precisionPoolNftResourceAddresses = precisionPools.map((pool) =>
  NonFungibleResourceAddress(pool.lpResourceAddress),
);

export class OciswapPosition extends Effect.Service<OciswapPosition>()(
  'OciswapPosition',
  {
    dependencies: [
      PrecisionPoolState.Default,
      AggregatePoolPositionsService.Default,
    ],
    effect: Effect.gen(function* () {
      const precisionPoolState = yield* PrecisionPoolState;
      const aggregatePoolPositionsService =
        yield* AggregatePoolPositionsService;

      const aggregatePositions = (input: {
        positions: LpPosition[];
        timestamp: Date;
      }) =>
        aggregatePoolPositionsService
          .aggregate({
            positions: input.positions,
            dAppId: DappId.ociswap,
            timestamp: input.timestamp,
          })
          .pipe(
            Effect.map((positions) =>
              A.reduce(
                positions,
                R.empty<string, AmountUsd>(),
                (acc, position) =>
                  R.set(
                    acc,
                    position.activityId,
                    AmountUsd(
                      new BigNumber(position.usdValue)
                        .decimalPlaces(2)
                        .toString(),
                    ),
                  ),
              ),
            ),
          );

      return {
        fromState: (input: {
          addresses: AccountAddress[];
          stateVersion: StateVersion;
          timestamp: Date;
        }) =>
          Effect.gen(function* () {
            const stateVersion = StateVersion(input.stateVersion);
            const timestamp = input.timestamp;
            const getNftCollection =
              yield* AccountBalanceState.createGetNftCollectionFn;
            const _getFungibleBalance =
              yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

            const getPrecisionPoolPositions = (input: {
              accountAddress: AccountAddress;
            }) =>
              Effect.forEach(precisionPools, (pool) =>
                Effect.gen(function* () {
                  const componentAddress = ComponentAddress(
                    pool.componentAddress,
                  );
                  const liquidityReceiptResourceAddress =
                    NonFungibleResourceAddress(pool.lpResourceAddress);

                  const liquidityPositions = yield* getNftCollection(
                    input.accountAddress,
                    liquidityReceiptResourceAddress,
                    LiquidityPosition,
                  );

                  if (liquidityPositions.length === 0) return [];

                  return yield* precisionPoolState.parseLiquidityPositions({
                    componentAddress,
                    stateVersion,
                    liquidityPositions,
                    tokenXDivisibility: pool.divisibility_x,
                    tokenYDivisibility: pool.divisibility_y,
                    tokenXAddress: FungibleResourceAddress(pool.token_x),
                    tokenYAddress: FungibleResourceAddress(pool.token_y),
                  });
                }),
              ).pipe(
                Effect.map(
                  flow(
                    A.flatten,
                    A.filter((item) => !!item),
                  ),
                ),
              );

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const precisionPoolPositions =
                    yield* getPrecisionPoolPositions({
                      accountAddress,
                    });

                  const aggregatedPositions = yield* aggregatePositions({
                    positions: [...precisionPoolPositions],
                    timestamp,
                  });

                  return R.set(acc, accountAddress, aggregatedPositions);
                }),
            );
          }),
      };
    }),
  },
) {
  static readonly nftResourceAddresses = precisionPoolNftResourceAddresses;
}
