import { vi } from "vitest";
import { Layer } from "effect";
import { DbClientService } from "../incentives/db/dbClient";

// Create a mock database client
export const createMockDb = () => {
  // Create mock implementations for each table
  const mockQuery = {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    count: vi.fn().mockResolvedValue(0),
  };

  // Create a chainable query builder mock
  const createQueryBuilder = () => {
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      having: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      rightJoin: vi.fn().mockReturnThis(),
      fullJoin: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue([]),
      then: vi.fn().mockResolvedValue([]), // For direct awaiting
    };
    return mockQueryBuilder;
  };

  return {
    query: {
      accounts: mockQuery,
      activities: mockQuery,
      activityWeeks: mockQuery,
      challenges: mockQuery,
      seasons: mockQuery,
      sessions: mockQuery,
      transactions: mockQuery,
      userActivities: mockQuery,
      userAccounts: mockQuery,
      users: mockQuery,
      userSeasonPoints: mockQuery,
      userWeeklyMultipliers: mockQuery,
      userWeeklyPoints: mockQuery,
      verificationTokens: mockQuery,
      weeks: mockQuery,
    },
    transaction: vi.fn((fn) => fn(mockDb)),
    select: vi.fn(() => createQueryBuilder()),
    selectFrom: vi.fn(() => createQueryBuilder()),
    from: vi.fn(() => createQueryBuilder()),
    insert: vi.fn(() => ({
      into: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      execute: vi.fn().mockResolvedValue([]),
    })),
    update: vi.fn(() => ({
      table: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      execute: vi.fn().mockResolvedValue([]),
    })),
    delete: vi.fn(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      execute: vi.fn().mockResolvedValue([]),
    })),
  } as any;
};

export const mockDb = createMockDb();
export const mockDbClientLive = Layer.succeed(DbClientService, mockDb);
