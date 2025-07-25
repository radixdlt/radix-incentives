import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { DeriveAccountFromEventService } from "./deriveAccountFromEvent";
import { events } from "db/incentives";
import { inArray } from "drizzle-orm";
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

export class EventWorkerService extends Effect.Service<EventWorkerService>()(
  "EventWorkerService",
  {
    effect: Effect.gen(function* () {
      const deriveAccountFromEventService =
        yield* DeriveAccountFromEventService;
      const db = yield* DbClientService;
      return Effect.fn(function* (input: EventWorkerInput) {
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
          const transactions = groupedByTransactionId[transactionId];
          if (!transactions || transactions.length === 0) continue;
          const addresses = Array.from(
            new Set(
              transactions
                .map((item) => item.address)
                .filter((item) => item !== undefined)
            )
          );

          if (addresses.length > 0) {
            const firstTransaction = transactions[0];
            if (!firstTransaction) continue;
            const timestamp = firstTransaction.timestamp;
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
    }),
  }
) {}

export const EventWorkerLive = EventWorkerService.Default;
