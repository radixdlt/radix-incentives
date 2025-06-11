import { Effect, Layer } from "effect";
import { Context } from "effect";
import type {
  EventQueueClientInput,
  EventQueueClientServiceError,
} from "./eventQueueClient";
import { GetEventsFromDbService } from "./queries/getEventsFromDb";
import type { DbClientService, DbError } from "../db/dbClient";
import type { GetNonFungibleLocationService } from "../../common/gateway/getNonFungibleLocation";
import type { CaviarnineEmittableEvents } from "./event-matchers/caviarnineEventMatcher";
import { shapeLiquidityComponentSet } from "../../common/dapps/caviarnine/constants";
import type { GatewayError } from "../../common/gateway/errors";
import type { GatewayApiClientService } from "../../common/gateway/gatewayApiClient";
import {
  GetAddressByNonFungibleService,
  type GetAddressByNonFungibleServiceError,
} from "../../common/gateway/getAddressByNonFungible";
import { GetAccountsIntersectionService } from "../account/getAccountsIntersection";

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
  | GetAccountsIntersectionService;

export type DeriveAccountFromEventServiceError =
  | EventQueueClientServiceError
  | DbError
  | GatewayError
  | GetAddressByNonFungibleServiceError
  | InvalidEventError;

export class DeriveAccountFromEventService extends Context.Tag(
  "DeriveAccountFromEventService"
)<
  DeriveAccountFromEventService,
  (input: DeriveAccountFromEventInput) => Effect.Effect<
    {
      address: string;
      activityId: string;
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
            if (event.dApp === "Caviarnine") {
              const eventData = event.eventData as CaviarnineEmittableEvents;

              const at_ledger_state = {
                timestamp: event.timestamp,
              };

              if (
                eventData.type === "WithdrawNonFungibleEvent" ||
                eventData.type === "DepositNonFungibleEvent"
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
                  activityId: event.activityId,
                  timestamp: event.timestamp.toISOString(),
                };
              }

              const nonFungibleId = eventData.data.liquidity_receipt_id;
              const pool = shapeLiquidityComponentSet.get(event.globalEmitter);

              if (!pool) {
                return yield* Effect.fail(
                  new InvalidEventError(
                    `${event.globalEmitter} is not a whitelisted c9 pool address`
                  )
                );
              }

              const result = yield* getAddressByNonFungibleService({
                resourceAddress: pool.liquidity_receipt,
                nonFungibleId,
                at_ledger_state,
              });

              // NFT was not held by an account, e.g. ignition component
              // txid_rdx1h92lf9sn36x3msjke5patuqkeu6y36pd6zl8kr30cle4d64ggpnsddafk4
              if (!result.address.startsWith("account_")) {
                return null;
              }

              const registeredAccounts = yield* getAccountsIntersectionService({
                addresses: [result.address],
              });

              // account is not registered in incentives program
              if (registeredAccounts.length === 0) {
                return null;
              }

              return {
                address: result.address,
                activityId: event.activityId,
                timestamp: event.timestamp.toISOString(),
              };
            }
            return yield* Effect.fail(
              new InvalidEventError(`${event.dApp} is not handled`)
            );
          });
        });

        return accountAddresses.filter((address) => address !== null);
      });
  })
);
