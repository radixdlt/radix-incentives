import { accounts, users } from 'db/incentives';
import { and, eq, inArray, lt, notExists } from 'drizzle-orm';
import { Config, DateTime, Effect } from 'effect';
import { chunker } from '../../common';
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

      const BATCH_SIZE = yield* Config.number('CLEANUP_BATCH_SIZE').pipe(
        Config.withDefault(1000),
      );

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

        yield* Effect.log(
          `Found ${orphanedUsers.length} orphaned users to clean up, processing in batches of ${BATCH_SIZE}`,
        );

        // Delete orphaned users in batches
        const deletedUserIds = orphanedUsers.map((u) => u.id);
        const userBatches = chunker(deletedUserIds, BATCH_SIZE);

        let totalDeleted = 0;

        for (const [index, batch] of userBatches.entries()) {
          yield* Effect.log(
            `Deleting batch ${index + 1}/${userBatches.length} (${batch.length} users)`,
          );

          yield* db.use((db) =>
            db.delete(users).where(inArray(users.id, batch)),
          );

          totalDeleted += batch.length;
        }

        yield* Effect.log(
          `Cleaned up ${totalDeleted} orphaned users older than 7 days without linked accounts`,
        );

        return {
          deletedCount: totalDeleted,
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
