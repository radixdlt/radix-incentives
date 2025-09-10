import { RootFinanceConstants, WeftFinanceConstants } from 'data';
import { Effect } from 'effect';
import type { AtLedgerState } from '../../common';
import { GetAddressByNonFungibleService } from '../../common/gateway/getAddressByNonFungible';
import { GetAccountsIntersectionService } from '../account/getAccountsIntersection';
import { MarginAccountDbService } from '../surge/marginAccountDbService';
import type { CommonEmittableEvents } from './event-matchers/commonEventMatcher';
import type { RootFinanceEmittableEvents } from './event-matchers/rootFinanceEventMatcher';
import type { SurgeEmittableEvents } from './event-matchers/surgeEventMatcher';
import type { WeftFinanceEmittableEvents } from './event-matchers/weftFinanceEventMatcher';
import type { EventQueueClientInput } from './eventQueueClient';
import { GetEventsFromDbService } from './queries/getEventsFromDb';

export class InvalidEventError {
  _tag = 'InvalidEventError';
  constructor(readonly message: string) {}
}

export type DeriveAccountFromEventInput = EventQueueClientInput;

export class DeriveAccountFromEventService extends Effect.Service<DeriveAccountFromEventService>()(
  'DeriveAccountFromEventService',
  {
    dependencies: [
      GetEventsFromDbService.Default,
      GetAddressByNonFungibleService.Default,
      GetAccountsIntersectionService.Default,
      MarginAccountDbService.Default,
    ],
    effect: Effect.gen(function* () {
      const getEventsFromDbService = yield* GetEventsFromDbService;
      const getAddressByNonFungibleService =
        yield* GetAddressByNonFungibleService;
      const getAccountsIntersectionService =
        yield* GetAccountsIntersectionService;
      const marginAccountDbService = yield* MarginAccountDbService;
      return Effect.fn(function* (input: DeriveAccountFromEventInput) {
        const events = yield* getEventsFromDbService(input);

        const accountAddresses = yield* Effect.forEach(events, (event) => {
          return Effect.gen(function* () {
            const getRegisteredAccountAddressFromNonFungible = (
              resourceAddress: string,
              nonFungibleId: string,
              at_ledger_state: AtLedgerState,
            ) =>
              Effect.gen(function* () {
                const result = yield* getAddressByNonFungibleService({
                  resourceAddress,
                  nonFungibleId,
                  at_ledger_state,
                });

                if (!result.address.startsWith('account_')) {
                  return null;
                }

                const registeredAccounts =
                  yield* getAccountsIntersectionService({
                    addresses: [result.address],
                  });

                // account is not registered in incentives program
                if (registeredAccounts.length === 0) {
                  yield* Effect.logDebug(
                    `Skipping ${result.address}, not registered in incentives program`,
                  );
                  return null;
                }

                return {
                  address: result.address,
                  timestamp: event.timestamp.toISOString(),
                };
              });

            if (event.dApp === 'Common') {
              const eventData = event.eventData as CommonEmittableEvents;

              if (eventData.type === 'SetRoleEvent') {
                const emitterAddress = event.globalEmitter;

                // Check if the emitter is a margin account (exists in our database)
                const existingMarginAccounts =
                  yield* marginAccountDbService.getMarginAccount(
                    emitterAddress,
                  );

                if (existingMarginAccounts.length > 0) {
                  yield* Effect.logInfo(
                    `Processing SetRoleEvent snapshot triggering for margin account: ${emitterAddress}`,
                  );

                  // Get the old and new collateral accounts for snapshot triggering
                  const oldCollateralAccount =
                    yield* marginAccountDbService.getCollateralAccountAtStateVersion(
                      emitterAddress,
                      event.stateVersion - 1, // Before this state version
                    );

                  const newCollateralAccount =
                    yield* marginAccountDbService.getCollateralAccountAtStateVersion(
                      emitterAddress,
                      event.stateVersion, // At current state version
                    );

                  const accountsToSnapshot = [];
                  if (oldCollateralAccount) {
                    const registeredOldAccounts =
                      yield* getAccountsIntersectionService({
                        addresses: [oldCollateralAccount],
                      });
                    if (registeredOldAccounts.length > 0) {
                      accountsToSnapshot.push(oldCollateralAccount);
                    }
                  }

                  if (
                    newCollateralAccount &&
                    newCollateralAccount !== oldCollateralAccount
                  ) {
                    const registeredNewAccounts =
                      yield* getAccountsIntersectionService({
                        addresses: [newCollateralAccount],
                      });
                    if (registeredNewAccounts.length > 0) {
                      accountsToSnapshot.push(newCollateralAccount);
                    }
                  }

                  if (accountsToSnapshot.length > 0) {
                    // Return all accounts as separate results for this event
                    return accountsToSnapshot.map((account) => ({
                      address: account,
                      timestamp: event.timestamp.toISOString(),
                      transactionId: event.transactionId,
                    }));
                  }
                }

                return {
                  timestamp: event.timestamp.toISOString(),
                  transactionId: event.transactionId,
                };
              }

              if (
                eventData.type === 'WithdrawNonFungibleEvent' ||
                eventData.type === 'DepositNonFungibleEvent' ||
                eventData.type === 'WithdrawFungibleEvent' ||
                eventData.type === 'DepositFungibleEvent'
              ) {
                const registeredAccounts =
                  yield* getAccountsIntersectionService({
                    addresses: [eventData.data.accountAddress],
                  });

                // account is not registered in incentives program
                if (registeredAccounts.length === 0) {
                  yield* Effect.logDebug(
                    `Skipping ${eventData.data.accountAddress}, not registered in incentives program`,
                  );
                  return {
                    timestamp: event.timestamp.toISOString(),
                    transactionId: event.transactionId,
                  };
                }

                return {
                  address: eventData.data.accountAddress,
                  timestamp: event.timestamp.toISOString(),
                  transactionId: event.transactionId,
                };
              }
            }

            // TODO: should only handle Liquidation events, rest is handled by withdraw/deposit events
            if (event.dApp === 'WeftFinance') {
              yield* Effect.logDebug('WeftFinance event', event.eventData);

              const eventData = (event.eventData as WeftFinanceEmittableEvents)
                .data[0];
              let nonFungibleId: string;

              if ('cdp_id' in eventData) {
                nonFungibleId = eventData.cdp_id;
              } else if (
                'nft_id' in eventData &&
                typeof eventData.nft_id === 'string'
              ) {
                nonFungibleId = eventData.nft_id;
              } else {
                return {
                  timestamp: event.timestamp.toISOString(),
                  transactionId: event.transactionId,
                };
              }

              const at_ledger_state = {
                timestamp: event.timestamp,
              };

              const result = yield* getRegisteredAccountAddressFromNonFungible(
                WeftFinanceConstants.v2.WeftyV2.resourceAddress,
                nonFungibleId,
                at_ledger_state,
              );

              if (result === null) {
                return {
                  timestamp: event.timestamp.toISOString(),
                  transactionId: event.transactionId,
                };
              }

              return {
                address: result.address,
                timestamp: event.timestamp.toISOString(),
                transactionId: event.transactionId,
              };
            }

            // TODO: should only handle Liquidation events, rest is handled by withdraw/deposit events
            if (event.dApp === 'RootFinance') {
              yield* Effect.logDebug('RootFinance event', event.eventData);

              const eventData = event.eventData as RootFinanceEmittableEvents;

              if (eventData.type === 'CDPUpdatedEvent') {
                const nonFungibleId = eventData.data.cdp_id;

                const at_ledger_state = {
                  timestamp: event.timestamp,
                };

                const result =
                  yield* getRegisteredAccountAddressFromNonFungible(
                    RootFinanceConstants.receiptResourceAddress,
                    nonFungibleId,
                    at_ledger_state,
                  );

                if (result === null) {
                  return {
                    timestamp: event.timestamp.toISOString(),
                    transactionId: event.transactionId,
                  };
                }

                return {
                  address: result.address,
                  timestamp: event.timestamp.toISOString(),
                  transactionId: event.transactionId,
                };
              }

              return {
                timestamp: event.timestamp.toISOString(),
                transactionId: event.transactionId,
              };
            }

            if (event.dApp === 'Surge') {
              const eventData =
                event.eventData as unknown as SurgeEmittableEvents;

              // For Surge events that trigger snapshots, we need to derive the collateral account
              if (
                eventData.type === 'EventLiquidate' ||
                eventData.type === 'EventMarginOrder' ||
                eventData.type === 'EventAutoDeleverage' ||
                eventData.type === 'EventAddCollateral' ||
                eventData.type === 'EventRemoveCollateral'
              ) {
                // Get collateral account for this margin account at this state version
                const collateralAccount =
                  yield* marginAccountDbService.getCollateralAccountAtStateVersion(
                    eventData.data.account,
                    event.stateVersion,
                  );

                if (collateralAccount) {
                  // Check if collateral account is registered
                  const registeredAccounts =
                    yield* getAccountsIntersectionService({
                      addresses: [collateralAccount],
                    });

                  if (registeredAccounts.length > 0) {
                    return {
                      address: collateralAccount,
                      timestamp: event.timestamp.toISOString(),
                      transactionId: event.transactionId,
                    };
                  }
                }
              }

              // For other Surge events or if no collateral account found (including EventAccountCreation)
              return {
                timestamp: event.timestamp.toISOString(),
                transactionId: event.transactionId,
              };
            }

            return {
              timestamp: event.timestamp.toISOString(),
              transactionId: event.transactionId,
            };
          });
        });

        return accountAddresses;
      });
    }),
  },
) {}

export const DeriveAccountFromEventLive = DeriveAccountFromEventService.Default;
