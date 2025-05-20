import type {
  TransformedEvent,
  TransformedTransaction,
} from "../transformEvent";
import type {
  StructDefinition,
  StructSchema,
} from "@calamari-radix/sbor-ez-mode/dist/schemas/struct";
import type { OrderedTupleSchema } from "@calamari-radix/sbor-ez-mode/dist/schemas/orderedTuple";
import { Effect } from "effect";

export type CapturedEvent<U> = {
  dApp: string;
  category: string;
  globalEmitter: string;
  packageAddress: string;
  blueprint: string;
  eventName: string;
  eventData: U;
  eventIndex: number;
  transactionId: string;
  stateVersion: number;
  timestamp: Date;
  activityId: string;
};

export type ParseEventDataOutput<
  T extends StructDefinition,
  R extends boolean,
> = ReturnType<typeof parseEventData<T, R>>;

export class FailedToParseEventDataError {
  readonly _tag = "FailedToParseEventDataError";
  constructor(readonly error: unknown) {}
}

export const parseEventData = <T extends StructDefinition, R extends boolean>(
  event: TransformedEvent,
  schema: OrderedTupleSchema<[StructSchema<T, R>]>
) => {
  return Effect.gen(function* () {
    const parsedResult = schema.safeParse(event.event.payload);

    if (parsedResult.isErr()) {
      return yield* Effect.fail(
        new FailedToParseEventDataError(parsedResult.error)
      );
    }

    return {
      globalEmitter: event.emitter.globalEmitter,
      packageAddress: event.package.address,
      blueprint: event.package.blueprint,
      eventName: event.event.name,
      eventData: parsedResult.value,
    };
  });
};

export type EventMatcherFn<T extends StructDefinition, R extends boolean> = (
  event: TransformedEvent
) => ParseEventDataOutput<T, R> | undefined;

export const createEventMatcher =
  <T>(
    metadata: {
      dApp: string;
      category: string;
      activityId: string;
    },
    matcherFn: (
      event: TransformedEvent
    ) => Effect.Effect<
      CapturedEvent<T>["eventData"] | null,
      FailedToParseEventDataError
    >
  ) =>
  (transactions: TransformedTransaction[]) => {
    return Effect.gen(function* () {
      const matchedTransactions = yield* Effect.forEach(
        transactions,
        (transaction) =>
          Effect.forEach(transaction.events, (event, index) => {
            return Effect.gen(function* () {
              const value = yield* matcherFn(event);

              if (value === null) return null;

              return {
                dApp: metadata.dApp,
                category: metadata.category,
                activityId: metadata.activityId,
                transactionId: transaction.transactionId,
                stateVersion: transaction.stateVersion,
                timestamp: new Date(transaction.round_timestamp),
                eventIndex: index,
                ...value,
              };
            });
          }).pipe(Effect.map((item) => item.filter((item) => item !== null)))
      );
      return matchedTransactions.flat();
    });
  };
