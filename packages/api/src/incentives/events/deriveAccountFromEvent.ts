import { Effect } from "effect";
import type { EventQueueClientInput } from "./eventQueueClient";
import { GetEventsFromDbService } from "./queries/getEventsFromDb";
import { GetAddressByNonFungibleService } from "../../common/gateway/getAddressByNonFungible";
import { GetAccountsIntersectionService } from "../account/getAccountsIntersection";
import type { CommonEmittableEvents } from "./event-matchers/commonEventMatcher";
import type { WeftFinanceEmittableEvents } from "./event-matchers/weftFinanceEventMatcher";
import type { RootFinanceEmittableEvents } from "./event-matchers/rootFinanceEventMatcher";
import { WeftFinanceConstants, RootFinanceConstants } from "data";
import type { AtLedgerState } from "../../common";

export class InvalidEventError {
  _tag = "InvalidEventError";
  constructor(readonly message: string) {}
}

export type DeriveAccountFromEventInput = EventQueueClientInput;

export class DeriveAccountFromEventService extends Effect.Service<DeriveAccountFromEventService>()(
  "DeriveAccountFromEventService",
  {
    effect: Effect.gen(function* () {
      const getEventsFromDbService = yield* GetEventsFromDbService;
      const getAddressByNonFungibleService =
        yield* GetAddressByNonFungibleService;
      const getAccountsIntersectionService =
        yield* GetAccountsIntersectionService;
      return Effect.fn(function* (input: DeriveAccountFromEventInput) {
        const events = yield* getEventsFromDbService(input);

        const accountAddresses = yield* Effect.forEach(events, (event) => {
          return Effect.gen(function* () {
            const getRegisteredAccountAddressFromNonFungible = (
              resourceAddress: string,
              nonFungibleId: string,
              at_ledger_state: AtLedgerState
            ) =>
              Effect.gen(function* () {
                const result = yield* getAddressByNonFungibleService({
                  resourceAddress,
                  nonFungibleId,
                  at_ledger_state,
                });

                if (!result.address.startsWith("account_")) {
                  return null;
                }

                const registeredAccounts =
                  yield* getAccountsIntersectionService({
                    addresses: [result.address],
                  });

                // account is not registered in incentives program
                if (registeredAccounts.length === 0) {
                  yield* Effect.log(
                    `Skipping ${result.address}, not registered in incentives program`
                  );
                  return null;
                }

                return {
                  address: result.address,
                  timestamp: event.timestamp.toISOString(),
                };
              });

            if (event.dApp === "Common") {
              const eventData = event.eventData as CommonEmittableEvents;

              if (
                eventData.type === "WithdrawNonFungibleEvent" ||
                eventData.type === "DepositNonFungibleEvent" ||
                eventData.type === "WithdrawFungibleEvent" ||
                eventData.type === "DepositFungibleEvent"
              ) {
                const registeredAccounts =
                  yield* getAccountsIntersectionService({
                    addresses: [eventData.data.accountAddress],
                  });

                // account is not registered in incentives program
                if (registeredAccounts.length === 0) {
                  yield* Effect.log(
                    `Skipping ${eventData.data.accountAddress}, not registered in incentives program`
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
            if (event.dApp === "WeftFinance") {
              yield* Effect.log("WeftFinance event", event.eventData);

              const eventData = (event.eventData as WeftFinanceEmittableEvents)
                .data[0];
              let nonFungibleId: string;

              if ("cdp_id" in eventData) {
                nonFungibleId = eventData.cdp_id;
              } else if (
                "nft_id" in eventData &&
                typeof eventData.nft_id === "string"
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
                at_ledger_state
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
            if (event.dApp === "RootFinance") {
              yield* Effect.log("RootFinance event", event.eventData);

              const eventData = event.eventData as RootFinanceEmittableEvents;

              if (eventData.type === "CDPUpdatedEvent") {
                const nonFungibleId = eventData.data.cdp_id;

                const at_ledger_state = {
                  timestamp: event.timestamp,
                };

                const result =
                  yield* getRegisteredAccountAddressFromNonFungible(
                    RootFinanceConstants.receiptResourceAddress,
                    nonFungibleId,
                    at_ledger_state
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

            return {
              timestamp: event.timestamp.toISOString(),
              transactionId: event.transactionId,
            };
          });
        });

        return accountAddresses;
      });
    }),
  }
) {}

export const DeriveAccountFromEventLive = DeriveAccountFromEventService.Default;
