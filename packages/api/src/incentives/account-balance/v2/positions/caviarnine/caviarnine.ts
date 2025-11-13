import BigNumber from 'bignumber.js';
import { CaviarNineConstants, DappId } from 'data';
import { Array as A, Effect, flow, Option, Record as R } from 'effect';
import s from 'sbor-ez-mode';
import {
  AggregatePoolPositionsService,
  type LpPosition,
} from '../../../aggregatePoolPositions';
import { AccountBalanceState } from '../../accountBalanceState';
import { PoolUnitHelper } from '../../helpers/poolUnit';
import {
  type AccountAddress,
  AmountUsd,
  ComponentAddress,
  FungibleResourceAddress,
  NonFungibleResourceAddress,
  PoolAddress,
  StateVersion,
} from '../../schemas';
import { QuantaSwapState } from './quantaSwapState';

const shapeLiquidityPools = Object.values(
  CaviarNineConstants.shapeLiquidityPools,
);

const simplePools = Object.values(CaviarNineConstants.simplePools);

const shapeLiquidityPoolLiquidityReceipts = shapeLiquidityPools.map((pool) =>
  NonFungibleResourceAddress(pool.liquidity_receipt),
);

const liquidityReceiptSchema = s.struct({
  liquidity_claims: s.map({
    key: s.number(),
    value: s.decimal(),
  }),
});

export class CaviarNinePositions extends Effect.Service<CaviarNinePositions>()(
  'CaviarNinePositions',
  {
    dependencies: [
      QuantaSwapState.Default,
      AggregatePoolPositionsService.Default,
      PoolUnitHelper.Default,
    ],
    effect: Effect.gen(function* () {
      // QuantaSwapComponent.fromComponentEntityDetails()
      const quantaSwapState = yield* QuantaSwapState;
      const aggregatePoolPositionsService =
        yield* AggregatePoolPositionsService;
      const poolUnitHelper = yield* PoolUnitHelper;

      const aggregatePositions = (input: {
        positions: LpPosition[];
        timestamp: Date;
      }) =>
        aggregatePoolPositionsService
          .aggregate({
            positions: input.positions,
            dAppId: DappId.caviarnine,
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
          stateVersion: number;
          timestamp: Date;
        }) =>
          Effect.gen(function* () {
            const stateVersion = StateVersion(input.stateVersion);
            const timestamp = input.timestamp;
            const getNftCollection =
              yield* AccountBalanceState.createGetNftCollectionFn;
            const getFungibleBalance =
              yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

            const getShapeLiquidityPositions = (input: {
              accountAddress: AccountAddress;
            }) =>
              Effect.forEach(shapeLiquidityPools, (pool) =>
                Effect.gen(function* () {
                  const componentAddress = ComponentAddress(
                    pool.componentAddress,
                  );
                  const liquidityReceiptResourceAddress =
                    NonFungibleResourceAddress(pool.liquidity_receipt);

                  const liquidityClaims = yield* getNftCollection(
                    input.accountAddress,
                    liquidityReceiptResourceAddress,
                    liquidityReceiptSchema,
                  ).pipe(
                    Effect.map((items) =>
                      items.map((item) => item.liquidity_claims),
                    ),
                  );

                  if (liquidityClaims.length === 0) return;

                  const componentState =
                    yield* quantaSwapState.getComponentState({
                      componentAddress,
                      stateVersion,
                    });

                  return yield* quantaSwapState.parseLiquidityClaims({
                    liquidityClaims,
                    componentState,
                  });
                }),
              ).pipe(
                Effect.map(
                  flow(
                    A.filter((item) => !!item),
                    A.flatten,
                  ),
                ),
              );

            const getSimplePoolPositions = (input: {
              accountAddress: AccountAddress;
            }) =>
              Effect.forEach(simplePools, (pool) =>
                Effect.gen(function* () {
                  const xTokenAddress = FungibleResourceAddress(pool.token_x);
                  const yTokenAddress = FungibleResourceAddress(pool.token_y);
                  const poolAddress = PoolAddress(pool.poolAddress);
                  const componentAddress = ComponentAddress(
                    pool.componentAddress,
                  );
                  const lpTokenAddress = FungibleResourceAddress(
                    pool.lpResourceAddress,
                  );

                  const poolUnits = getFungibleBalance(
                    input.accountAddress,
                    lpTokenAddress,
                  );
                  if (Option.isNone(poolUnits)) return;

                  const { xTokenAmount, yTokenAmount } =
                    yield* poolUnitHelper.resolve({
                      poolAddress,
                      stateVersion,
                      xToken: xTokenAddress,
                      yToken: yTokenAddress,
                      lpToken: poolUnits.value,
                    });

                  return {
                    componentAddress,
                    isActive: true,
                    xToken: {
                      withinPriceBounds: xTokenAmount, // For simple pools, all liquidity is "within bounds"
                      outsidePriceBounds: '0', // Simple pools don't have concentrated liquidity
                      resourceAddress: xTokenAddress,
                    },
                    yToken: {
                      withinPriceBounds: yTokenAmount, // For simple pools, all liquidity is "within bounds"
                      outsidePriceBounds: '0', // Simple pools don't have concentrated liquidity
                      resourceAddress: yTokenAddress,
                    },
                  };
                }),
              ).pipe(Effect.map(A.filter((item) => !!item)));

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const shapeLiquidityPositions =
                    yield* getShapeLiquidityPositions({ accountAddress });

                  const simplePoolPositions = yield* getSimplePoolPositions({
                    accountAddress,
                  });

                  const aggregatedPositions = yield* aggregatePositions({
                    positions: [
                      ...shapeLiquidityPositions,
                      ...simplePoolPositions,
                    ],
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
  static readonly nonFungibleResourceAddresses =
    shapeLiquidityPoolLiquidityReceipts;
}
