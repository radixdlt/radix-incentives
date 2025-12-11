import { DeactivateInactiveAccountsService } from 'api/incentives/account/deactivateInactiveAccounts';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import { CleanupOrphanedUsersService } from 'api/incentives/user/cleanupOrphanedUsers';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';

/**
 * Maintenance worker that runs cleanup tasks sequentially:
 * 1. Cleanup orphaned users (users without linked accounts)
 * 2. Deactivate inactive accounts (accounts with XRD balance < $1)
 */
export const maintenanceWorker = async () => {
  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      yield* Effect.log('Starting maintenance job');

      // Step 1: Cleanup orphaned users
      yield* Effect.log('Step 1: Cleaning up orphaned users');
      const cleanupService = yield* CleanupOrphanedUsersService;
      const cleanupResult = yield* cleanupService();
      yield* Effect.log(
        `Cleanup complete: ${cleanupResult.deletedCount} users removed`,
      );

      // Step 2: Deactivate inactive accounts
      yield* Effect.log('Step 2: Deactivating inactive accounts');
      const deactivateService = yield* DeactivateInactiveAccountsService;
      const deactivateResult = yield* deactivateService();
      yield* Effect.log(
        `Deactivation complete: ${deactivateResult.deactivatedCount} accounts deactivated`,
      );

      yield* Effect.log('Maintenance job completed');

      return {
        cleanupResult,
        deactivateResult,
      };
    }),
  );

  return handleExit(exit);
};
