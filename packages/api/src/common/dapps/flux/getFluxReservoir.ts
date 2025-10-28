import { BigNumber } from 'bignumber.js';
import { DappConstants } from 'data';
import { Data, Effect } from 'effect';
import { GatewayApiClientService } from '../../gateway/gatewayApiClient';
import { GetEntityDetailsService } from '../../gateway/getEntityDetails';
import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from '../../gateway/getFungibleBalance';
import type { AtLedgerState } from '../../gateway/schemas';

const FluxConstants = DappConstants.Flux.constants;

export class FluxReservoirNotFoundError extends Data.TaggedError(
  'FluxReservoirNotFoundError',
)<{
  readonly error: unknown;
}> {}

export class InvalidCollateralAddressError extends Data.TaggedError(
  'InvalidCollateralAddressError',
)<{
  readonly error: unknown;
}> {}

export type FluxReservoirPosition = {
  collateralAddress: string;
  userPoolTokenBalance: BigNumber;
  userPoolTokenValue: {
    collateral: BigNumber;
    fusd: BigNumber;
  };
  totalPoolTokens: BigNumber;
  poolTokenValue: {
    collateral: BigNumber;
    fusd: BigNumber;
  };
};

export type GetFluxReservoirOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof GetFluxReservoirService)['Service']>>
>;

export class GetFluxReservoirService extends Effect.Service<GetFluxReservoirService>()(
  'GetFluxReservoirService',
  {
    dependencies: [
      GetFungibleBalanceService.Default,
      GatewayApiClientService.Default,
      GetEntityDetailsService.Default,
    ],
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      const gatewayClient = yield* GatewayApiClientService;

      return Effect.fn(function* (input: {
        accountAddresses: string[];
        at_ledger_state: AtLedgerState;
        fungibleBalance?: GetFungibleBalanceOutput;
      }) {
        const collateralsToCheck = [
          FluxConstants.collaterals.xrd,
          FluxConstants.collaterals.lsulp,
        ];

        // Get all user balances in one call
        const userBalancesResult =
          input.fungibleBalance ??
          (yield* getFungibleBalanceService({
            addresses: input.accountAddresses,
            at_ledger_state: input.at_ledger_state,
          }));

        // Pre-fetch pool data for each collateral
        const poolData = yield* Effect.forEach(
          collateralsToCheck,
          (collateral) =>
            Effect.gen(function* () {
              const poolTokenResponse =
                yield* gatewayClient.state.innerClient.stateEntityDetails({
                  stateEntityDetailsRequest: {
                    addresses: [collateral.stabilityPoolTokenAddress],
                    at_ledger_state: input.at_ledger_state,
                    aggregation_level: 'Global',
                  },
                });

              const poolTokenEntity = poolTokenResponse.items[0];
              if (
                !poolTokenEntity?.details ||
                poolTokenEntity.details.type !== 'FungibleResource'
              ) {
                return null;
              }

              const totalPoolTokens = new BigNumber(
                poolTokenEntity.details.total_supply,
              );

              const poolResponse =
                yield* gatewayClient.state.innerClient.stateEntityDetails({
                  stateEntityDetailsRequest: {
                    addresses: [collateral.stabilityPoolAddress],
                    at_ledger_state: input.at_ledger_state,
                    aggregation_level: 'Global',
                  },
                });

              const poolEntity = poolResponse.items[0];
              if (!poolEntity?.fungible_resources?.items) {
                return null;
              }

              let fusdInPool = new BigNumber(0);
              let collateralInPool = new BigNumber(0);

              for (const resource of poolEntity.fungible_resources.items) {
                if (resource.aggregation_level === 'Global') {
                  if (
                    resource.resource_address ===
                    FluxConstants.fusdResourceAddress
                  ) {
                    fusdInPool = new BigNumber(resource.amount);
                  } else if (
                    resource.resource_address === collateral.collateralAddress
                  ) {
                    collateralInPool = new BigNumber(resource.amount);
                  }
                }
              }

              const fusdPerPoolUnit = totalPoolTokens.gt(0)
                ? fusdInPool.dividedBy(totalPoolTokens)
                : new BigNumber(0);
              const collateralPerPoolUnit = totalPoolTokens.gt(0)
                ? collateralInPool.dividedBy(totalPoolTokens)
                : new BigNumber(0);

              return {
                collateral,
                totalPoolTokens,
                poolTokenValue: {
                  collateral: collateralPerPoolUnit,
                  fusd: fusdPerPoolUnit,
                },
              };
            }),
        );

        // Create a Map of account addresses to user balances to avoid nested loops
        const userBalancesMap = new Map(
          userBalancesResult.map((account) => [account.address, account]),
        );

        return input.accountAddresses.map((accountAddress) => {
          const userAccount = userBalancesMap.get(accountAddress);

          // Create a Map of resource addresses to amounts for this account
          const userResourcesMap = new Map(
            userAccount?.fungibleResources.map((resource) => [
              resource.resourceAddress,
              resource.amount,
            ]) ?? [],
          );

          const reservoirPositions = poolData
            .filter((poolDataItem) => poolDataItem !== null)
            .map((poolDataItem) => {
              const { collateral, totalPoolTokens, poolTokenValue } =
                poolDataItem;

              const userPoolTokenBalance =
                userResourcesMap.get(collateral.stabilityPoolTokenAddress) ||
                new BigNumber(0);

              const userPoolTokenValue = {
                collateral: userPoolTokenBalance.multipliedBy(
                  poolTokenValue.collateral,
                ),
                fusd: userPoolTokenBalance.multipliedBy(poolTokenValue.fusd),
              };

              return {
                collateralAddress: collateral.collateralAddress,
                userPoolTokenBalance,
                userPoolTokenValue,
                totalPoolTokens,
                poolTokenValue,
              };
            });

          return {
            accountAddress,
            reservoirPositions,
          };
        });
      });
    }),
  },
) {}
