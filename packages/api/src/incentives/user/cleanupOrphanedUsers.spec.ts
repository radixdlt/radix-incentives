import { layer } from '@effect/vitest';
import { accounts, users } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { DateTime, Effect, Logger } from 'effect';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbService } from '../db/dbClient';
import { CleanupOrphanedUsersService } from './cleanupOrphanedUsers';

const testSetup = Effect.gen(function* () {
  const db = yield* DbService;

  const now = new Date();
  const eightDaysAgo = DateTime.unsafeFromDate(now).pipe(
    DateTime.subtractDuration('8 days'),
    DateTime.toDate,
  );
  const sixDaysAgo = DateTime.unsafeFromDate(now).pipe(
    DateTime.subtractDuration('6 days'),
    DateTime.toDate,
  );

  const data = yield* db.use(async (db) => {
    // Create test users
    const [orphanedOldUser, orphanedRecentUser, userWithAccount] = await db
      .insert(users)
      .values([
        { identityAddress: 'orphaned_old', createdAt: eightDaysAgo },
        { identityAddress: 'orphaned_recent', createdAt: sixDaysAgo },
        { identityAddress: 'has_account', createdAt: eightDaysAgo },
      ])
      .returning();

    // Create an account for userWithAccount
    const [account] = await db
      .insert(accounts)
      .values({
        userId: userWithAccount.id,
        address: 'account_with_user',
        label: 'Account',
      })
      .returning();

    return {
      orphanedOldUser,
      orphanedRecentUser,
      userWithAccount,
      account,
      now,
      eightDaysAgo,
      sixDaysAgo,
    };
  });

  return data;
}).pipe(Effect.provide(DbService.Default));

layer(CleanupOrphanedUsersService.Default)(
  'CleanupOrphanedUsersService',
  (it) => {
    beforeEach(async () => {
      await truncateTables();
    });

    it.effect('should delete only orphaned users older than 7 days', () =>
      Effect.gen(function* () {
        const service = yield* CleanupOrphanedUsersService;
        const db = yield* DbService;
        const { orphanedOldUser, orphanedRecentUser, userWithAccount } =
          yield* testSetup;

        const result = yield* service();

        expect(result.deletedCount).toBe(1);
        expect(result.users).toHaveLength(1);
        expect(result.users[0].id).toBe(orphanedOldUser.id);
        expect(result.users[0].identityAddress).toBe(
          orphanedOldUser.identityAddress,
        );

        // Verify orphanedOldUser was deleted
        const deletedUser = yield* db.use((db) =>
          db
            .select()
            .from(users)
            .where(eq(users.id, orphanedOldUser.id))
            .then((results) => results[0]),
        );
        expect(deletedUser).toBeUndefined();

        // Verify orphanedRecentUser still exists (too recent)
        const recentUser = yield* db.use((db) =>
          db
            .select()
            .from(users)
            .where(eq(users.id, orphanedRecentUser.id))
            .then((results) => results[0]),
        );
        expect(recentUser).toBeDefined();

        // Verify userWithAccount still exists (has linked account)
        const userStillExists = yield* db.use((db) =>
          db
            .select()
            .from(users)
            .where(eq(users.id, userWithAccount.id))
            .then((results) => results[0]),
        );
        expect(userStillExists).toBeDefined();
      }).pipe(Effect.provide(Logger.pretty), Effect.provide(DbService.Default)),
    );

    it.effect('should return empty result when no orphaned users exist', () =>
      Effect.gen(function* () {
        const service = yield* CleanupOrphanedUsersService;
        const db = yield* DbService;

        const now = new Date();
        const eightDaysAgo = DateTime.unsafeFromDate(now).pipe(
          DateTime.subtractDuration('8 days'),
          DateTime.toDate,
        );

        // Create only users with accounts
        const [user1, user2] = yield* db.use((db) =>
          db
            .insert(users)
            .values([
              { identityAddress: 'user1', createdAt: eightDaysAgo },
              { identityAddress: 'user2', createdAt: eightDaysAgo },
            ])
            .returning(),
        );

        yield* db.use((db) =>
          db.insert(accounts).values([
            { userId: user1.id, address: 'account1', label: 'Account 1' },
            { userId: user2.id, address: 'account2', label: 'Account 2' },
          ]),
        );

        const result = yield* service();

        expect(result.deletedCount).toBe(0);
        expect(result.users).toHaveLength(0);
      }).pipe(Effect.provide(Logger.pretty), Effect.provide(DbService.Default)),
    );

    it.effect('should handle batching correctly with many users', () =>
      Effect.gen(function* () {
        const service = yield* CleanupOrphanedUsersService;
        const db = yield* DbService;

        const now = new Date();
        const eightDaysAgo = DateTime.unsafeFromDate(now).pipe(
          DateTime.subtractDuration('8 days'),
          DateTime.toDate,
        );

        // Create 2500 orphaned old users (to test batching with default batch size of 1000)
        const orphanedUsers = Array.from({ length: 2500 }, (_, i) => ({
          identityAddress: `orphaned_${i}`,
          createdAt: eightDaysAgo,
        }));

        yield* db.use((db) => db.insert(users).values(orphanedUsers));

        const result = yield* service();

        expect(result.deletedCount).toBe(2500);
        expect(result.users).toHaveLength(2500);

        // Verify all users were deleted
        const remainingUsers = yield* db.use((db) => db.select().from(users));
        expect(remainingUsers).toHaveLength(0);
      }).pipe(Effect.provide(Logger.pretty), Effect.provide(DbService.Default)),
    );
  },
);
