import { Effect } from 'effect';
import { EventSignalUpgrade } from '../../common/dapps/surge/schemas';
import type { CommonEmittableEvents } from '../events/event-matchers/commonEventMatcher';
import type { CapturedEvent } from '../events/event-matchers/createEventMatcher';
import { parseEventData } from '../events/event-matchers/createEventMatcher';
import type { SurgeEmittableEvents } from '../events/event-matchers/surgeEventMatcher';
import type { EmittableEvent } from '../events/event-matchers/types';
import type { TransformedTransaction } from '../transaction-stream/transformEvent';
import { MarginAccountDbService } from './marginAccountDbService';
import {
  isSurgeComponent,
  SurgeComponentAddressService,
} from './surgeComponentAddressService';
import { UpdateMarginAccountOwnerService } from './updateMarginAccountOwner';

/**
 * Helper function to find the first transaction containing a SurgeUpgradeEvent.
 * Returns the index of the transaction, or -1 if no upgrade event is found.
 * Now checks against all known historical Surge component addresses.
 */
export const findFirstSurgeUpgradeTransaction = (
  transactions: TransformedTransaction[],
) => {
  for (const [i, transaction] of transactions.entries()) {
    for (const event of transaction.events) {
      if (
        isSurgeComponent(event.emitter.globalEmitter) &&
        event.event.name === 'EventSignalUpgrade'
      ) {
        return i;
      }
    }
  }
  return -1;
};

export class ProcessSurgeEventsService extends Effect.Service<ProcessSurgeEventsService>()(
  'ProcessSurgeEventsService',
  {
    dependencies: [
      SurgeComponentAddressService.Default,
      MarginAccountDbService.Default,
      UpdateMarginAccountOwnerService.Default,
    ],
    effect: Effect.gen(function* () {
      const surgeComponentService = yield* SurgeComponentAddressService;
      const marginAccountDbService = yield* MarginAccountDbService;
      const updateMarginAccountOwnerService =
        yield* UpdateMarginAccountOwnerService;

      return {
        /**
         * Processes Surge upgrade events to maintain the list of valid component addresses.
         * This should be called before processing other events to ensure all component addresses are known.
         */
        processSurgeUpgradeEvents: (transactions: TransformedTransaction[]) =>
          Effect.gen(function* () {
            for (const transaction of transactions) {
              for (const event of transaction.events) {
                // Check if this is an EventSignalUpgrade from any historical Surge component
                if (
                  isSurgeComponent(event.emitter.globalEmitter) &&
                  event.event.name === 'EventSignalUpgrade'
                ) {
                  yield* Effect.gen(function* () {
                    const upgradeEventData = yield* parseEventData(
                      event,
                      EventSignalUpgrade,
                    );
                    const eventDataItem = Array.isArray(
                      upgradeEventData.eventData.data,
                    )
                      ? upgradeEventData.eventData.data[0]
                      : upgradeEventData.eventData.data;
                    const newComponentAddress = eventDataItem.new_exchange;
                    yield* surgeComponentService.addComponentAddress(
                      newComponentAddress,
                    );

                    yield* Effect.logInfo(
                      `Processed Surge component upgrade: added new component address ${newComponentAddress}`,
                    );
                  }).pipe(
                    Effect.catchAll((error) =>
                      Effect.logError(
                        `Failed to process Surge upgrade event: ${error}`,
                      ),
                    ),
                  );
                }
              }
            }
          }),

        /**
         * Processes Surge-related events for margin account indexing.
         * Handles EventAccountCreation and SetRoleEvent to maintain margin account ownership records.
         */
        processSurgeAccountEvents: (events: CapturedEvent<EmittableEvent>[]) =>
          Effect.gen(function* () {
            // Process margin account indexing in order (EventAccountCreation and SetRoleEvent)
            yield* Effect.forEach(events, (event) =>
              Effect.gen(function* () {
                // Handle Surge EventAccountCreation
                if (event.dApp === 'Surge') {
                  const surgeEventData =
                    event.eventData as unknown as SurgeEmittableEvents;
                  if (surgeEventData.type === 'EventAccountCreation') {
                    const marginAccountAddress = surgeEventData.data.account;

                    yield* Effect.logInfo(
                      `Processing EventAccountCreation for margin account: ${marginAccountAddress}`,
                    );

                    // Determine the parent account using the UpdateMarginAccountOwnerService
                    const ownershipResults =
                      yield* updateMarginAccountOwnerService(
                        [marginAccountAddress],
                        { timestamp: new Date(event.timestamp) },
                      );

                    const ownership = ownershipResults[0];
                    if (!ownership) {
                      yield* Effect.logWarning(
                        `No ownership result found for margin account: ${marginAccountAddress}`,
                      );
                      return;
                    }

                    // Insert new ownership record
                    yield* marginAccountDbService.upsertMarginAccountOwnership({
                      marginAccountAddress: ownership.marginAccountAddress,
                      recoveryAccountAddress: ownership.recoveryAccountAddress,
                      collateralAccountAddress:
                        ownership.collateralAccountAddress,
                      tradingAccountAddress: ownership.tradingAccountAddress,
                      stateVersion: ownership.stateVersion,
                    });

                    yield* Effect.logInfo(
                      `Successfully processed margin account creation: ${marginAccountAddress} -> recovery: ${ownership.recoveryAccountAddress}, collateral: ${ownership.collateralAccountAddress}, trading: ${ownership.tradingAccountAddress}`,
                    );
                  }
                }

                // Handle Common SetRoleEvent for existing margin accounts
                if (event.dApp === 'Common') {
                  const commonEventData =
                    event.eventData as CommonEmittableEvents;
                  if (commonEventData.type === 'SetRoleEvent') {
                    const emitterAddress = event.globalEmitter;

                    // Check if the emitter is a margin account (exists in our database)
                    const existingMarginAccounts =
                      yield* marginAccountDbService.getMarginAccount(
                        emitterAddress,
                      );

                    if (existingMarginAccounts.length > 0) {
                      yield* Effect.logInfo(
                        `Processing SetRoleEvent for existing margin account: ${emitterAddress}`,
                      );

                      // Re-analyze the role assignments to update parent account relationship
                      const ownershipResults =
                        yield* updateMarginAccountOwnerService(
                          [emitterAddress],
                          { timestamp: new Date(event.timestamp) },
                        );

                      const ownership = ownershipResults[0];
                      if (!ownership) {
                        yield* Effect.logWarning(
                          `No ownership result found for margin account: ${emitterAddress}`,
                        );
                        return;
                      }

                      // Insert new ownership record
                      yield* marginAccountDbService.upsertMarginAccountOwnership(
                        {
                          marginAccountAddress: ownership.marginAccountAddress,
                          recoveryAccountAddress:
                            ownership.recoveryAccountAddress,
                          collateralAccountAddress:
                            ownership.collateralAccountAddress,
                          tradingAccountAddress:
                            ownership.tradingAccountAddress,
                          stateVersion: ownership.stateVersion,
                        },
                      );

                      yield* Effect.logInfo(
                        `Successfully updated margin account ownership: ${emitterAddress} -> recovery: ${ownership.recoveryAccountAddress}, collateral: ${ownership.collateralAccountAddress}, trading: ${ownership.tradingAccountAddress}`,
                      );
                    }
                  }
                }
              }),
            );
          }),
      };
    }),
  },
) {}

export const ProcessSurgeEventsServiceLive = ProcessSurgeEventsService.Default;
