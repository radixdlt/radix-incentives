import { Assets } from 'data';
import { Effect } from 'effect';
import { reduce } from 'effect/Effect';
import { GetLsulpValueService } from '../../../../common/dapps/caviarnine/getLsulpValue';
import { GetUsdValueService } from '../../../token-price/getUsdValue';
import { AccountBalanceState } from '../accountBalanceState';
import { AccountAddress, AmountUsd, FungibleResourceAddress } from '../schemas';
import { PositionKey } from './types';

export type LsuLpPositionOutput = Effect.Effect.Success<
  ReturnType<(typeof LsuLpPosition.Service)['fromState']>
>;

export class LsuLpPosition extends Effect.Service<LsuLpPosition>()(
  'LsuLpPosition',
  {
    dependencies: [GetLsulpValueService.Default, GetUsdValueService.Default],
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;
      const lsulpResourceAddress = FungibleResourceAddress(
        Assets.Fungible.LSULP,
      );
      return {
        fromState: Effect.fnUntraced(function* (input: {
          addresses: AccountAddress[];
          stateVersion: number;
          timestamp: Date;
        }) {
          const getBalance =
            yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

          return yield* reduce(
            input.addresses,
            {} as Record<AccountAddress, { [PositionKey.lsulp]: AmountUsd }>,
            (acc, address) =>
              Effect.gen(function* () {
                const amountUsd = yield* getBalance(
                  address,
                  lsulpResourceAddress,
                ).pipe(
                  Effect.flatMap((amount) =>
                    getUsdValueService({
                      amount,
                      resourceAddress: lsulpResourceAddress,
                      timestamp: input.timestamp,
                    }),
                  ),
                  Effect.map((value) =>
                    AmountUsd(value.decimalPlaces(2).toString()),
                  ),
                );

                acc[AccountAddress(address)] = {
                  [PositionKey.lsulp]: amountUsd,
                };

                return acc;
              }),
          );
        }),
      };
    }),
  },
) {}
