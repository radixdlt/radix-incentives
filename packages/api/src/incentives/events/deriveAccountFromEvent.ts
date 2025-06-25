import { Effect, Layer } from "effect";
import { Context } from "effect";
import type {
  EventQueueClientInput,
  EventQueueClientServiceError,
} from "./eventQueueClient";
import { GetEventsFromDbService } from "./queries/getEventsFromDb";
import type { DbClientService, DbError } from "../db/dbClient";
import type { GetNonFungibleLocationService } from "../../common/gateway/getNonFungibleLocation";
import type { GatewayError } from "../../common/gateway/errors";
import type { GatewayApiClientService } from "../../common/gateway/gatewayApiClient";
import {
  GetAddressByNonFungibleService,
  type GetAddressByNonFungibleServiceError,
} from "../../common/gateway/getAddressByNonFungible";
import { GetAccountsIntersectionService } from "../account/getAccountsIntersection";
import type { CommonEmittableEvents } from "./event-matchers/commonEventMatcher";
import type { WeftFinanceEmittableEvents } from "./event-matchers/weftFinanceEventMatcher";
import type { RootFinanceEmittableEvents } from "./event-matchers/rootFinanceEventMatcher";
import { WeftFinance } from "../../common/dapps/weftFinance/constants";
import { RootFinance } from "../../common/dapps/rootFinance/constants";
import type { AtLedgerState } from "../../common";
import type {
  InvalidResourceAddressError,
  PriceServiceApiError,
} from "../token-price/getUsdValue";
import type { GetUsdValueService } from "../token-price/getUsdValue";

export class InvalidEventError {
  _tag = "InvalidEventError";
  constructor(readonly message: string) {}
}

export type DeriveAccountFromEventInput = EventQueueClientInput;

export type DeriveAccountFromEventServiceDependencies =
  | DeriveAccountFromEventService
  | GetEventsFromDbService
  | DbClientService
  | GetNonFungibleLocationService
  | GatewayApiClientService
  | GetAccountsIntersectionService
  | GetUsdValueService;

export type DeriveAccountFromEventServiceError =
  | EventQueueClientServiceError
  | DbError
  | GatewayError
  | GetAddressByNonFungibleServiceError
  | InvalidEventError
  | InvalidResourceAddressError
  | PriceServiceApiError;

export class DeriveAccountFromEventService extends Context.Tag(
  "DeriveAccountFromEventService"
)<
  DeriveAccountFromEventService,
  (input: DeriveAccountFromEventInput) => Effect.Effect<
    {
      address: string;
      timestamp: string;
    }[],
    DeriveAccountFromEventServiceError,
    DeriveAccountFromEventServiceDependencies
  >
>() {}

export const DeriveAccountFromEventLive = Layer.effect(
  DeriveAccountFromEventService,
  Effect.gen(function* () {
    const getEventsFromDbService = yield* GetEventsFromDbService;
    const getAddressByNonFungibleService =
      yield* GetAddressByNonFungibleService;
    const getAccountsIntersectionService =
      yield* GetAccountsIntersectionService;

    return (input) =>
      Effect.gen(function* () {
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
                  return null;
                }

                return {
                  address: eventData.data.accountAddress,
                  timestamp: event.timestamp.toISOString(),
                };
              }
            }

            // Handled by withdraw/deposit events
            if (event.dApp === "Caviarnine") {
              return null;
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
                return yield* Effect.fail(
                  new InvalidEventError(
                    `${event.dApp}.${event.eventData.type} is not handled`
                  )
                );
              }

              const at_ledger_state = {
                timestamp: event.timestamp,
              };

              return yield* getRegisteredAccountAddressFromNonFungible(
                WeftFinance.v2.WeftyV2.resourceAddress,
                nonFungibleId,
                at_ledger_state
              );
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

                return yield* getRegisteredAccountAddressFromNonFungible(
                  RootFinance.receiptResourceAddress,
                  nonFungibleId,
                  at_ledger_state
                );
              }

              return yield* Effect.fail(
                new InvalidEventError(
                  `${event.dApp}.${event.eventData.type} is not handled`
                )
              );
            }

            return yield* Effect.fail(
              new InvalidEventError(`${event.dApp} is not handled`)
            );
          });
        });

        return accountAddresses.filter(
          (address): address is { address: string; timestamp: string } =>
            address !== null
        );
      });
  })
);
