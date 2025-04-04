import { Effect, pipe } from "effect";

type BalanceEvent = {
  readonly timestamp: Date;
  readonly balance: number;
};

type TimeInterval = {
  readonly startTime: Date;
  readonly endTime: Date;
  readonly balance: number;
};

type WeightedCalculation = {
  readonly weightedSum: number;
  readonly totalSeconds: number;
};

/**
 * Sorts balance events chronologically
 */
export const sortEventsByTimestamp = (
  events: ReadonlyArray<BalanceEvent>
): ReadonlyArray<BalanceEvent> =>
  [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

/**
 * Adds period end event if the last event is before period end
 *
 * This is crucial for the time-weighted average calculation because:
 * 1. It ensures we account for the balance from the last recorded event until the end of the period
 * 2. Without this, we would miss counting the final balance's contribution to the average
 * 3. The time-weighted calculation requires measuring each balance for its complete time interval
 *
 * Example: If a user had 2000 XRD on Jan 5th and the period ends on Jan 7th,
 * we need to count that 2000 XRD for the entire 2-day interval until Jan 7th.
 */
export const addPeriodEndEvent = (
  events: ReadonlyArray<BalanceEvent>,
  periodEnd: Date
): ReadonlyArray<BalanceEvent> => {
  if (events.length === 0) {
    return events;
  }

  const lastEvent = events[events.length - 1];

  return lastEvent.timestamp < periodEnd
    ? [
        ...events,
        {
          timestamp: periodEnd,
          balance: lastEvent.balance,
        },
      ]
    : events;
};

/**
 * Converts balance events to time intervals
 *
 * We use slice(1) to start from the second event because:
 * 1. Time intervals are created BETWEEN events - each interval spans from one event to the next
 * 2. With n events, we can create n-1 time intervals
 * 3. Each interval uses the previous event's balance (events[index].balance), as that's the balance
 *    that was held during the interval until the next change
 *
 * Example: For events [(Jan 1, 5000), (Jan 2, 10000), (Jan 5, 2000)]:
 * - First interval: Jan 1-Jan 2 with balance 5000
 * - Second interval: Jan 2-Jan 5 with balance 10000
 */
export const createTimeIntervals = (
  events: ReadonlyArray<BalanceEvent>
): ReadonlyArray<TimeInterval> =>
  events.slice(1).map((event, index) => ({
    startTime: events[index].timestamp,
    endTime: event.timestamp,
    balance: events[index].balance,
  }));

/**
 * Calculates interval duration in seconds
 */
export const calculateIntervalSeconds = (interval: TimeInterval): number =>
  (interval.endTime.getTime() - interval.startTime.getTime()) / 1000;

/**
 * Calculates weighted sum and total time from intervals
 */
export const calculateWeightedSumAndTime = (
  intervals: ReadonlyArray<TimeInterval>
): WeightedCalculation =>
  intervals.reduce(
    (acc, interval) => {
      const durationSeconds = calculateIntervalSeconds(interval);

      return {
        weightedSum: acc.weightedSum + interval.balance * durationSeconds,
        totalSeconds: acc.totalSeconds + durationSeconds,
      };
    },
    { weightedSum: 0, totalSeconds: 0 }
  );

/**
 * Calculates the final average
 */
export const calculateFinalAverage = ({
  weightedSum,
  totalSeconds,
}: WeightedCalculation) => (totalSeconds > 0 ? weightedSum / totalSeconds : 0);

/**
 * Calculates the time-weighted average of balance events over a period
 */
export const calculateTimeWeightedAverage = (
  events: ReadonlyArray<BalanceEvent>,
  periodEnd: Date
) => {
  if (events.length === 0) {
    return Effect.succeed(0);
  }

  return pipe(
    Effect.succeed(events),
    Effect.map(sortEventsByTimestamp),
    Effect.map((sortedEvents) => addPeriodEndEvent(sortedEvents, periodEnd)),
    Effect.map(createTimeIntervals),
    Effect.map(calculateWeightedSumAndTime),
    Effect.map(calculateFinalAverage)
  );
};
