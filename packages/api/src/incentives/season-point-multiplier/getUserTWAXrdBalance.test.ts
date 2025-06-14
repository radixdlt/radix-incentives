import { Effect, Layer } from "effect";
import { vi } from "vitest";
import { GetWeekByIdService } from "../week/getWeekById";
import { GetWeekAccountBalancesService, type GetWeekAccountBalancesOutput } from "../activity-points/getWeekAccountBalances";
import {
  GetUserTWAXrdBalanceLive,
  GetUserTWAXrdBalanceService,
} from "./getUserTWAXrdBalance";
import { DbClientService } from "../db/dbClient";

const mockWeek = {
  id: "week-1",
  startDate: new Date("2025-01-01T00:00:00Z"),
  endDate: new Date("2025-01-07T23:59:59Z"),
  status: "completed" as const,
  seasonId: "season-1",
};

const mockAddresses = [
  "rdx1qsp8n0nx0muaewav2ksx99wwsu9swq5mlndjmn3gm9vl9q2mzmup0xw8ra",
  "rdx1qspxpn9znvzgjv2p6w2snhj3mzx2j0c2hv7rfpz5kzq7j8c5l8qg5c8rl",
  "rdx1qsp2m3kx8jt7v9y4w6h5z2l9c8f4n7q6r3x8m5p0t9j2k7v4b6x3z1c9e",
];

// Create mock data in the correct GetWeekAccountBalancesOutput format
const mockAccountBalanceItems: GetWeekAccountBalancesOutput = {
  [mockAddresses[0]]: {
    "maintainXrdBalance": [
      {
        accountAddress: mockAddresses[0],
        activityId: "maintainXrdBalance",
        timestamp: new Date("2025-01-02T12:00:00Z"),
        usdValue: "1000", // $1000 worth of XRD
      },
      {
        accountAddress: mockAddresses[0],
        activityId: "maintainXrdBalance",
        timestamp: new Date("2025-01-04T12:00:00Z"),
        usdValue: "1500", // $1500 worth of XRD
      },
    ]
  },
  [mockAddresses[1]]: {
    "maintainXrdBalance": [
      {
        accountAddress: mockAddresses[1],
        activityId: "maintainXrdBalance",
        timestamp: new Date("2025-01-01T12:00:00Z"),
        usdValue: "500", // $500 worth of XRD
      },
      {
        accountAddress: mockAddresses[1],
        activityId: "maintainXrdBalance",
        timestamp: new Date("2025-01-06T12:00:00Z"),
        usdValue: "750", // $750 worth of XRD
      },
    ]
  },
  [mockAddresses[2]]: {
    "maintainXrdBalance": [
      {
        accountAddress: mockAddresses[2],
        activityId: "maintainXrdBalance",
        timestamp: new Date("2025-01-03T12:00:00Z"),
        usdValue: "2000", // $2000 worth of XRD
      },
    ]
  },
};

// Mock accounts data - mapping addresses to userIds
const mockAccountsWithUserId = [
  { address: mockAddresses[0], userId: "user-1" },
  { address: mockAddresses[1], userId: "user-2" },
  { address: mockAddresses[2], userId: "user-1" }, // Same user has multiple addresses
];

const getWeekByIdLive = Layer.succeed(GetWeekByIdService, () =>
  Effect.succeed(mockWeek)
) as any;

const getWeekAccountBalancesLive = Layer.succeed(
  GetWeekAccountBalancesService,
  () => Effect.succeed(mockAccountBalanceItems)
) as any;

// Create a mock DB client that returns our account data
const mockDbClient = {
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        then: vi.fn((callback: (data: any) => any) => 
          Promise.resolve(callback(mockAccountsWithUserId))
        )
      }))
    }))
  }))
};

const mockDbClientLive = Layer.succeed(DbClientService, mockDbClient as any);

describe("GetUserTWAXrdBalanceService", () => {
  it("should calculate TWA XRD balance for users with multiple addresses", async () => {
    const program = Effect.gen(function* () {
      const getUserTWAXrdBalance = yield* GetUserTWAXrdBalanceService;

      return yield* getUserTWAXrdBalance({
        weekId: "week-1",
        addresses: mockAddresses,
      });
    }).pipe(
      Effect.catchAll((err) => {
        console.log("Error:", JSON.stringify(err, null, 2));
        return Effect.fail(err);
      })
    );

    const getUserTWAXrdBalanceLive = GetUserTWAXrdBalanceLive.pipe(
      Layer.provide(getWeekByIdLive),
      Layer.provide(getWeekAccountBalancesLive)
    );

    const result = await Effect.runPromise(
      // @ts-expect-error - mocked services
      Effect.provide(
        program,
        Layer.mergeAll(
          mockDbClientLive,
          getUserTWAXrdBalanceLive,
          getWeekByIdLive,
          getWeekAccountBalancesLive
        )
      )
    );

    console.log("Result:", JSON.stringify(result, null, 2));

    // Verify the results
    expect(result).toHaveLength(2); // Two unique users
    
    // Find user-1 (should have combined balance from address[0] and address[2])
    const user1Result = result.find(r => r.userId === "user-1");
    expect(user1Result).toBeDefined();
    expect(user1Result?.totalTWABalance).toBeGreaterThan(0);
    
    // Find user-2 (should have balance from address[1])
    const user2Result = result.find(r => r.userId === "user-2");
    expect(user2Result).toBeDefined();
    expect(user2Result?.totalTWABalance).toBeGreaterThan(0);
    
    // user-1 should have higher balance since they have two addresses
    expect(user1Result!.totalTWABalance).toBeGreaterThan(user2Result!.totalTWABalance);
  });

  it("should handle empty addresses array", async () => {
    const program = Effect.gen(function* () {
      const getUserTWAXrdBalance = yield* GetUserTWAXrdBalanceService;

      return yield* getUserTWAXrdBalance({
        weekId: "week-1",
        addresses: [],
      });
    });

    const getEmptyWeekAccountBalancesLive = Layer.succeed(
      GetWeekAccountBalancesService,
      () => Effect.succeed({})
    ) as any;

    const getUserTWAXrdBalanceLive = GetUserTWAXrdBalanceLive.pipe(
      Layer.provide(getWeekByIdLive),
      Layer.provide(getEmptyWeekAccountBalancesLive)
    );

    const result = await Effect.runPromise(
      // @ts-expect-error - mocked services
      Effect.provide(
        program,
        Layer.mergeAll(
          mockDbClientLive,
          getUserTWAXrdBalanceLive,
          getWeekByIdLive,
          getEmptyWeekAccountBalancesLive
        )
      )
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
        weekId: "week-1",
        addresses: unknownAddresses,
      });
    });

    const unknownAccountBalanceItems: GetWeekAccountBalancesOutput = {
      [unknownAddresses[0]]: {
        "maintainXrdBalance": [
          {
            accountAddress: unknownAddresses[0],
            activityId: "maintainXrdBalance",
            timestamp: new Date("2025-01-02T12:00:00Z"),
            usdValue: "1000",
          }
        ]
      }
    };

    const getUnknownWeekAccountBalancesLive = Layer.succeed(
      GetWeekAccountBalancesService,
      () => Effect.succeed(unknownAccountBalanceItems)
    ) as any;

    const getUserTWAXrdBalanceLive = GetUserTWAXrdBalanceLive.pipe(
      Layer.provide(getWeekByIdLive),
      Layer.provide(getUnknownWeekAccountBalancesLive)
    );

    const result = await Effect.runPromise(
      // @ts-expect-error - mocked services
      Effect.provide(
        program,
        Layer.mergeAll(
          mockDbClientLive,
          getUserTWAXrdBalanceLive,
          getWeekByIdLive,
          getUnknownWeekAccountBalancesLive
        )
      )
    );

    // Should return empty array since no accounts match
    expect(result).toHaveLength(0);
  });

  it("should handle single address for single user", async () => {
    const singleAddress = [mockAddresses[0]];

    const program = Effect.gen(function* () {
      const getUserTWAXrdBalance = yield* GetUserTWAXrdBalanceService;

      return yield* getUserTWAXrdBalance({
        weekId: "week-1",
        addresses: singleAddress,
      });
    });

    const singleAccountBalanceItems: GetWeekAccountBalancesOutput = {
      [mockAddresses[0]]: mockAccountBalanceItems[mockAddresses[0]]
    };

    const getSingleWeekAccountBalancesLive = Layer.succeed(
      GetWeekAccountBalancesService,
      () => Effect.succeed(singleAccountBalanceItems)
    ) as any;

    const getUserTWAXrdBalanceLive = GetUserTWAXrdBalanceLive.pipe(
      Layer.provide(getWeekByIdLive),
      Layer.provide(getSingleWeekAccountBalancesLive)
    );

    const result = await Effect.runPromise(
      // @ts-expect-error - mocked services
      Effect.provide(
        program,
        Layer.mergeAll(
          mockDbClientLive,
          getUserTWAXrdBalanceLive,
          getWeekByIdLive,
          getSingleWeekAccountBalancesLive
        )
      )
    );

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe("user-1");
    expect(result[0].totalTWABalance).toBeGreaterThan(0);
  });
}); 