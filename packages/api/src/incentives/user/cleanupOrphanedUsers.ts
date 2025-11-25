import { accounts, users } from 'db/incentives';
import { and, eq, inArray, lt, notExists } from 'drizzle-orm';
import { DateTime, Effect } from 'effect';
import { DbService } from '../db/dbClient';

/**
 * Service for cleaning up users without linked accounts
 */
export class CleanupOrphanedUsersService extends Effect.Service<CleanupOrphanedUsersService>()(
  'CleanupOrphanedUsersService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;

      return Effect.fn(function* () {
        // Find users older than 7 days without any linked accounts
        const oneWeekAgo = DateTime.unsafeNow().pipe(
          DateTime.startOf('day'),
          DateTime.subtractDuration('1 week'),
          DateTime.toDate,
        );

        const orphanedUsers = yield* db.use((db) =>
          db
            .select({ id: users.id, identityAddress: users.identityAddress })
            .from(users)
            .where(
              and(
                lt(users.createdAt, oneWeekAgo),
                notExists(
                  db
                    .select({ userId: accounts.userId })
                    .from(accounts)
                    .where(eq(accounts.userId, users.id)),
                ),
              ),
            ),
        );

        if (orphanedUsers.length === 0) {
          yield* Effect.log('No orphaned users found to clean up');
          return { deletedCount: 0, users: [] };
        }

        // Delete orphaned users
        const deletedUserIds = orphanedUsers.map((u) => u.id);

        yield* db.use((db) =>
          db.delete(users).where(inArray(users.id, deletedUserIds)),
        );

        yield* Effect.log(
          `Cleaned up ${orphanedUsers.length} orphaned users older than 7 days without linked accounts`,
        );

        return {
          deletedCount: orphanedUsers.length,
          users: orphanedUsers.map((u) => ({
            id: u.id,
            identityAddress: u.identityAddress,
          })),
        };
      });
    }),
  },
) {}

export const CleanupOrphanedUsersServiceLive =
  CleanupOrphanedUsersService.Default;
