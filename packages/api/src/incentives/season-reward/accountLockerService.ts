import { Array as A, Effect, Option, pipe } from 'effect';
import type { SeasonId, UserId } from 'shared/brandedTypes';
import { GatewayApiClientService } from '../../common/gateway';
import { SeasonVesterService } from './incentives-vester/seasonVester';
import { SeasonRewardService } from './seasonReward';

export type LockerBalance = {
  accountAddress: string;
  balance: string;
};

/**
 * Service for checking account locker balances for season reward claims.
 * When a user has third-party deposits disabled, claimed tokens go to an account locker.
 * This service helps identify and retrieve those tokens.
 */
export class AccountLockerService extends Effect.Service<AccountLockerService>()(
  'AccountLockerService',
  {
    dependencies: [
      SeasonVesterService.Default,
      SeasonRewardService.Default,
      GatewayApiClientService.Default,
    ],
    effect: Effect.gen(function* () {
      const vesterService = yield* SeasonVesterService;
      const seasonRewardService = yield* SeasonRewardService;
      const gatewayApiClient = yield* GatewayApiClientService;

      /**
       * Gets the locker balances for accounts that received tokens via locker deposits.
       * This checks all successful claims for the user/season, determines which went to locker,
       * and returns accounts with remaining balances in the locker.
       */
      const getLockerBalances = Effect.fn(function* (input: {
        seasonId: SeasonId;
        userId: UserId;
      }) {
        // Get vester info for locker address and pool unit resource
        const vesterInfo = yield* vesterService.getVesterInfo({
          seasonId: input.seasonId,
        });

        const { lockerAddress, poolUnitResourceAddress } = vesterInfo;

        // Get all successful claims for this user/season
        const claims = yield* seasonRewardService.getUserSeasonRewardClaims({
          userId: input.userId,
          seasonId: input.seasonId,
        });

        const successfulClaims = claims.filter(
          (claim) => claim.status === 'success',
        );

        if (successfulClaims.length === 0) {
          return A.empty<LockerBalance>();
        }

        // Check which claims went to locker by looking at transaction details
        const claimsWithLockerStatus = yield* Effect.forEach(
          successfulClaims,
          (claim) =>
            Effect.gen(function* () {
              const details = yield* gatewayApiClient.transaction
                .getCommittedDetails(claim.transactionId)
                .pipe(Effect.orDie);

              const affectedEntities = pipe(
                Option.fromNullable(
                  details.transaction?.affected_global_entities,
                ),
                Option.getOrElse(() => [] as string[]),
              );

              const depositedToLocker =
                affectedEntities.includes(lockerAddress);

              return {
                accountAddress: claim.accountAddress,
                depositedToLocker,
              };
            }),
          { concurrency: 5 },
        );

        // Get unique account addresses that had locker deposits
        const accountsWithLockerDeposits = pipe(
          claimsWithLockerStatus,
          A.filter((c) => c.depositedToLocker),
          A.map((c) => c.accountAddress),
          A.dedupe,
        );

        if (accountsWithLockerDeposits.length === 0) {
          return A.empty<LockerBalance>();
        }

        // Query locker for each account's pool unit balance
        const lockerBalances = yield* Effect.forEach(
          accountsWithLockerDeposits,
          (accountAddress) =>
            Effect.gen(function* () {
              const lockerVaults = yield* gatewayApiClient.state.innerClient
                .accountLockerVaultsPage({
                  stateAccountLockerPageVaultsRequest: {
                    locker_address: lockerAddress,
                    account_address: accountAddress,
                  },
                })
                .pipe(Effect.orDie);

              // Find the pool unit resource in the locker vaults
              const poolUnitVault = pipe(
                Option.fromNullable(lockerVaults.items),
                Option.flatMap(
                  A.findFirst(
                    (item) => item.resource_address === poolUnitResourceAddress,
                  ),
                ),
              );

              const balance = pipe(
                poolUnitVault,
                Option.flatMap((vault) =>
                  vault.type === 'Fungible'
                    ? Option.some(vault.amount)
                    : Option.none(),
                ),
                Option.getOrElse(() => '0'),
              );

              return {
                accountAddress,
                balance,
              };
            }),
          { concurrency: 5 },
        );

        // Return only accounts with balance > 0
        return lockerBalances.filter(
          (item) => Number.parseFloat(item.balance) > 0,
        );
      });

      return {
        getLockerBalances,
      };
    }),
  },
) {}
