import { layer } from '@effect/vitest';
import { ActivityId } from 'data';
import {
  accountBalances,
  accounts,
  seasons,
  userSeasonPoints,
  users,
  weeks,
} from 'db/incentives';
import { eq } from 'drizzle-orm';
import { DateTime, Effect, Logger } from 'effect';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbService } from '../db/dbClient';
import { DeactivateInactiveAccountsService } from './deactivateInactiveAccounts';

const testSetup = Effect.gen(function* () {
  const db = yield* DbService;

  const now = new Date();
  const twoHoursAgo = DateTime.unsafeFromDate(now).pipe(
    DateTime.subtractDuration('2 hours'),
    DateTime.toDate,
  );
  const twentySixHoursAgo = DateTime.unsafeFromDate(now).pipe(
    DateTime.subtractDuration('26 hours'),
    DateTime.toDate,
  );

  const data = yield* db.use(async (db) => {
    // Create test users
    const [
      userWithSufficientXrd,
      userWithInsufficientXrd,
      userWithNoSnapshots,
    ] = await db
      .insert(users)
      .values([
        { identityAddress: 'user_sufficient' },
        { identityAddress: 'user_insufficient' },
        { identityAddress: 'user_no_snapshots' },
      ])
      .returning();

    // User 1: Has $50 XRD across 2 accounts (total > $1 threshold)
    const [account1, account2] = await db
      .insert(accounts)
      .values([
        {
          userId: userWithSufficientXrd.id,
          address: 'account_1',
          label: 'Account 1',
          snapshotEnabled: true,
        },
        {
          userId: userWithSufficientXrd.id,
          address: 'account_2',
          label: 'Account 2',
          snapshotEnabled: true,
        },
      ])
      .returning();

    // User 2: Has $0.50 XRD (below $1 threshold)
    const [account3] = await db
      .insert(accounts)
      .values({
        userId: userWithInsufficientXrd.id,
        address: 'account_3',
        label: 'Account 3',
        snapshotEnabled: true,
      })
      .returning();

    // User 3: Has no recent snapshots (account should not be deactivated)
    const [account4] = await db
      .insert(accounts)
      .values({
        userId: userWithNoSnapshots.id,
        address: 'account_4',
        label: 'Account 4',
        snapshotEnabled: true,
      })
      .returning();

    // Insert account balances (snapshots)
    await db.insert(accountBalances).values([
      // Account 1: $30 XRD (recent snapshot)
      {
        accountAddress: account1.address,
        timestamp: twoHoursAgo,
        data: [
          { activityId: ActivityId.ho_xrd, usdValue: '30' },
          { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
        ],
      },
      // Account 2: $20 XRD (recent snapshot)
      {
        accountAddress: account2.address,
        timestamp: twoHoursAgo,
        data: [
          { activityId: ActivityId.ho_xrd, usdValue: '20' },
          { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
        ],
      },
      // Account 3: $0.50 XRD (recent snapshot - below threshold)
      {
        accountAddress: account3.address,
        timestamp: twoHoursAgo,
        data: [
          { activityId: ActivityId.ho_xrd, usdValue: '0.5' },
          { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
        ],
      },
      // Account 4: Old snapshot (26 hours ago - outside 24 hour window)
      {
        accountAddress: account4.address,
        timestamp: twentySixHoursAgo,
        data: [
          { activityId: ActivityId.ho_xrd, usdValue: '100' },
          { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
        ],
      },
    ]);

    return {
      userWithSufficientXrd,
      userWithInsufficientXrd,
      userWithNoSnapshots,
      account1,
      account2,
      account3,
      account4,
      now,
    };
  });

  return data;
}).pipe(Effect.provide(DbService.Default));

layer(DeactivateInactiveAccountsService.Default)(
  'DeactivateInactiveAccountsService',
  (it) => {
    beforeEach(async () => {
      await truncateTables();
    });

    it.effect(
      'should deactivate accounts for users with XRD balance below $1 threshold',
      () =>
        Effect.gen(function* () {
          const service = yield* DeactivateInactiveAccountsService;
          const db = yield* DbService;
          const { account1, account2, account3 } = yield* testSetup;

          const result = yield* service();

          // Only account3 should be deactivated (user has < $1 XRD)
          expect(result.deactivatedCount).toBe(1);
          expect(result.accounts).toHaveLength(1);
          expect(result.accounts[0]).toBe(account3.address);

          // Verify account3 is disabled
          const account3Status = yield* db.use((db) =>
            db
              .select()
              .from(accounts)
              .where(eq(accounts.address, account3.address))
              .then((results) => results[0]),
          );
          expect(account3Status?.snapshotEnabled).toBe(false);

          // Verify accounts 1 and 2 are still enabled
          const account1Status = yield* db.use((db) =>
            db
              .select()
              .from(accounts)
              .where(eq(accounts.address, account1.address))
              .then((results) => results[0]),
          );
          expect(account1Status?.snapshotEnabled).toBe(true);

          const account2Status = yield* db.use((db) =>
            db
              .select()
              .from(accounts)
              .where(eq(accounts.address, account2.address))
              .then((results) => results[0]),
          );
          expect(account2Status?.snapshotEnabled).toBe(true);
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
    );

    it.effect(
      'should insert zero-value snapshots for deactivated accounts',
      () =>
        Effect.gen(function* () {
          const service = yield* DeactivateInactiveAccountsService;
          const db = yield* DbService;
          const { account3 } = yield* testSetup;

          const snapshotsBeforeDeactivation = yield* db.use((db) =>
            db
              .select()
              .from(accountBalances)
              .where(eq(accountBalances.accountAddress, account3.address)),
          );

          expect(snapshotsBeforeDeactivation).toHaveLength(1);

          yield* service();

          const snapshotsAfterDeactivation = yield* db.use((db) =>
            db
              .select()
              .from(accountBalances)
              .where(eq(accountBalances.accountAddress, account3.address)),
          );

          // Should have one additional zero-value snapshot
          expect(snapshotsAfterDeactivation).toHaveLength(2);

          // Verify the new snapshot has all zero values
          const zeroSnapshot = snapshotsAfterDeactivation[1];
          expect(zeroSnapshot?.data).toBeDefined();

          const zeroValues = zeroSnapshot?.data as Array<{
            activityId: string;
            usdValue: string;
          }>;
          for (const item of zeroValues) {
            expect(item.usdValue).toBe('0');
          }
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
    );

    it.effect(
      'should return empty result when no accounts need deactivation',
      () =>
        Effect.gen(function* () {
          const service = yield* DeactivateInactiveAccountsService;
          const db = yield* DbService;

          const now = new Date();
          const twoHoursAgo = DateTime.unsafeFromDate(now).pipe(
            DateTime.subtractDuration('2 hours'),
            DateTime.toDate,
          );

          // Create user with sufficient XRD
          const [user] = yield* db.use((db) =>
            db
              .insert(users)
              .values({ identityAddress: 'user_rich' })
              .returning(),
          );

          const [account] = yield* db.use((db) =>
            db
              .insert(accounts)
              .values({
                userId: user.id,
                address: 'rich_account',
                label: 'Rich Account',
                snapshotEnabled: true,
              })
              .returning(),
          );

          yield* db.use((db) =>
            db.insert(accountBalances).values({
              accountAddress: account.address,
              timestamp: twoHoursAgo,
              data: [
                { activityId: ActivityId.ho_xrd, usdValue: '100' },
                { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
              ],
            }),
          );

          const result = yield* service();

          expect(result.deactivatedCount).toBe(0);
          expect(result.accounts).toHaveLength(0);
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
    );

    it.effect('should handle users with multiple accounts correctly', () =>
      Effect.gen(function* () {
        const service = yield* DeactivateInactiveAccountsService;
        const db = yield* DbService;

        const now = new Date();
        const twoHoursAgo = DateTime.unsafeFromDate(now).pipe(
          DateTime.subtractDuration('2 hours'),
          DateTime.toDate,
        );

        // Create user with 3 accounts: total XRD = $0.90 (below $1 threshold)
        const [user] = yield* db.use((db) =>
          db
            .insert(users)
            .values({ identityAddress: 'user_multiple_accounts' })
            .returning(),
        );

        const [accountA, accountB, accountC] = yield* db.use((db) =>
          db
            .insert(accounts)
            .values([
              {
                userId: user.id,
                address: 'account_a',
                label: 'Account A',
                snapshotEnabled: true,
              },
              {
                userId: user.id,
                address: 'account_b',
                label: 'Account B',
                snapshotEnabled: true,
              },
              {
                userId: user.id,
                address: 'account_c',
                label: 'Account C',
                snapshotEnabled: true,
              },
            ])
            .returning(),
        );

        yield* db.use((db) =>
          db.insert(accountBalances).values([
            {
              accountAddress: accountA.address,
              timestamp: twoHoursAgo,
              data: [
                { activityId: ActivityId.ho_xrd, usdValue: '0.3' },
                { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
              ],
            },
            {
              accountAddress: accountB.address,
              timestamp: twoHoursAgo,
              data: [
                { activityId: ActivityId.ho_xrd, usdValue: '0.3' },
                { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
              ],
            },
            {
              accountAddress: accountC.address,
              timestamp: twoHoursAgo,
              data: [
                { activityId: ActivityId.ho_xrd, usdValue: '0.3' },
                { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
              ],
            },
          ]),
        );

        const result = yield* service();

        // All 3 accounts should be deactivated since total user XRD < $1
        expect(result.deactivatedCount).toBe(3);
        expect(result.accounts).toHaveLength(3);
        expect(result.accounts).toContain(accountA.address);
        expect(result.accounts).toContain(accountB.address);
        expect(result.accounts).toContain(accountC.address);
      }).pipe(Effect.provide(Logger.pretty), Effect.provide(DbService.Default)),
    );

    it.effect(
      'should correctly aggregate XRD values across multiple accounts with overlapping activity IDs (below threshold)',
      () =>
        Effect.gen(function* () {
          const service = yield* DeactivateInactiveAccountsService;
          const db = yield* DbService;

          const now = new Date();
          const twoHoursAgo = DateTime.unsafeFromDate(now).pipe(
            DateTime.subtractDuration('2 hours'),
            DateTime.toDate,
          );

          // Create user with 2 accounts that have overlapping XRD activity IDs
          // Both accounts contribute to total, but total < $1
          const [user] = yield* db.use((db) =>
            db
              .insert(users)
              .values({ identityAddress: 'user_overlapping_activities' })
              .returning(),
          );

          const [accountA, accountB] = yield* db.use((db) =>
            db
              .insert(accounts)
              .values([
                {
                  userId: user.id,
                  address: 'account_a_overlap',
                  label: 'Account A',
                  snapshotEnabled: true,
                },
                {
                  userId: user.id,
                  address: 'account_b_overlap',
                  label: 'Account B',
                  snapshotEnabled: true,
                },
              ])
              .returning(),
          );

          yield* db.use((db) =>
            db.insert(accountBalances).values([
              {
                accountAddress: accountA.address,
                timestamp: twoHoursAgo,
                data: [
                  { activityId: ActivityId.ho_xrd, usdValue: '0.3' },
                  {
                    activityId: ActivityId['c9_ho_early-xrd'],
                    usdValue: '0.3',
                  },
                ],
              },
              {
                accountAddress: accountB.address,
                timestamp: twoHoursAgo,
                data: [
                  { activityId: ActivityId.ho_xrd, usdValue: '0.3' },
                  { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
                ],
              },
            ]),
          );

          const result = yield* service();

          // Both accounts should be deactivated
          // Total: account_a (0.3 + 0.3) + account_b (0.3 + 0) = $0.90 < $1
          expect(result.deactivatedCount).toBe(2);
          expect(result.accounts).toHaveLength(2);
          expect(result.accounts).toContain(accountA.address);
          expect(result.accounts).toContain(accountB.address);
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
    );

    it.effect(
      'should correctly aggregate XRD values across multiple accounts with overlapping activity IDs (above threshold)',
      () =>
        Effect.gen(function* () {
          const service = yield* DeactivateInactiveAccountsService;
          const db = yield* DbService;

          const now = new Date();
          const twoHoursAgo = DateTime.unsafeFromDate(now).pipe(
            DateTime.subtractDuration('2 hours'),
            DateTime.toDate,
          );

          // Create user with 2 accounts that have overlapping XRD activity IDs
          // Both accounts contribute to total, and total >= $1
          const [user] = yield* db.use((db) =>
            db
              .insert(users)
              .values({ identityAddress: 'user_sufficient_overlapping' })
              .returning(),
          );

          const [accountA, accountB] = yield* db.use((db) =>
            db
              .insert(accounts)
              .values([
                {
                  userId: user.id,
                  address: 'account_a_sufficient',
                  label: 'Account A',
                  snapshotEnabled: true,
                },
                {
                  userId: user.id,
                  address: 'account_b_sufficient',
                  label: 'Account B',
                  snapshotEnabled: true,
                },
              ])
              .returning(),
          );

          yield* db.use((db) =>
            db.insert(accountBalances).values([
              {
                accountAddress: accountA.address,
                timestamp: twoHoursAgo,
                data: [
                  { activityId: ActivityId.ho_xrd, usdValue: '0.4' },
                  {
                    activityId: ActivityId['c9_ho_early-xrd'],
                    usdValue: '0.3',
                  },
                ],
              },
              {
                accountAddress: accountB.address,
                timestamp: twoHoursAgo,
                data: [
                  { activityId: ActivityId.ho_xrd, usdValue: '0.2' },
                  {
                    activityId: ActivityId['c9_ho_early-xrd'],
                    usdValue: '0.2',
                  },
                ],
              },
            ]),
          );

          const result = yield* service();

          // No accounts should be deactivated
          // Total: account_a (0.4 + 0.3) + account_b (0.2 + 0.2) = $1.10 >= $1
          expect(result.deactivatedCount).toBe(0);
          expect(result.accounts).toHaveLength(0);

          // Verify both accounts are still enabled
          const accountStatuses = yield* db.use((db) =>
            db.select().from(accounts).where(eq(accounts.userId, user.id)),
          );
          for (const account of accountStatuses) {
            expect(account.snapshotEnabled).toBe(true);
          }
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
    );

    it.effect(
      'should skip users where not all accounts have recent snapshots',
      () =>
        Effect.gen(function* () {
          const service = yield* DeactivateInactiveAccountsService;
          const db = yield* DbService;

          const now = new Date();
          const twoHoursAgo = DateTime.unsafeFromDate(now).pipe(
            DateTime.subtractDuration('2 hours'),
            DateTime.toDate,
          );
          const twentySixHoursAgo = DateTime.unsafeFromDate(now).pipe(
            DateTime.subtractDuration('26 hours'),
            DateTime.toDate,
          );

          // Create user with 2 accounts, but only 1 has recent snapshot
          const [user] = yield* db.use((db) =>
            db
              .insert(users)
              .values({ identityAddress: 'user_partial_snapshots' })
              .returning(),
          );

          const [accountWithSnapshot, accountWithoutSnapshot] = yield* db.use(
            (db) =>
              db
                .insert(accounts)
                .values([
                  {
                    userId: user.id,
                    address: 'account_with_snapshot',
                    label: 'Account With Snapshot',
                    snapshotEnabled: true,
                  },
                  {
                    userId: user.id,
                    address: 'account_without_snapshot',
                    label: 'Account Without Snapshot',
                    snapshotEnabled: true,
                  },
                ])
                .returning(),
          );

          // Only one account has a recent snapshot (other has old/no snapshot)
          yield* db.use((db) =>
            db.insert(accountBalances).values([
              {
                accountAddress: accountWithSnapshot.address,
                timestamp: twoHoursAgo,
                data: [
                  { activityId: ActivityId.ho_xrd, usdValue: '0.3' },
                  { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
                ],
              },
              {
                accountAddress: accountWithoutSnapshot.address,
                timestamp: twentySixHoursAgo, // Old snapshot (outside 24 hour window)
                data: [
                  { activityId: ActivityId.ho_xrd, usdValue: '0.3' },
                  { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
                ],
              },
            ]),
          );

          const result = yield* service();

          // Should skip this user entirely (not all accounts have recent snapshots)
          expect(result.deactivatedCount).toBe(0);
          expect(result.accounts).toHaveLength(0);

          // Verify both accounts are still enabled
          const accountStatuses = yield* db.use((db) =>
            db.select().from(accounts).where(eq(accounts.userId, user.id)),
          );
          for (const account of accountStatuses) {
            expect(account.snapshotEnabled).toBe(true);
          }
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
    );

    it.effect('should not deactivate already disabled accounts', () =>
      Effect.gen(function* () {
        const service = yield* DeactivateInactiveAccountsService;
        const db = yield* DbService;

        const now = new Date();
        const twoHoursAgo = DateTime.unsafeFromDate(now).pipe(
          DateTime.subtractDuration('2 hours'),
          DateTime.toDate,
        );

        // Create user with insufficient XRD and already disabled account
        const [user] = yield* db.use((db) =>
          db
            .insert(users)
            .values({ identityAddress: 'user_disabled' })
            .returning(),
        );

        const [account] = yield* db.use((db) =>
          db
            .insert(accounts)
            .values({
              userId: user.id,
              address: 'disabled_account',
              label: 'Disabled Account',
              snapshotEnabled: false, // Already disabled
            })
            .returning(),
        );

        yield* db.use((db) =>
          db.insert(accountBalances).values({
            accountAddress: account.address,
            timestamp: twoHoursAgo,
            data: [
              { activityId: ActivityId.ho_xrd, usdValue: '0.5' },
              { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
            ],
          }),
        );

        const result = yield* service();

        // Should not deactivate already disabled account
        expect(result.deactivatedCount).toBe(0);
        expect(result.accounts).toHaveLength(0);
      }).pipe(Effect.provide(Logger.pretty), Effect.provide(DbService.Default)),
    );

    it.effect(
      'should not deactivate users who have earned season points > 0',
      () =>
        Effect.gen(function* () {
          const service = yield* DeactivateInactiveAccountsService;
          const db = yield* DbService;

          const now = new Date();
          const twoHoursAgo = DateTime.unsafeFromDate(now).pipe(
            DateTime.subtractDuration('2 hours'),
            DateTime.toDate,
          );

          // Create season and week
          const [season] = yield* db.use((db) =>
            db
              .insert(seasons)
              .values({
                name: 'Season 1',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                status: 'active',
              })
              .returning(),
          );

          const [week] = yield* db.use((db) =>
            db
              .insert(weeks)
              .values({
                seasonId: season.id,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-07'),
              })
              .returning(),
          );

          // Create user with insufficient XRD but has earned season points
          const [user] = yield* db.use((db) =>
            db
              .insert(users)
              .values({ identityAddress: 'user_with_points' })
              .returning(),
          );

          const [account] = yield* db.use((db) =>
            db
              .insert(accounts)
              .values({
                userId: user.id,
                address: 'account_with_points',
                label: 'Account With Points',
                snapshotEnabled: true,
              })
              .returning(),
          );

          // Insert low XRD snapshot (below threshold)
          yield* db.use((db) =>
            db.insert(accountBalances).values({
              accountAddress: account.address,
              timestamp: twoHoursAgo,
              data: [
                { activityId: ActivityId.ho_xrd, usdValue: '0.5' },
                { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
              ],
            }),
          );

          // User has earned season points > 0
          yield* db.use((db) =>
            db.insert(userSeasonPoints).values({
              userId: user.id,
              seasonId: season.id,
              weekId: week.id,
              points: '100.5',
            }),
          );

          const result = yield* service();

          // Should NOT deactivate user with season points history
          expect(result.deactivatedCount).toBe(0);
          expect(result.accounts).toHaveLength(0);

          // Verify account is still enabled
          const accountStatus = yield* db.use((db) =>
            db
              .select()
              .from(accounts)
              .where(eq(accounts.address, account.address))
              .then((results) => results[0]),
          );
          expect(accountStatus?.snapshotEnabled).toBe(true);
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
    );

    it.effect(
      'should deactivate users with 0 season points (not genuine participants)',
      () =>
        Effect.gen(function* () {
          const service = yield* DeactivateInactiveAccountsService;
          const db = yield* DbService;

          const now = new Date();
          const twoHoursAgo = DateTime.unsafeFromDate(now).pipe(
            DateTime.subtractDuration('2 hours'),
            DateTime.toDate,
          );

          // Create season and week
          const [season] = yield* db.use((db) =>
            db
              .insert(seasons)
              .values({
                name: 'Season 1',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                status: 'active',
              })
              .returning(),
          );

          const [week] = yield* db.use((db) =>
            db
              .insert(weeks)
              .values({
                seasonId: season.id,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-07'),
              })
              .returning(),
          );

          // Create user with insufficient XRD and 0 season points
          const [user] = yield* db.use((db) =>
            db
              .insert(users)
              .values({ identityAddress: 'user_zero_points' })
              .returning(),
          );

          const [account] = yield* db.use((db) =>
            db
              .insert(accounts)
              .values({
                userId: user.id,
                address: 'account_zero_points',
                label: 'Account Zero Points',
                snapshotEnabled: true,
              })
              .returning(),
          );

          // Insert low XRD snapshot (below threshold)
          yield* db.use((db) =>
            db.insert(accountBalances).values({
              accountAddress: account.address,
              timestamp: twoHoursAgo,
              data: [
                { activityId: ActivityId.ho_xrd, usdValue: '0.5' },
                { activityId: ActivityId['c9_ho_early-xrd'], usdValue: '0' },
              ],
            }),
          );

          // User has 0 season points (not a genuine participant)
          yield* db.use((db) =>
            db.insert(userSeasonPoints).values({
              userId: user.id,
              seasonId: season.id,
              weekId: week.id,
              points: '0',
            }),
          );

          const result = yield* service();

          // Should deactivate user with 0 season points
          expect(result.deactivatedCount).toBe(1);
          expect(result.accounts).toHaveLength(1);
          expect(result.accounts[0]).toBe(account.address);

          // Verify account is disabled
          const accountStatus = yield* db.use((db) =>
            db
              .select()
              .from(accounts)
              .where(eq(accounts.address, account.address))
              .then((results) => results[0]),
          );
          expect(accountStatus?.snapshotEnabled).toBe(false);
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(DbService.Default),
        ),
    );
  },
);
