import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import {
  DeriveAccountFromEventService,
  type DeriveAccountFromEventServiceError,
} from "./deriveAccountFromEvent";
import { events } from "db/incentives";
import { inArray } from "drizzle-orm";
import type { UnknownException } from "effect/Cause";
import { groupBy } from "effect/Array";

export type EventWorkerInput = {
  items: {
    transactionId: string;
    eventIndex: number;
  }[];
  addToSnapshotQueue: (input: {
    timestamp: string;
    addresses: string[];
  }) => Promise<void>;
};

export type EventWorkerError =
  | DeriveAccountFromEventServiceError
  | UnknownException;

export class EventWorkerService extends Context.Tag("EventWorkerService")<
  EventWorkerService,
  (input: EventWorkerInput) => Effect.Effect<void, EventWorkerError>
>() {}

export const EventWorkerLive = Layer.effect(
  EventWorkerService,
  Effect.gen(function* () {
    const deriveAccountFromEventService = yield* DeriveAccountFromEventService;
    const db = yield* DbClientService;
    return (input) =>
      Effect.gen(function* () {
        const result = yield* deriveAccountFromEventService(input.items);

        const addToSnapshotQueue = (job: {
          timestamp: string;
          addresses: string[];
        }) => Effect.tryPromise(() => input.addToSnapshotQueue(job));

        const groupedByTransactionId = groupBy(
          result,
          (item) => item.transactionId
        );

        for (const transactionId in groupedByTransactionId) {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          const transactions = groupedByTransactionId[transactionId]!;
          const addresses = Array.from(
            new Set(
              transactions
                .map((item) => item.address)
                .filter((item) => item !== undefined)
            )
          );

          if (addresses.length > 0) {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const timestamp = transactions[0]!.timestamp;
            yield* Effect.logDebug(
              `Adding ${addresses.length} accounts to snapshot queue for transaction ${transactionId} at ${timestamp}`
            );
            yield* addToSnapshotQueue({
              timestamp,
              addresses,
            });
          }
        }

        // clean up events after processing
        yield* Effect.tryPromise({
          try: () =>
            db.delete(events).where(
              inArray(
                events.transactionId,
                input.items.map(({ transactionId }) => transactionId)
              )
            ),
          catch: (error) => new DbError(error),
        });
      });
  })
);
