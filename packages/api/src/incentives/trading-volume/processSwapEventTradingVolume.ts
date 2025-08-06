import { Effect } from 'effect';
import { groupBy } from 'effect/Array';
import BigNumber from 'bignumber.js';
import type { ActivityId } from 'data';
import { AddTradingVolumeService } from './addTradingVolume';
import type { DbError } from '../db/dbClient';
import type { CapturedEvent } from '../events/event-matchers/createEventMatcher';
import type { EmittableEvent } from '../events/event-matchers/types';
import {
  FilterTradingEventsService,
  type TradingEventWithTokens,
} from './filterTradingEvents';

export type ProcessSwapEventTradingVolumeServiceInput = {
  events: CapturedEvent<EmittableEvent>[];
  highestFeePayerMap: Map<string, string>;
};

export type ProcessSwapEventTradingVolumeServiceError = DbError;

/**
 * Represents a trading volume item for a specific account at a given timestamp
 */
type TradingVolumeItem = {
  timestamp: Date;
  accountAddress: string;
  data: {
    activityId: ActivityId;
    usdValue: string;
  }[];
};

/**
 * Aggregates trading events by activity ID and calculates total USD value per activity
 */
const aggregateEventsByActivity = (
  events: TradingEventWithTokens[],
): { activityId: ActivityId; usdValue: string }[] => {
  const groupedByActivity = groupBy(events, (event) => event.activityId);
  const result: { activityId: ActivityId; usdValue: string }[] = [];

  for (const [_, activityEvents] of Object.entries(groupedByActivity)) {
    if (!activityEvents?.length) continue;

    const aggregatedUsdValue = activityEvents.reduce(
      (acc, event) => acc.plus(event.usdValue),
      new BigNumber(0),
    );

    if (aggregatedUsdValue.gt(0)) {
      result.push({
        activityId: activityEvents[0]!.activityId,
        usdValue: aggregatedUsdValue.decimalPlaces(2).toString(),
      });
    }
  }

  return result;
};

/**
 * Processes a group of trading events for a single transaction
 * Returns null if no valid trading volume item can be created
 */
const processTransactionGroup = (
  transactionId: string,
  events: TradingEventWithTokens[],
  highestFeePayerMap: Map<string, string>,
): TradingVolumeItem | null => {
  if (!events.length) return null;

  const accountAddress = highestFeePayerMap.get(transactionId);
  if (!accountAddress) return null;

  const data = aggregateEventsByActivity(events);
  if (!data.length) return null;

  return {
    timestamp: events[0]!.timestamp,
    accountAddress,
    data,
  };
};

/**
 * Service that processes swap events to calculate trading volumes per account and activity
 * Groups events by transaction and aggregates USD values by activity before persisting
 */
export class ProcessSwapEventTradingVolumeService extends Effect.Service<ProcessSwapEventTradingVolumeService>()(
  'ProcessSwapEventTradingVolumeService',
  {
    effect: Effect.gen(function* () {
      const addTradingVolumeService = yield* AddTradingVolumeService;
      const filterTradingEventsService = yield* FilterTradingEventsService;

      return Effect.fn(function* (
        input: ProcessSwapEventTradingVolumeServiceInput,
      ) {
        const filteredEvents = yield* filterTradingEventsService(input.events);
        const groupedByTransactionId = groupBy(
          filteredEvents,
          (event) => event.transactionId,
        );

        const items: TradingVolumeItem[] = [];

        for (const [transactionId, events] of Object.entries(
          groupedByTransactionId,
        )) {
          if (!events) continue;

          const item = processTransactionGroup(
            transactionId,
            events,
            input.highestFeePayerMap,
          );

          if (item) {
            items.push(item);
          }
        }

        if (items.length > 0) {
          yield* addTradingVolumeService(items);
        }
      });
    }),
  },
) {}

export const ProcessSwapEventTradingVolumeLive =
  ProcessSwapEventTradingVolumeService.Default;
