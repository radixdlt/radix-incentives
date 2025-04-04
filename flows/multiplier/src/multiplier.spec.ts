import { describe, it, expect } from "vitest";
import {
  sortEventsByTimestamp,
  addPeriodEndEvent,
  createTimeIntervals,
  calculateIntervalSeconds,
  calculateWeightedSumAndTime,
  calculateTimeWeightedAverage,
} from "./multiplier";
import { Effect } from "effect";

describe("sortEventsByTimestamp", () => {
  it("should sort events chronologically", () => {
    // Arrange
    const events = [
      { timestamp: new Date("2023-01-03"), balance: 3000 },
      { timestamp: new Date("2023-01-01"), balance: 1000 },
      { timestamp: new Date("2023-01-02"), balance: 2000 },
    ];

    // Act
    const result = sortEventsByTimestamp(events);

    // Assert
    expect(result).toEqual([
      { timestamp: new Date("2023-01-01"), balance: 1000 },
      { timestamp: new Date("2023-01-02"), balance: 2000 },
      { timestamp: new Date("2023-01-03"), balance: 3000 },
    ]);
  });

  it("should return empty array for empty input", () => {
    expect(sortEventsByTimestamp([])).toEqual([]);
  });

  it("should handle events with identical timestamps", () => {
    const events = [
      { timestamp: new Date("2023-01-01"), balance: 2000 },
      { timestamp: new Date("2023-01-01"), balance: 1000 },
    ];
    const result = sortEventsByTimestamp(events);
    expect(result.length).toBe(2);
    // The original order for identical timestamps might be preserved or not,
    // we just check the timestamps are the same
    expect(result[0].timestamp).toEqual(result[1].timestamp);
  });
});

describe("addPeriodEndEvent", () => {
  it("should add period end event if last event is before period end", () => {
    // Arrange
    const events = [
      { timestamp: new Date("2023-01-01"), balance: 1000 },
      { timestamp: new Date("2023-01-02"), balance: 2000 },
    ];
    const periodEnd = new Date("2023-01-05");

    // Act
    const result = addPeriodEndEvent(events, periodEnd);

    // Assert
    expect(result).toEqual([
      { timestamp: new Date("2023-01-01"), balance: 1000 },
      { timestamp: new Date("2023-01-02"), balance: 2000 },
      { timestamp: new Date("2023-01-05"), balance: 2000 },
    ]);
  });

  it("should not add period end event if last event is at period end", () => {
    // Arrange
    const events = [
      { timestamp: new Date("2023-01-01"), balance: 1000 },
      { timestamp: new Date("2023-01-05"), balance: 2000 },
    ];
    const periodEnd = new Date("2023-01-05");

    // Act
    const result = addPeriodEndEvent(events, periodEnd);

    // Assert
    expect(result).toEqual(events);
  });

  it("should not add period end event if last event is after period end", () => {
    // Arrange
    const events = [
      { timestamp: new Date("2023-01-01"), balance: 1000 },
      { timestamp: new Date("2023-01-07"), balance: 2000 },
    ];
    const periodEnd = new Date("2023-01-05");

    // Act
    const result = addPeriodEndEvent(events, periodEnd);

    // Assert
    expect(result).toEqual(events);
  });

  it("should return empty array for empty input", () => {
    expect(addPeriodEndEvent([], new Date("2023-01-05"))).toEqual([]);
  });
});

describe("createTimeIntervals", () => {
  it("should convert events to time intervals", () => {
    // Arrange
    const events = [
      { timestamp: new Date("2023-01-01"), balance: 1000 },
      { timestamp: new Date("2023-01-02"), balance: 2000 },
      { timestamp: new Date("2023-01-05"), balance: 3000 },
    ];

    // Act
    const result = createTimeIntervals(events);

    // Assert
    expect(result).toEqual([
      {
        startTime: new Date("2023-01-01"),
        endTime: new Date("2023-01-02"),
        balance: 1000,
      },
      {
        startTime: new Date("2023-01-02"),
        endTime: new Date("2023-01-05"),
        balance: 2000,
      },
    ]);
  });

  it("should return empty array when there are less than 2 events", () => {
    expect(createTimeIntervals([])).toEqual([]);
    expect(
      createTimeIntervals([
        { timestamp: new Date("2023-01-01"), balance: 1000 },
      ])
    ).toEqual([]);
  });
});

describe("calculateIntervalSeconds", () => {
  it("should calculate interval duration in seconds", () => {
    // Arrange
    const interval = {
      startTime: new Date("2023-01-01T00:00:00Z"),
      endTime: new Date("2023-01-01T01:00:00Z"), // 1 hour = 3600 seconds
      balance: 1000,
    };

    // Act
    const result = calculateIntervalSeconds(interval);

    // Assert
    expect(result).toBe(3600);
  });

  it("should return 0 for identical start and end times", () => {
    const interval = {
      startTime: new Date("2023-01-01T00:00:00Z"),
      endTime: new Date("2023-01-01T00:00:00Z"),
      balance: 1000,
    };
    expect(calculateIntervalSeconds(interval)).toBe(0);
  });

  it("should handle millisecond precision", () => {
    const interval = {
      startTime: new Date("2023-01-01T00:00:00.000Z"),
      endTime: new Date("2023-01-01T00:00:00.500Z"), // 500 milliseconds = 0.5 seconds
      balance: 1000,
    };
    expect(calculateIntervalSeconds(interval)).toBe(0.5);
  });
});

describe("calculateWeightedSumAndTime", () => {
  it("should calculate weighted sum and total time", () => {
    // Arrange
    const intervals = [
      {
        startTime: new Date("2023-01-01T00:00:00Z"),
        endTime: new Date("2023-01-01T12:00:00Z"), // 12 hours = 43200 seconds
        balance: 1000,
      },
      {
        startTime: new Date("2023-01-01T12:00:00Z"),
        endTime: new Date("2023-01-02T00:00:00Z"), // 12 hours = 43200 seconds
        balance: 2000,
      },
    ];

    // Act
    const result = calculateWeightedSumAndTime(intervals);

    // Assert
    expect(result.weightedSum).toBe(1000 * 43200 + 2000 * 43200); // 1000 * 12h + 2000 * 12h
    expect(result.totalSeconds).toBe(86400); // 24 hours = 86400 seconds
  });

  it("should return zero values for empty intervals", () => {
    expect(calculateWeightedSumAndTime([])).toEqual({
      weightedSum: 0,
      totalSeconds: 0,
    });
  });
});

describe("calculateTimeWeightedAverage", () => {
  it("should calculate time-weighted average correctly", () => {
    // Arrange
    const events = [
      { timestamp: new Date("2023-01-01T00:00:00Z"), balance: 5000 },
      { timestamp: new Date("2023-01-02T12:00:00Z"), balance: 10000 },
      { timestamp: new Date("2023-01-05T00:00:00Z"), balance: 2000 },
    ];
    const periodEnd = new Date("2023-01-07T00:00:00Z");

    // Act
    const result = Effect.runSync(
      calculateTimeWeightedAverage(events, periodEnd)
    );

    // Expected calculation:
    // First interval: Jan 1-Jan 2 (12:00): 36 hours = 129600 seconds with balance 5000
    // Second interval: Jan 2 (12:00)-Jan 5: 60 hours = 216000 seconds with balance 10000
    // Third interval: Jan 5-Jan 7: 48 hours = 172800 seconds with balance 2000
    // Weighted sum: 5000*129600 + 10000*216000 + 2000*172800 = 3,152,000,000
    // Total seconds: 518400
    // TWA: 3,152,000,000 / 518400 ≈ 6083.33

    // Assert - using approximate equality due to floating point precision
    expect(result).toBeCloseTo(6083.33, 1);
  });

  it("should return 0 for empty events", () => {
    expect(Effect.runSync(calculateTimeWeightedAverage([], new Date()))).toBe(
      0
    );
  });

  it("should handle single event correctly", () => {
    const event = { timestamp: new Date("2023-01-01"), balance: 5000 };
    const periodEnd = new Date("2023-01-07");

    // With a single event, the time-weighted average should equal the balance
    // since it's constant over the whole period
    expect(
      Effect.runSync(calculateTimeWeightedAverage([event], periodEnd))
    ).toBe(5000);
  });

  it("should handle zero duration edge case", () => {
    const events = [
      { timestamp: new Date("2023-01-01"), balance: 5000 },
      { timestamp: new Date("2023-01-01"), balance: 10000 }, // Same timestamp
    ];
    const periodEnd = new Date("2023-01-01"); // Same timestamp as events

    // When all events happen at the same time, we expect 0 to be returned
    expect(
      Effect.runSync(calculateTimeWeightedAverage(events, periodEnd))
    ).toBe(0);
  });
});
