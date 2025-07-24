import { describe, inject } from "vitest";
import { Effect, Layer } from "effect";
import { it } from "@effect/vitest";
import { createDbClientLive } from "../db/dbClient";
import {
  GetUsersPaginatedService,
  GetUsersPaginatedLive,
} from "./getUsersPaginated";

import { users, accounts, schema } from "db/incentives";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

describe(
  "GetUsersPaginatedService",
  {
    timeout: 30_000,
  },
  () => {
    const dbUrl = inject("testDbUrl");
    const db = drizzle(postgres(dbUrl), { schema });
    const dbLive = createDbClientLive(db);

    const testLayer = GetUsersPaginatedLive.pipe(Layer.provide(dbLive));

    // Test data constants
    const USER_1 = "11111111-1111-1111-1111-111111111111";
    const USER_2 = "22222222-2222-2222-2222-222222222222";
    const USER_3 = "33333333-3333-3333-3333-333333333333";

    const ACCOUNT_1 = "account_rdx12test1_get_users_paginated_acc";
    const ACCOUNT_2 = "account_rdx12test2_get_users_paginated_acc";
    const ACCOUNT_3 = "account_rdx12test3_get_users_paginated_acc";
    const ACCOUNT_4 = "account_rdx12test4_get_users_paginated_acc";

    const setupTestData = Effect.gen(function* () {
      // Create users
      yield* Effect.promise(() =>
        db
          .insert(users)
          .values([
            { id: USER_1, identityAddress: `identity_${USER_1}` },
            { id: USER_2, identityAddress: `identity_${USER_2}` },
            { id: USER_3, identityAddress: `identity_${USER_3}` },
          ])
          .onConflictDoNothing()
      );

      // Create accounts
      yield* Effect.promise(() =>
        db
          .insert(accounts)
          .values([
            { address: ACCOUNT_1, userId: USER_1, label: "Account 1" },
            { address: ACCOUNT_2, userId: USER_1, label: "Account 2" },
            { address: ACCOUNT_3, userId: USER_2, label: "Account 3" },
            { address: ACCOUNT_4, userId: USER_3, label: "Account 4" },
          ])
          .onConflictDoNothing()
      );
    });

    const cleanupTestData = Effect.gen(function* () {
      yield* Effect.promise(() => db.delete(accounts));
      yield* Effect.promise(() => db.delete(users));
    });

    it.effect("should return paginated users with their accounts", () =>
      Effect.gen(function* () {
        yield* cleanupTestData;
        yield* setupTestData;

        const service = yield* Effect.provide(
          GetUsersPaginatedService,
          testLayer
        );

        const result = yield* service({ page: 1, limit: 10 });

        expect(result.users).toHaveLength(3);
        expect(result.total).toBe(3);

        // Find specific users and verify their accounts
        const user1 = result.users.find((u) => u.id === USER_1);
        const user2 = result.users.find((u) => u.id === USER_2);
        const user3 = result.users.find((u) => u.id === USER_3);

        expect(user1).toBeDefined();
        expect(user1?.accounts).toHaveLength(2);
        expect(user1?.accounts.map((a) => a.address)).toEqual(
          expect.arrayContaining([ACCOUNT_1, ACCOUNT_2])
        );

        expect(user2).toBeDefined();
        expect(user2?.accounts).toHaveLength(1);
        expect(user2?.accounts[0]?.address).toBe(ACCOUNT_3);

        expect(user3).toBeDefined();
        expect(user3?.accounts).toHaveLength(1);
        expect(user3?.accounts[0]?.address).toBe(ACCOUNT_4);

        yield* cleanupTestData;
      })
    );

    it.effect("should handle pagination correctly", () =>
      Effect.gen(function* () {
        yield* cleanupTestData;
        yield* setupTestData;

        const service = yield* Effect.provide(
          GetUsersPaginatedService,
          testLayer
        );

        // Test first page with limit 2
        const page1 = yield* service({ page: 1, limit: 2 });
        expect(page1.users).toHaveLength(2);
        expect(page1.total).toBe(3);

        // Test second page with limit 2
        const page2 = yield* service({ page: 2, limit: 2 });
        expect(page2.users).toHaveLength(1);
        expect(page2.total).toBe(3);

        // Test empty page
        const page3 = yield* service({ page: 3, limit: 2 });
        expect(page3.users).toHaveLength(0);
        expect(page3.total).toBe(3);

        yield* cleanupTestData;
      })
    );

    it.effect("should handle users with no accounts", () =>
      Effect.gen(function* () {
        yield* cleanupTestData;

        // Create only users, no accounts
        yield* Effect.promise(() =>
          db
            .insert(users)
            .values([{ id: USER_1, identityAddress: `identity_${USER_1}` }])
            .onConflictDoNothing()
        );

        const service = yield* Effect.provide(
          GetUsersPaginatedService,
          testLayer
        );

        const result = yield* service({ page: 1, limit: 10 });

        expect(result.users).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.users[0]?.id).toBe(USER_1);
        expect(result.users[0]?.accounts).toHaveLength(0);

        yield* cleanupTestData;
      })
    );

    it.effect("should handle empty result set", () =>
      Effect.gen(function* () {
        yield* cleanupTestData;

        const service = yield* Effect.provide(
          GetUsersPaginatedService,
          testLayer
        );

        const result = yield* service({ page: 1, limit: 10 });

        expect(result.users).toHaveLength(0);
        expect(result.total).toBe(0);
      })
    );

    it.effect("should return users sorted by creation date", () =>
      Effect.gen(function* () {
        yield* cleanupTestData;

        // Create users with specific creation dates
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        yield* Effect.promise(() =>
          db
            .insert(users)
            .values([
              {
                id: USER_1,
                identityAddress: `identity_${USER_1}`,
                createdAt: twoDaysAgo,
              },
              {
                id: USER_2,
                identityAddress: `identity_${USER_2}`,
                createdAt: now,
              },
              {
                id: USER_3,
                identityAddress: `identity_${USER_3}`,
                createdAt: yesterday,
              },
            ])
            .onConflictDoNothing()
        );

        const service = yield* Effect.provide(
          GetUsersPaginatedService,
          testLayer
        );

        const result = yield* service({ page: 1, limit: 10 });

        expect(result.users).toHaveLength(3);

        // Verify users are sorted by creation date (most recent first)
        const createdDates = result.users.map((u) => u.createdAt.getTime());
        expect(createdDates[0]).toBeGreaterThanOrEqual(createdDates[1] || 0);
        expect(createdDates[1]).toBeGreaterThanOrEqual(createdDates[2] || 0);

        yield* cleanupTestData;
      })
    );

    it.effect("should handle large page numbers gracefully", () =>
      Effect.gen(function* () {
        yield* cleanupTestData;
        yield* setupTestData;

        const service = yield* Effect.provide(
          GetUsersPaginatedService,
          testLayer
        );

        // Request a very high page number
        const result = yield* service({ page: 1000, limit: 10 });

        expect(result.users).toHaveLength(0);
        expect(result.total).toBe(3);

        yield* cleanupTestData;
      })
    );

    it.effect("should handle edge case limits", () =>
      Effect.gen(function* () {
        yield* cleanupTestData;
        yield* setupTestData;

        const service = yield* Effect.provide(
          GetUsersPaginatedService,
          testLayer
        );

        // Test with limit of 1
        const result1 = yield* service({ page: 1, limit: 1 });
        expect(result1.users).toHaveLength(1);
        expect(result1.total).toBe(3);

        // Test with limit equal to total
        const result2 = yield* service({ page: 1, limit: 3 });
        expect(result2.users).toHaveLength(3);
        expect(result2.total).toBe(3);

        // Test with limit greater than total
        const result3 = yield* service({ page: 1, limit: 100 });
        expect(result3.users).toHaveLength(3);
        expect(result3.total).toBe(3);

        yield* cleanupTestData;
      })
    );

    it.effect("should correctly associate multiple accounts per user", () =>
      Effect.gen(function* () {
        yield* cleanupTestData;

        // Create a user with many accounts
        const USER_WITH_MANY_ACCOUNTS = "44444444-4444-4444-4444-444444444444";

        yield* Effect.promise(() =>
          db
            .insert(users)
            .values([
              {
                id: USER_WITH_MANY_ACCOUNTS,
                identityAddress: `identity_${USER_WITH_MANY_ACCOUNTS}`,
              },
            ])
            .onConflictDoNothing()
        );

        // Create 5 accounts for this user
        const accountAddresses = Array.from(
          { length: 5 },
          (_, i) => `account_rdx12many${i}_get_users_paginated_acc`
        );

        yield* Effect.promise(() =>
          db
            .insert(accounts)
            .values(
              accountAddresses.map((address, i) => ({
                address,
                userId: USER_WITH_MANY_ACCOUNTS,
                label: `Many Account ${i + 1}`,
              }))
            )
            .onConflictDoNothing()
        );

        const service = yield* Effect.provide(
          GetUsersPaginatedService,
          testLayer
        );

        const result = yield* service({ page: 1, limit: 10 });

        expect(result.users).toHaveLength(1);
        expect(result.total).toBe(1);

        const user = result.users[0];
        expect(user?.accounts).toHaveLength(5);
        expect(user?.accounts.map((a) => a.address)).toEqual(
          expect.arrayContaining(accountAddresses)
        );

        yield* cleanupTestData;
      })
    );
  }
);
