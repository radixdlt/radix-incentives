import { Config, Effect, Ref } from 'effect';
import { AddComponentCallsService } from '../component/addComponentCalls';
import { ConfigService } from '../config/configService';
import { AddToEventQueueService } from '../events/addToEventQueue';
import { caviarnineEventMatcher } from '../events/event-matchers/caviarnineEventMatcher';
import { commonEventMatcher } from '../events/event-matchers/commonEventMatcher';
import type { CapturedEvent } from '../events/event-matchers/createEventMatcher';
import { defiPlazaEventMatcher } from '../events/event-matchers/defiPlazaEventMatcher';
import { hlpEventMatcher } from '../events/event-matchers/hlpEventMatcher';
import { ociswapEventMatcher } from '../events/event-matchers/ociswapEventMatcher';
import { rootFinanceEventMatcher } from '../events/event-matchers/rootFinanceEventMatcher';
import { surgeEventMatcher } from '../events/event-matchers/surgeEventMatcher';
import type { EmittableEvent } from '../events/event-matchers/types';
import { weftFinanceEventMatcher } from '../events/event-matchers/weftFinanceEventMatcher';
import { AddEventsToDbService } from '../events/queries/addEventToDb';
import {
  findFirstSurgeUpgradeTransaction,
  ProcessSurgeEventsService,
} from '../surge/processSurgeEvents';
import { ProcessSwapEventTradingVolumeService } from '../trading-volume/processSwapEventTradingVolume';
import { AddTransactionFeeService } from '../transaction-fee/addTransactionFee';
import { FilterTransactionsService } from './filterTransactions';
import { TransactionStreamService } from './transactionStream';
import {
  setTransactionStreamState,
  TransactionStreamLoopState,
} from './transactionStreamState';

export class TransactionStreamLoopService extends Effect.Service<TransactionStreamLoopService>()(
  'TransactionStreamLoopService',
  {
    dependencies: [
      TransactionStreamService.Default,
      ConfigService.Default,
      FilterTransactionsService.Default,
      AddEventsToDbService.Default,
      AddToEventQueueService.Default,
      AddTransactionFeeService.Default,
      AddComponentCallsService.Default,
      ProcessSwapEventTradingVolumeService.Default,
      ProcessSurgeEventsService.Default,
    ],
    effect: Effect.gen(function* () {
      const transactionStreamService = yield* TransactionStreamService;
      const configService = yield* ConfigService;
      const filterTransactionsService = yield* FilterTransactionsService;
      const addEventsToDbService = yield* AddEventsToDbService;
      const addToEventQueueService = yield* AddToEventQueueService;
      const addTransactionFeeService = yield* AddTransactionFeeService;
      const addComponentCallsService = yield* AddComponentCallsService;
      const processSwapEventTradingVolumeService =
        yield* ProcessSwapEventTradingVolumeService;
      const processSurgeEventsService = yield* ProcessSurgeEventsService;

      const eventProcessingEnabled = yield* Config.boolean(
        'TRANSACTION_STREAM_EVENT_PROCESSING_ENABLED',
      ).pipe(Config.withDefault(true));

      return {
        run: Effect.fn(function* () {
          const currentState = yield* Ref.get(
            yield* TransactionStreamLoopState,
          );

          if (currentState === 'STARTING') {
            yield* setTransactionStreamState('RUNNING');
          }

          while (
            yield* Ref.get(yield* TransactionStreamLoopState).pipe(
              Effect.map((state) => state === 'RUNNING'),
            )
          ) {
            const stateVersion = yield* configService.getStateVersion();

            if (!stateVersion)
              return yield* Effect.dieMessage(
                'no state version found, killing streamer',
              );

            // transactions which registered accounts are involved in
            const {
              filteredTransactions,
              stateVersion: nextStateVersion,
              registeredFeePayers,
            } = yield* transactionStreamService(stateVersion).pipe(
              Effect.flatMap(filterTransactionsService),
            );

            if (filteredTransactions.length > 0 && eventProcessingEnabled) {
              // remove duplicate transactions using Map for O(n) performance
              const transactionMap = new Map(
                filteredTransactions
                  .filter((tx) => tx.status === 'CommittedSuccess')
                  .map((transaction) => [
                    transaction.transactionId,
                    transaction,
                  ]),
              );
              const uniqueTransactions = Array.from(transactionMap.values());

              // Check if there's a SurgeUpgradeEvent in this batch and process it first
              const upgradeTransactionIndex =
                findFirstSurgeUpgradeTransaction(uniqueTransactions);

              if (upgradeTransactionIndex !== -1) {
                yield* Effect.logInfo(
                  `Found SurgeUpgradeEvent at transaction ${upgradeTransactionIndex}. Processing upgrade events and updating component addresses.`,
                );

                // Process upgrade events to get new component addresses
                yield* processSurgeEventsService.processSurgeUpgradeEvents(
                  uniqueTransactions,
                );

                yield* Effect.logInfo(
                  `Surge upgrade processing complete. All event matchers now support both old and new component addresses.`,
                );
              }

              // Process all event matchers in parallel - they now handle all historical component addresses
              const [
                weftFinanceEvents,
                rootFinanceEvents,
                caviarnineEvents,
                hlpEvents,
                defiPlazaEvents,
                ociswapEvents,
                commonEvents,
                surgeEvents,
              ] = yield* Effect.all([
                weftFinanceEventMatcher(uniqueTransactions),
                rootFinanceEventMatcher(uniqueTransactions),
                caviarnineEventMatcher(uniqueTransactions),
                hlpEventMatcher(uniqueTransactions),
                defiPlazaEventMatcher(uniqueTransactions),
                ociswapEventMatcher(uniqueTransactions),
                commonEventMatcher(uniqueTransactions),
                surgeEventMatcher(uniqueTransactions),
              ]);

              // concat all captured events
              const allCapturedEvents = [
                ...caviarnineEvents,
                ...hlpEvents,
                ...defiPlazaEvents,
                ...ociswapEvents,
                ...weftFinanceEvents,
                ...rootFinanceEvents,
                ...commonEvents,
                ...surgeEvents,
              ] as CapturedEvent<EmittableEvent>[];

              // Process Surge events for margin account indexing
              yield* processSurgeEventsService.processSurgeAccountEvents(
                allCapturedEvents,
              );

              const highestFeePayerMap = new Map<string, string>();

              for (const transaction of uniqueTransactions) {
                if (transaction.highestFeePayer) {
                  highestFeePayerMap.set(
                    transaction.transactionId,
                    transaction.highestFeePayer,
                  );
                }
              }

              yield* processSwapEventTradingVolumeService({
                events: allCapturedEvents,
                highestFeePayerMap,
              });

              if (allCapturedEvents.length > 0) {
                yield* addEventsToDbService(allCapturedEvents);

                yield* Effect.log(
                  'adding events to event queue',
                  allCapturedEvents.map((item) => ({
                    dApp: item.dApp,
                    eventData: item.eventData.type,
                    transactionId: item.transactionId,
                    eventIndex: item.eventIndex,
                  })),
                );
                yield* addToEventQueueService(
                  allCapturedEvents.map((event) => ({
                    transactionId: event.transactionId,
                    eventIndex: event.eventIndex,
                  })),
                );
              }

              const componentCalls = uniqueTransactions
                .map((tx) => ({
                  accountAddress: tx.highestFeePayer,
                  componentAddresses: tx.componentAddresses,
                  timestamp: new Date(tx.round_timestamp),
                }))
                .filter(
                  (
                    item,
                  ): item is {
                    accountAddress: string;
                    componentAddresses: string[];
                    timestamp: Date;
                  } =>
                    item.accountAddress !== undefined &&
                    item.componentAddresses.length > 0,
                );

              if (componentCalls.length > 0) {
                yield* addComponentCallsService(componentCalls);
              }
            }

            if (registeredFeePayers.length > 0) {
              yield* addTransactionFeeService(registeredFeePayers);
            }

            if (nextStateVersion !== stateVersion) {
              // updates state version and continue loop
              yield* configService.setStateVersion(nextStateVersion);
            }
          }
        }),
      };
    }),
  },
) {}
