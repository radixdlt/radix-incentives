import BigNumber from 'bignumber.js';
import { ActivityId, Assets, SurgeConstants } from 'data';
import {
  Array as A,
  Data,
  Effect,
  flow,
  HashMap,
  Option,
  Record as R,
} from 'effect';
import { MarginPool } from '../../../../../common/dapps/surge/schemas';
import {
  GetComponentStateService,
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from '../../../../../common/gateway';
import { MarginAccountDbService } from '../../../../surge/marginAccountDbService';
import { GetUsdValueService } from '../../../../token-price/getUsdValue';
import { AccountBalanceState } from '../../accountBalanceState';
import { AccountBalanceHelper } from '../../helpers/accountBalanceHelper';
import {
  AccountAddress,
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
      AccountBalanceHelper.Default,
      MarginAccountDbService.Default,
    ],
    effect: Effect.gen(function* () {
      const getComponentStateService = yield* GetComponentStateService;
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      const getUsdValueService = yield* GetUsdValueService;
      const marginAccountDbService = yield* MarginAccountDbService;
      const accountBalanceHelper = yield* AccountBalanceHelper;

      return {
        fromState: (input: {
          addresses: AccountAddress[];
          stateVersion: StateVersion;
          timestamp: Date;
        }) =>
          Effect.gen(function* () {
            const marginAccountMappings =
              yield* marginAccountDbService.getMarginAccountsByCollateralAddresses(
                input.addresses,
                input.stateVersion,
              );

            const collateralAccountMap = R.fromIterableBy(
              marginAccountMappings,
              (item) => item.collateralAccountAddress,
            );

            const marginAccountAddresses = marginAccountMappings.map(
              (mapping) => AccountAddress(mapping.marginAccountAddress),
            );

            const marginAccountBalances =
              yield* accountBalanceHelper.getFungibleTokens({
                addresses: marginAccountAddresses,
                stateVersion: input.stateVersion,
              });

            const getMarginAccountBalanceMap = (
              accountAddress: AccountAddress,
            ) =>
              R.get(collateralAccountMap, accountAddress).pipe(
                Option.map((item) =>
                  marginAccountBalances.pipe(
                    HashMap.get(item.marginAccountAddress),
                  ),
                ),
                Option.flatten,
              );

            const getUsdAmount = (
              accountBalanceMap: HashMap.HashMap<
                FungibleResourceAddress,
                Amount
              >,
              resourceAddress: FungibleResourceAddress,
            ) =>
              accountBalanceMap.pipe(
                HashMap.get(resourceAddress),
                Option.match({
                  onNone: () => Effect.succeed(AmountUsd('0')),
                  onSome: (amount) =>
                    getUsdValueService({
                      amount,
                      resourceAddress,
                      timestamp: input.timestamp,
                    }).pipe(
                      Effect.map((usdValue) =>
                        AmountUsd(usdValue.decimalPlaces(2).toString()),
                      ),
                    ),
                }),
              );

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

            const getSurgeLiquidityPositions = (
              accountAddress: AccountAddress,
            ) =>
              Effect.gen(function* () {
                const usdValue = yield* getFungibleBalance(
                  accountAddress,
                  FungibleResourceAddress(SurgeConstants.slp.resourceAddress),
                ).pipe(
                  Option.match({
                    onNone: () => Effect.succeed(Amount('0')),
                    onSome: (amount) =>
                      Effect.succeed(slpToXusdcConverter(amount)),
                  }),
                  Effect.flatMap((amount) =>
                    getUsdValueService({
                      amount,
                      resourceAddress: Assets.Fungible.xUSDC,
                      timestamp: input.timestamp,
                    }),
                  ),
                  Effect.map((usdValue) =>
                    AmountUsd(usdValue.decimalPlaces(2).toString()),
                  ),
                );

                return {
                  [ActivityId.su_lp_sta_susd]: usdValue,
                };
              });

            const getSurgeMarginAccountPositions = (
              accountAddress: AccountAddress,
            ) =>
              Effect.gen(function* () {
                const accountBalanceMap =
                  getMarginAccountBalanceMap(accountAddress);

                if (Option.isNone(accountBalanceMap))
                  return A.reduce(
                    R.values(
                      SurgePosition.supportedMarginAccountResourceAddresses,
                    ),
                    R.empty<string, AmountUsd>(),
                    (acc, activityId) => R.set(acc, activityId, AmountUsd('0')),
                  );

                return yield* Effect.reduce(
                  R.toEntries(
                    SurgePosition.supportedMarginAccountResourceAddresses,
                  ),
                  R.empty<string, AmountUsd>(),
                  (acc, [resourceAddress, activityId]) =>
                    Effect.gen(function* () {
                      return R.set(
                        acc,
                        activityId,
                        yield* getUsdAmount(
                          accountBalanceMap.value,
                          resourceAddress,
                        ),
                      );
                    }),
                );
              });

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const liquidityPositions =
                    yield* getSurgeLiquidityPositions(accountAddress);

                  const marginAccountPositions =
                    yield* getSurgeMarginAccountPositions(accountAddress);

                  return R.set(acc, accountAddress, {
                    ...liquidityPositions,
                    ...marginAccountPositions,
                  });
                }),
            );
          }),
      };
    }),
  },
) {
  static supportedMarginAccountResourceAddresses = R.fromEntries([
    [FungibleResourceAddress(Assets.Fungible.XRD), ActivityId.su_ho_xrd],
    [FungibleResourceAddress(Assets.Fungible.LSULP), ActivityId.su_ho_lsulp],
  ]);
}
