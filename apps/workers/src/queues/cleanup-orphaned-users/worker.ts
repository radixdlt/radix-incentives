import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import { CleanupOrphanedUsersService } from 'api/incentives/user/cleanupOrphanedUsers';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';

// Worker cleans up users older than 7 days, without linked accounts
export const cleanupOrphanedUsersWorker = async () => {
  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const cleanupService = yield* CleanupOrphanedUsersService;
      return yield* cleanupService();
    }),
  );

  return handleExit(exit);
};
