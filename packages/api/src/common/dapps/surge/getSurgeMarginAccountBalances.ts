import { Effect } from 'effect';
import { GetFungibleBalanceService } from '../../gateway/getFungibleBalance';
import type { AtLedgerState } from '../../gateway/schemas';

export type SurgeMarginAccountBalance = {
  marginAccountAddress: string;
  collateralAccountAddress: string;
  fungibleResources: {
    resourceAddress: string;
    amount: BigNumber;
    lastUpdatedStateVersion: number;
  }[];
};

export type GetSurgeMarginAccountBalancesOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof GetSurgeMarginAccountBalancesService)['Service']>>
>;

export class GetSurgeMarginAccountBalancesService extends Effect.Service<GetSurgeMarginAccountBalancesService>()(
  'GetSurgeMarginAccountBalancesService',
  {
    dependencies: [GetFungibleBalanceService.Default],
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;

      return Effect.fn('getSurgeMarginAccountBalancesService')(
        function* (input: {
          marginAccountMappings: Array<{
            marginAccountAddress: string;
            collateralAccountAddress: string;
          }>;
          at_ledger_state: AtLedgerState;
        }) {
          if (input.marginAccountMappings.length === 0) {
            return [];
          }

          const addresses = input.marginAccountMappings.map(
            (mapping) => mapping.marginAccountAddress,
          );

          // Use the existing GetFungibleBalanceService to get balances for margin account components
          const fungibleBalanceResults = yield* getFungibleBalanceService({
            addresses,
            at_ledger_state: input.at_ledger_state,
          });

          // Create a mapping from margin account address to collateral account address
          const marginToCollateralMap = new Map(
            input.marginAccountMappings.map((mapping) => [
              mapping.marginAccountAddress,
              mapping.collateralAccountAddress,
            ]),
          );

          // Transform the results to include collateral account address mapping
          const surgeMarginAccountBalances: SurgeMarginAccountBalance[] =
            fungibleBalanceResults
              .map((result) => {
                const collateralAccountAddress = marginToCollateralMap.get(
                  result.address,
                );
                if (!collateralAccountAddress) {
                  return null;
                }

                return {
                  marginAccountAddress: result.address,
                  collateralAccountAddress,
                  fungibleResources: result.fungibleResources,
                } satisfies SurgeMarginAccountBalance;
              })
              .filter(
                (result) => result !== null,
              ) as SurgeMarginAccountBalance[];

          return surgeMarginAccountBalances;
        },
      );
    }),
  },
) {}

export const GetSurgeMarginAccountBalancesServiceLive =
  GetSurgeMarginAccountBalancesService.Default;
