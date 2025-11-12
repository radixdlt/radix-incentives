import BigNumber from 'bignumber.js';
import { CaviarNineConstants, DappId } from 'data';
import { Array as A, Effect, flow, Record as R } from 'effect';
import s from 'sbor-ez-mode';
import {
  AggregatePoolPositionsService,
  type LpPosition,
} from '../../../aggregatePoolPositions';
import { AccountBalanceState } from '../../accountBalanceState';
import {
  type AccountAddress,
  AmountUsd,
  ComponentAddress,
  NonFungibleResourceAddress,
  StateVersion,
} from '../../schemas';
import { QuantaSwapState } from './quantaSwapState';

const shapeLiquidityPools = Object.values(
  CaviarNineConstants.shapeLiquidityPools,
);

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
    ],
    effect: Effect.gen(function* () {
      // QuantaSwapComponent.fromComponentEntityDetails()
      const quantaSwapState = yield* QuantaSwapState;
      const aggregatePoolPositionsService =
        yield* AggregatePoolPositionsService;

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

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const shapeLiquidityPositions =
                    yield* getShapeLiquidityPositions({ accountAddress });

                  const aggregatedPositions = yield* aggregatePositions({
                    positions: shapeLiquidityPositions,
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
