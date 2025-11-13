import BigNumber from 'bignumber.js';
import { ActivityId, Assets, SurgeConstants } from 'data';
import { Array as A, Data, Effect, flow, Option, Record as R } from 'effect';
import { MarginPool } from '../../../../../common/dapps/surge/schemas';
import {
  GetComponentStateService,
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from '../../../../../common/gateway';
import { GetUsdValueService } from '../../../../token-price/getUsdValue';
import { AccountBalanceState } from '../../accountBalanceState';
import {
  type AccountAddress,
  Amount,
  AmountUsd,
  ComponentAddress,
  FungibleResourceAddress,
  type StateVersion,
} from '../../schemas';

class NotFoundError extends Data.TaggedError('NotFoundError')<{
  message: string;
}> {}

class InvalidTypeError extends Data.TaggedError('InvalidTypeError')<{
  message: string;
}> {}

export class SurgePosition extends Effect.Service<SurgePosition>()(
  'SurgePosition',
  {
    dependencies: [
      GetComponentStateService.Default,
      GetFungibleBalanceService.Default,
      GetUsdValueService.Default,
    ],
    effect: Effect.gen(function* () {
      const getComponentStateService = yield* GetComponentStateService;
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      const getUsdValueService = yield* GetUsdValueService;

      return {
        fromState: (input: {
          addresses: AccountAddress[];
          stateVersion: StateVersion;
          timestamp: Date;
        }) =>
          Effect.gen(function* () {
            const getFungibleBalance =
              yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

            const slpResourceAddress = FungibleResourceAddress(
              SurgeConstants.slp.resourceAddress,
            );
            const marginPoolComponentAddress = ComponentAddress(
              SurgeConstants.marginPool.componentAddress,
            );

            // Get margin pool component state
            const marginPoolComponentState = yield* getComponentStateService
              .run({
                addresses: [SurgeConstants.marginPool.componentAddress],
                schema: MarginPool,
                at_ledger_state: {
                  state_version: input.stateVersion,
                },
              })
              .pipe(
                Effect.map(
                  flow(
                    A.head,
                    Option.match({
                      onNone: () => ({
                        virtualBalance: Amount('0'),
                        unrealizedPoolFunding: Amount('0'),
                        pnlSnap: Amount('0'),
                      }),
                      onSome: (i) => ({
                        virtualBalance: Amount(i.state.virtual_balance),
                        unrealizedPoolFunding: Amount(
                          i.state.unrealized_pool_funding,
                        ),
                        pnlSnap: Amount(i.state.pnl_snap),
                      }),
                    }),
                  ),
                ),
              );

            const slpToXusdcConverter = yield* getFungibleBalanceService({
              addresses: [
                slpResourceAddress, // For total supply
                marginPoolComponentAddress, // For sUSD balance
              ],
              at_ledger_state: {
                state_version: input.stateVersion,
              },
            }).pipe(
              Effect.map(
                flow(
                  A.reduce(
                    R.empty<
                      FungibleResourceAddress | ComponentAddress,
                      GetFungibleBalanceOutput[number]
                    >(),
                    (acc, item) => R.set(acc, item.address, item),
                  ),
                ),
              ),
              Effect.flatMap((result) =>
                Effect.gen(function* () {
                  const slpTotalSupply = yield* R.get(
                    result,
                    slpResourceAddress,
                  ).pipe(
                    Option.map((item) => Option.fromNullable(item.details)),
                    Option.flatten,
                    Option.match({
                      onNone: () =>
                        Effect.fail(
                          new NotFoundError({
                            message: 'SLP resource not found',
                          }),
                        ),
                      onSome: (item) =>
                        Effect.gen(function* () {
                          if (item.type !== 'FungibleResource') {
                            return yield* new InvalidTypeError({
                              message: 'SLP resource has invalid type',
                            });
                          }
                          return new BigNumber(item.total_supply);
                        }),
                    }),
                  );

                  const sUsdAmount = yield* R.get(
                    result,
                    marginPoolComponentAddress,
                  ).pipe(
                    Option.match({
                      onNone: () =>
                        Effect.fail(
                          new NotFoundError({
                            message: 'Margin pool not found',
                          }),
                        ),
                      onSome: (item) =>
                        Effect.gen(function* () {
                          if (item.details?.type !== 'Component') {
                            return yield* new InvalidTypeError({
                              message: 'Margin pool has invalid type',
                            });
                          }
                          return A.findFirst(
                            item.fungibleResources,
                            (item) =>
                              item.resourceAddress ===
                              SurgeConstants.sUSD.resourceAddress,
                          ).pipe(
                            Option.map((item) =>
                              Amount(item.amount.toString()),
                            ),
                            Option.getOrElse(() => Amount('0')),
                          );
                        }),
                    }),
                  );

                  // Calculate pool value in xUSDC
                  const poolValueXUsdc = new BigNumber(sUsdAmount)
                    .plus(marginPoolComponentState.virtualBalance)
                    .plus(marginPoolComponentState.unrealizedPoolFunding)
                    .plus(marginPoolComponentState.pnlSnap);

                  // Calculate xUSDC value of 1 SLP
                  const slpValueXUsdc = slpTotalSupply.isZero()
                    ? new BigNumber(0)
                    : poolValueXUsdc.dividedBy(slpTotalSupply);

                  return (amount: Amount) =>
                    Amount(slpValueXUsdc.multipliedBy(amount).toString());
                }),
              ),
            );

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const slpAmount = getFungibleBalance(
                    accountAddress,
                    FungibleResourceAddress(SurgeConstants.slp.resourceAddress),
                  ).pipe(Option.getOrElse(() => Amount('0')));

                  const xusdcAmount = slpToXusdcConverter(slpAmount);

                  const usdValue = yield* getUsdValueService({
                    amount: xusdcAmount,
                    resourceAddress: Assets.Fungible.xUSDC,
                    timestamp: input.timestamp,
                  }).pipe(
                    Effect.map((usdValue) =>
                      AmountUsd(usdValue.decimalPlaces(2).toString()),
                    ),
                  );

                  return R.set(acc, accountAddress, {
                    [ActivityId.su_lp_sta_susd]: usdValue,
                  });
                }),
            );
          }),
      };
    }),
  },
) {}
