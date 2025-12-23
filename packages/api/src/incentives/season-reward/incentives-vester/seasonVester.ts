import BigNumber from 'bignumber.js';
import { Array as A, Data, Effect, flow, Option, Order, pipe } from 'effect';
import { NetworkId, type SeasonId } from 'shared/brandedTypes';
import { GetFungibleBalanceService } from '../../../common/gateway/getFungibleBalance';
import { GetResourcePoolUnitsService } from '../../../common/resource-pool/getResourcePoolUnits';
import {
  AccountAddress,
  Amount,
  ComponentAddress,
  FungibleResourceAddress,
  PoolAddress,
} from '../../account-balance/v2/schemas';
import { defaultAppConfig } from '../../config/appConfig';
import { SeasonService } from '../../season/season';
import { IncentivesVesterStateService } from './incentivesVester';

export class SeasonVesterNotConfiguredError extends Data.TaggedError(
  'SeasonVesterNotConfiguredError',
)<{
  message: string;
}> {}

export class SeasonVesterError extends Data.TaggedError('SeasonVesterError')<{
  message: string;
}> {}

export type AccountWithLabel = {
  address: AccountAddress;
  label: string | null;
};

export type RewardTokenBalance = {
  address: AccountAddress;
  balance: Amount;
  label: string | null;
};

export type SeasonVesterInfo = {
  poolUnitResourceAddress: FungibleResourceAddress;
  poolAddress: PoolAddress;
  currentValuePerUnit: Amount;
  maturityValuePerUnit: Amount;
  vestEndTimestamp: string | null;
};

const networkId = NetworkId.make(defaultAppConfig.networkId);

/**
 * Service that handles season vester operations including fetching vester info
 * and account balances from the gateway.
 */
export class SeasonVesterService extends Effect.Service<SeasonVesterService>()(
  'SeasonVesterService',
  {
    dependencies: [
      SeasonService.Default,
      IncentivesVesterStateService.Default,
      GetResourcePoolUnitsService.Default,
      GetFungibleBalanceService.Default,
    ],
    effect: Effect.gen(function* () {
      const seasonService = yield* SeasonService;
      const vesterStateService = yield* IncentivesVesterStateService;
      const getResourcePoolUnitsService = yield* GetResourcePoolUnitsService;
      const getFungibleBalanceService = yield* GetFungibleBalanceService;

      const getVesterInfo = Effect.fn(function* (seasonId: SeasonId) {
        const seasonConfig = yield* seasonService.getConfig(seasonId);

        if (seasonConfig.seasonRewardComponentAddress === null) {
          return yield* Effect.fail(
            new SeasonVesterNotConfiguredError({
              message: 'Season reward component address not configured.',
            }),
          );
        }

        const componentAddress = ComponentAddress(
          seasonConfig.seasonRewardComponentAddress,
        );

        // Get vester component state
        const vesterState = yield* vesterStateService({
          componentAddress,
          networkId,
        });

        const poolAddress = PoolAddress(vesterState.pool);

        // Handle Option type for vest_end
        const vestEndTimestamp =
          vesterState.vest_end.variant === 'Some'
            ? vesterState.vest_end.value
            : null;

        // Get pool unit info (LP token address and current value)
        const poolInfo = yield* getResourcePoolUnitsService({
          addresses: [poolAddress],
        }).pipe(
          Effect.map(
            flow(
              A.head,
              Option.getOrThrowWith(
                () =>
                  new SeasonVesterError({
                    message: 'Pool not found',
                  }),
              ),
            ),
          ),
        );

        const poolUnitResourceAddress = FungibleResourceAddress(
          poolInfo.lpResourceAddress,
        );

        // Get current value per unit (XRD per LP token)
        const currentValuePerUnit = pipe(
          A.head(poolInfo.poolResources),
          Option.map((r) => r.poolUnitValue),
          Option.getOrElse(() => new BigNumber(0)),
        );

        // Calculate maturity value per LP token
        // maturityValue = currentValue + (remainingToVest / totalLpSupply)
        const totalTokensToVest = new BigNumber(
          vesterState.total_tokens_to_vest,
        );
        const vestedTokens = new BigNumber(vesterState.vested_tokens);
        const remainingToVest = totalTokensToVest.minus(vestedTokens);
        const totalLpSupply = poolInfo.totalSupply;

        const maturityValuePerUnit = totalLpSupply.isGreaterThan(0)
          ? currentValuePerUnit.plus(remainingToVest.dividedBy(totalLpSupply))
          : currentValuePerUnit;

        return {
          poolUnitResourceAddress,
          poolAddress,
          currentValuePerUnit: Amount(currentValuePerUnit.toString()),
          maturityValuePerUnit: Amount(maturityValuePerUnit.toString()),
          vestEndTimestamp: vestEndTimestamp?.toISOString() ?? null,
        };
      });

      const getAccountBalances = Effect.fn(function* (input: {
        seasonId: SeasonId;
        accounts: readonly AccountWithLabel[];
      }) {
        if (input.accounts.length === 0) {
          return A.empty<RewardTokenBalance>();
        }

        const vesterInfo = yield* getVesterInfo(input.seasonId);

        const balances = yield* getFungibleBalanceService({
          addresses: input.accounts.map((a) => a.address),
        });

        // Return balances sorted by balance (descending) with labels
        return pipe(
          balances,
          A.map((account) => {
            const rewardTokenBalance = pipe(
              account.fungibleResources,
              A.findFirst(
                (r) => r.resourceAddress === vesterInfo.poolUnitResourceAddress,
              ),
            );

            return {
              address: AccountAddress(account.address),
              balance: pipe(
                rewardTokenBalance,
                Option.map((r) => Amount(r.amount.toString())),
                Option.getOrElse(() => Amount('0')),
              ),
              label: pipe(
                input.accounts,
                A.findFirst(
                  (a) => a.address === AccountAddress(account.address),
                ),
                Option.match({
                  onNone: () => null,
                  onSome: (a) => a.label,
                }),
              ),
            };
          }),
          A.sort(
            Order.reverse(
              Order.mapInput(Order.number, (item: RewardTokenBalance) =>
                Number(item.balance),
              ),
            ),
          ),
        );
      });

      return {
        getVesterInfo,
        getAccountBalances,
      };
    }),
  },
) {}
