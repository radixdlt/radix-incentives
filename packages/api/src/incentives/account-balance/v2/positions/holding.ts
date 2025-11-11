import { ActivityId, Assets } from 'data';
import { Effect, Option, Record as R } from 'effect';
import { GetLsulpValueService } from '../../../../common/dapps/caviarnine/getLsulpValue';
import { GetUsdValueService } from '../../../token-price/getUsdValue';
import { AccountBalanceState } from '../accountBalanceState';
import {
  type AccountAddress,
  AmountUsd,
  FungibleResourceAddress,
} from '../schemas';

export class HoldingPosition extends Effect.Service<HoldingPosition>()(
  'HoldingPosition',
  {
    dependencies: [GetLsulpValueService.Default, GetUsdValueService.Default],
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;

      const supportedResources = R.fromEntries([
        [FungibleResourceAddress(Assets.Fungible.XRD), ActivityId.ho_xrd],
        [FungibleResourceAddress(Assets.Fungible.LSULP), ActivityId.ho_lsulp],
      ]);

      return {
        fromState: (input: {
          addresses: AccountAddress[];
          stateVersion: number;
          timestamp: Date;
        }) =>
          Effect.gen(function* () {
            const getBalanceFromAccount =
              yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

            const getAmounts = (accountAddress: AccountAddress) =>
              Effect.reduce(
                R.toEntries(supportedResources),
                R.empty<string, AmountUsd>(),
                (acc, [resourceAddress, activityId]) =>
                  Effect.gen(function* () {
                    const amount = yield* getBalanceFromAccount(
                      accountAddress,
                      resourceAddress,
                    ).pipe(
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
                    return R.set(acc, activityId, amount);
                  }),
              );

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const amounts = yield* getAmounts(accountAddress);
                  return R.set(acc, accountAddress, amounts);
                }),
            );
          }),
      };
    }),
  },
) {}
