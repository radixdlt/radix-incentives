import BigNumber from 'bignumber.js';
import type { ActivityId } from 'data';
import { Effect } from 'effect';
import { groupBy } from 'effect/Array';
import type { DbError } from '../db/dbClient';
import type { CapturedEvent } from '../events/event-matchers/createEventMatcher';
import type { EmittableEvent } from '../events/event-matchers/types';
import { AddTradingVolumeService } from './addTradingVolume';
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
 * Service that processes swap events to calculate trading volumes per account and activity
 * Each event gets attributed to its specific account (trading account for Surge, fee payer for others)
 * Groups events by account+timestamp and aggregates USD values by activity before persisting
 */
export class ProcessSwapEventTradingVolumeService extends Effect.Service<ProcessSwapEventTradingVolumeService>()(
  'ProcessSwapEventTradingVolumeService',
  {
    dependencies: [
      AddTradingVolumeService.Default,
      FilterTradingEventsService.Default,
    ],
    effect: Effect.gen(function* () {
      const addTradingVolumeService = yield* AddTradingVolumeService;
      const filterTradingEventsService = yield* FilterTradingEventsService;

      return Effect.fn(function* (
        input: ProcessSwapEventTradingVolumeServiceInput,
      ) {
        const filteredEvents = yield* filterTradingEventsService(input.events);

        // Create a map to group events by account address and timestamp
        const groupedByAccountAndTime = new Map<
          string,
          TradingEventWithTokens[]
        >();

        // Process each event individually with its own account
        for (const event of filteredEvents) {
          // For Surge events, use the account address from the event (trading account)
          // For other events, use the highest fee payer
          const accountAddress =
            event.accountAddress ||
            input.highestFeePayerMap.get(event.transactionId);

          if (!accountAddress) continue;

          const key = `${accountAddress}-${event.timestamp.getTime()}`;
          if (!groupedByAccountAndTime.has(key)) {
            groupedByAccountAndTime.set(key, []);
          }
          groupedByAccountAndTime.get(key)!.push(event);
        }

        const items: TradingVolumeItem[] = [];

        // Convert grouped events to TradingVolumeItems
        for (const [_, events] of groupedByAccountAndTime) {
          if (!events.length) continue;

          const accountAddress =
            events[0]!.accountAddress ||
            input.highestFeePayerMap.get(events[0]!.transactionId);

          if (!accountAddress) continue;

          const data = aggregateEventsByActivity(events);
          if (!data.length) continue;

          items.push({
            timestamp: events[0]!.timestamp,
            accountAddress,
            data,
          });
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
