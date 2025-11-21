import BigNumber from 'bignumber.js';
import { DappId, DefiPlazaConstants } from 'data';
import { Array as A, Effect, Option, Record as R } from 'effect';
import {
  AggregatePoolPositionsService,
  type LpPosition,
} from '../../../aggregatePoolPositions';
import { AccountBalanceState } from '../../accountBalanceState';
import { PoolUnitHelper } from '../../helpers/poolUnit';
import {
  type AccountAddress,
  Amount,
  AmountUsd,
  ComponentAddress,
  FungibleResourceAddress,
  PoolAddress,
  StateVersion,
} from '../../schemas';

const defiPlazaPools = Object.values(DefiPlazaConstants);

export class DefiPlazaPosition extends Effect.Service<DefiPlazaPosition>()(
  'DefiPlazaPosition',
  {
    dependencies: [
      AggregatePoolPositionsService.Default,
      PoolUnitHelper.Default,
    ],
    effect: Effect.gen(function* () {
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
            dAppId: DappId.defiPlaza,
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

            const getFungibleBalance =
              yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

            const getResourcePoolPositions = (input: {
              accountAddress: AccountAddress;
            }) =>
              Effect.forEach(defiPlazaPools, (pool) =>
                Effect.gen(function* () {
                  const xTokenAddress = FungibleResourceAddress(
                    pool.baseResourceAddress,
                  );
                  const yTokenAddress = FungibleResourceAddress(
                    pool.quoteResourceAddress,
                  );
                  const basePoolAddress = PoolAddress(pool.basePoolAddress);
                  const quotePoolAddress = PoolAddress(pool.quotePoolAddress);

                  const componentAddress = ComponentAddress(
                    pool.componentAddress,
                  );
                  const baseLpTokenAddress = FungibleResourceAddress(
                    pool.baseLpResourceAddress,
                  );
                  const quoteLpTokenAddress = FungibleResourceAddress(
                    pool.quoteLpResourceAddress,
                  );

                  const basePoolUnits = getFungibleBalance(
                    input.accountAddress,
                    baseLpTokenAddress,
                  );
                  const quotePoolUnits = getFungibleBalance(
                    input.accountAddress,
                    quoteLpTokenAddress,
                  );

                  if (
                    Option.isNone(basePoolUnits) &&
                    Option.isNone(quotePoolUnits)
                  )
                    return;

                  const basePoolUnitsAmount = Option.getOrElse(
                    basePoolUnits,
                    () => Amount('0'),
                  );

                  const {
                    xTokenAmount: basePoolXTokenAmount,
                    yTokenAmount: basePoolYTokenAmount,
                  } = yield* poolUnitHelper.resolve({
                    poolAddress: basePoolAddress,
                    stateVersion,
                    xToken: xTokenAddress,
                    yToken: yTokenAddress,
                    lpToken: basePoolUnitsAmount,
                  });

                  const quotePoolUnitsAmount = Option.getOrElse(
                    quotePoolUnits,
                    () => Amount('0'),
                  );

                  const {
                    xTokenAmount: quotePoolXTokenAmount,
                    yTokenAmount: quotePoolYTokenAmount,
                  } = yield* poolUnitHelper.resolve({
                    poolAddress: quotePoolAddress,
                    stateVersion,
                    xToken: xTokenAddress,
                    yToken: yTokenAddress,
                    lpToken: quotePoolUnitsAmount,
                  });

                  const xTokenAmount = Amount(
                    new BigNumber(basePoolXTokenAmount)
                      .plus(quotePoolXTokenAmount)
                      .toString(),
                  );
                  const yTokenAmount = Amount(
                    new BigNumber(basePoolYTokenAmount)
                      .plus(quotePoolYTokenAmount)
                      .toString(),
                  );

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
                  const resourcePoolPositions = yield* getResourcePoolPositions(
                    {
                      accountAddress,
                    },
                  );

                  const aggregatedPositions = yield* aggregatePositions({
                    positions: resourcePoolPositions,
                    timestamp,
                  });

                  return R.set(acc, accountAddress, aggregatedPositions);
                }),
            );
          }),
      };
    }),
  },
) {}
