import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Effect, Layer, Logger, LogLevel } from "effect";
import { inject } from "@effect/vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "db/incentives";
import * as consultationSchema from "db/consultation";
import { createDbClientLive, createDbReadOnlyClientLive } from "../db/dbClient";
import { GetWeekByIdLive } from "../week/getWeekById";
import { CalculateTWASQLLive } from "../activity-points/calculateTWASQL";
import {
  GetUserTWAXrdBalanceService,
  GetUserTWAXrdBalanceLive,
} from "./getUserTWAXrdBalance";
import { BigNumber } from "bignumber.js";
import { eq } from "drizzle-orm";

// Test data with proper UUIDs
const testSeasonId = "550e8400-e29b-41d4-a716-446655440000";
const testWeekId = "660e8400-e29b-41d4-a716-446655440001";
const testUserId1 = "770e8400-e29b-41d4-a716-446655440002";
const testUserId2 = "880e8400-e29b-41d4-a716-446655440003";
const testUserId3 = "990e8400-e29b-41d4-a716-446655440004";

const testAddresses = [
  "rdx1qsp8n0nx0muaewav2ksx99wwsu9swq5mlndjmn3gm9vl9q2mzmup0xw8ra",
  "rdx1qspxpn9znvzgjv2p6w2snhj3mzx2j0c2hv7rfpz5kzq7j8c5l8qg5c8rl",
  "rdx1qsp2m3kx8jt7v9y4w6h5z2l9c8f4n7q6r3x8m5p0t9j2k7v4b6x3z1c9e",
];

const testData = {
  season: {
    id: testSeasonId,
    name: "Test Season 1",
    status: "active" as const,
  },
  week: {
    id: testWeekId,
    seasonId: testSeasonId,
    startDate: new Date("2025-01-01T00:00:00Z"),
    endDate: new Date("2025-01-07T23:59:59Z"),
    processed: false,
  },
  users: [
    {
      id: testUserId1,
      identityAddress: "identity_rdx12user1",
      label: "Test User 1",
      createdAt: new Date("2024-12-01T00:00:00Z"),
    },
    {
      id: testUserId2,
      identityAddress: "identity_rdx12user2",
      label: "Test User 2",
      createdAt: new Date("2024-12-01T00:00:00Z"),
    },
    {
      id: testUserId3,
      identityAddress: "identity_rdx12user3",
      label: "Test User 3",
      createdAt: new Date("2024-12-01T00:00:00Z"),
    },
  ],
  accounts: [
    {
      userId: testUserId1,
      address: testAddresses[0],
      label: "Test Account 1",
      createdAt: new Date("2024-12-01T00:00:00Z"),
    },
    {
      userId: testUserId2,
      address: testAddresses[1],
      label: "Test Account 2",
      createdAt: new Date("2024-12-01T00:00:00Z"),
    },
    {
      userId: testUserId3,
      address: testAddresses[2],
      label: "Test Account 3",
      createdAt: new Date("2024-12-01T00:00:00Z"),
    },
  ],
  activityCategory: {
    id: "hold",
    name: "Hold Activities",
    description: "Activities for holding tokens",
  },
  activity: {
    id: "maintainXrdBalance",
    name: "Maintain XRD Balance",
    description: "Hold XRD balance",
    category: "hold",
  },
  accountBalances: [
    // User 1 - balance snapshots showing a hold activity
    {
      timestamp: new Date("2025-01-02T00:00:00Z"),
      accountAddress: testAddresses[0],
      data: [
        {
          activityId: "hold_maintainXrdBalance",
          usdValue: "1000.0",
        },
      ],
    },
    {
      timestamp: new Date("2025-01-04T00:00:00Z"),
      accountAddress: testAddresses[0],
      data: [
        {
          activityId: "hold_maintainXrdBalance",
          usdValue: "1500.0",
        },
      ],
    },
    // User 2 - balance snapshots
    {
      timestamp: new Date("2025-01-02T00:00:00Z"),
      accountAddress: testAddresses[1],
      data: [
        {
          activityId: "hold_maintainXrdBalance",
          usdValue: "500.0",
        },
      ],
    },
    {
      timestamp: new Date("2025-01-05T00:00:00Z"),
      accountAddress: testAddresses[1],
      data: [
        {
          activityId: "hold_maintainXrdBalance",
          usdValue: "750.0",
        },
      ],
    },
    // User 3 - single balance
    {
      timestamp: new Date("2025-01-03T00:00:00Z"),
      accountAddress: testAddresses[2],
      data: [
        {
          activityId: "hold_maintainXrdBalance",
          usdValue: "2000.0",
        },
      ],
    },
  ],
};

describe("GetUserTWAXrdBalanceService", () => {
  const dbUrl = inject("testDbUrl");
  const db = drizzle(postgres(dbUrl), { schema });
  const consultationDb = drizzle(postgres(dbUrl), {
    schema: consultationSchema,
  });
  const dbLive = createDbClientLive(db);
  const readOnlyDbLive = createDbReadOnlyClientLive(db);

  // Create service layers
  const getWeekByIdLive = GetWeekByIdLive.pipe(Layer.provide(dbLive));
  const calculateTWASQLLive = CalculateTWASQLLive.pipe(
    Layer.provide(dbLive),
    Layer.provide(readOnlyDbLive)
  );
  const getUserTWAXrdBalanceLive = GetUserTWAXrdBalanceLive.pipe(
    Layer.provide(getWeekByIdLive),
    Layer.provide(calculateTWASQLLive),
    Layer.provide(dbLive),
    Layer.provide(Logger.minimumLogLevel(LogLevel.None))
  );

  beforeEach(async () => {
    // Insert test data
    await db.insert(schema.seasons).values(testData.season);
    await db.insert(schema.weeks).values(testData.week);
    await consultationDb
      .insert(consultationSchema.users)
      .values(testData.users);
    await consultationDb
      .insert(consultationSchema.accounts)
      .values(testData.accounts);
    await db
      .insert(schema.activityCategories)
      .values(testData.activityCategory);
    await db.insert(schema.activities).values(testData.activity);
    await db.insert(schema.accountBalances).values(testData.accountBalances);
  });

  afterEach(async () => {
    // Clean up test data in reverse order of dependencies
    await db.delete(schema.accountBalances);
    await db.delete(schema.activities);
    await db.delete(schema.activityCategories);
    await consultationDb.delete(consultationSchema.accounts);
    await consultationDb.delete(consultationSchema.users);
    await db.delete(schema.weeks);
    await db.delete(schema.seasons);
  });

  it("should calculate TWA XRD balance for users with multiple addresses", async () => {
    const program = Effect.gen(function* () {
      const getUserTWAXrdBalance = yield* GetUserTWAXrdBalanceService;

      return yield* getUserTWAXrdBalance({
        weekId: testWeekId,
        addresses: testAddresses,
      });
    });

    const result = await Effect.runPromise(
      Effect.provide(program, getUserTWAXrdBalanceLive)
    );

    // Should return 3 users with their TWA balances
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);

    // Sort by userId for consistent testing
    const sortedResult = result.sort((a, b) =>
      a.userId.localeCompare(b.userId)
    );

    // Verify each user's data - use actual TWA calculations, not simple averages
    expect(sortedResult[0].userId).toBe(testUserId1);
    expect(sortedResult[0].totalTWABalance).toBeInstanceOf(BigNumber);
    expect(sortedResult[0].totalTWABalance.toNumber()).toBeGreaterThan(1000);
    expect(sortedResult[0].totalTWABalance.toNumber()).toBeLessThan(1600);

    expect(sortedResult[1].userId).toBe(testUserId2);
    expect(sortedResult[1].totalTWABalance).toBeInstanceOf(BigNumber);
    expect(sortedResult[1].totalTWABalance.toNumber()).toBeGreaterThan(500);
    expect(sortedResult[1].totalTWABalance.toNumber()).toBeLessThan(800);

    expect(sortedResult[2].userId).toBe(testUserId3);
    expect(sortedResult[2].totalTWABalance).toBeInstanceOf(BigNumber);
    expect(sortedResult[2].totalTWABalance.toNumber()).toBeGreaterThan(1500);
    expect(sortedResult[2].totalTWABalance.toNumber()).toBeLessThan(2500);

    // Verify structure
    for (const userBalance of result) {
      expect(userBalance).toHaveProperty("userId");
      expect(userBalance).toHaveProperty("totalTWABalance");
      expect(userBalance.totalTWABalance).toBeInstanceOf(BigNumber);
      expect(typeof userBalance.userId).toBe("string");
    }
  });

  it("should handle empty addresses array", async () => {
    const program = Effect.gen(function* () {
      const getUserTWAXrdBalance = yield* GetUserTWAXrdBalanceService;

      return yield* getUserTWAXrdBalance({
        weekId: testWeekId,
        addresses: [],
      });
    });

    const result = await Effect.runPromise(
      Effect.provide(program, getUserTWAXrdBalanceLive)
    );

    expect(result).toHaveLength(0);
  });

  it("should handle addresses with no matching accounts", async () => {
    const unknownAddresses = [
      "rdx1qsp0000000000000000000000000000000000000000000000000000000",
    ];

    const program = Effect.gen(function* () {
      const getUserTWAXrdBalance = yield* GetUserTWAXrdBalanceService;

      return yield* getUserTWAXrdBalance({
        weekId: testWeekId,
        addresses: unknownAddresses,
      });
    });

    const result = await Effect.runPromise(
      Effect.provide(program, getUserTWAXrdBalanceLive)
    );

    // Should return empty array since no accounts match in the database
    expect(result).toHaveLength(0);
  });

  it("should handle single address for single user", async () => {
    const singleAddress = [testAddresses[0]];

    const program = Effect.gen(function* () {
      const getUserTWAXrdBalance = yield* GetUserTWAXrdBalanceService;

      return yield* getUserTWAXrdBalance({
        weekId: testWeekId,
        addresses: singleAddress,
      });
    });

    const result = await Effect.runPromise(
      Effect.provide(program, getUserTWAXrdBalanceLive)
    );

    // Should return exactly 1 user
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);

    // Verify the single user's data - use actual TWA calculation range
    expect(result[0].userId).toBe(testUserId1);
    expect(result[0].totalTWABalance).toBeInstanceOf(BigNumber);
    expect(result[0].totalTWABalance.toNumber()).toBeGreaterThan(1000);
    expect(result[0].totalTWABalance.toNumber()).toBeLessThan(1600);

    // Verify structure
    expect(result[0]).toHaveProperty("userId");
    expect(result[0]).toHaveProperty("totalTWABalance");
    expect(result[0].totalTWABalance).toBeInstanceOf(BigNumber);
    expect(typeof result[0].userId).toBe("string");
  });

  it("should handle partial address matches", async () => {
    const mixedAddresses = [
      testAddresses[0], // This exists
      "rdx1qsp0000000000000000000000000000000000000000000000000000000", // This doesn't exist
      testAddresses[2], // This exists
    ];

    const program = Effect.gen(function* () {
      const getUserTWAXrdBalance = yield* GetUserTWAXrdBalanceService;

      return yield* getUserTWAXrdBalance({
        weekId: testWeekId,
        addresses: mixedAddresses,
      });
    });

    const result = await Effect.runPromise(
      Effect.provide(program, getUserTWAXrdBalanceLive)
    );

    // Should return only the 2 users that have matching addresses
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);

    // Sort results by userId for consistent checking
    const sortedResult = result.sort((a, b) =>
      a.userId.localeCompare(b.userId)
    );

    // Verify users that have matching addresses
    expect(sortedResult[0].userId).toBe(testUserId1);
    expect(sortedResult[0].totalTWABalance).toBeInstanceOf(BigNumber);
    expect(sortedResult[0].totalTWABalance.toNumber()).toBeGreaterThan(1000);
    expect(sortedResult[0].totalTWABalance.toNumber()).toBeLessThan(1600);

    expect(sortedResult[1].userId).toBe(testUserId3);
    expect(sortedResult[1].totalTWABalance).toBeInstanceOf(BigNumber);
    expect(sortedResult[1].totalTWABalance.toNumber()).toBeGreaterThan(1500);
    expect(sortedResult[1].totalTWABalance.toNumber()).toBeLessThan(2500);
  });
});
