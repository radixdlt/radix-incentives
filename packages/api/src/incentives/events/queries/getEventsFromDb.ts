import { type Event, events } from 'db/incentives';
import { and, eq, or } from 'drizzle-orm';
import { Context, Effect, Layer } from 'effect';
import SuperJSON from 'superjson';
import { DbClientService, DbError } from '../../db/dbClient';
import type { EmittableEvent } from '../event-matchers/types';

export type GetEventsFromDbOutput = (Omit<Event, 'eventData'> & {
  eventData: EmittableEvent;
})[];

export class GetEventsFromDbService extends Context.Tag(
  'GetEventsFromDbService',
)<
  GetEventsFromDbService,
  (
    input: {
      transactionId: string;
      eventIndex: number;
    }[],
  ) => Effect.Effect<GetEventsFromDbOutput, DbError>
>() {}

export const GetEventsFromDbLive = Layer.effect(
  GetEventsFromDbService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            db.query.events.findMany({
              where: or(
                ...input.map((item) =>
                  and(
                    eq(events.transactionId, item.transactionId),
                    eq(events.eventIndex, item.eventIndex),
                  ),
                ),
              ),
            }),
          catch: (error) => new DbError(error),
        });

        const parsedData = result.map((item) => ({
          ...item,
          eventData: SuperJSON.deserialize({
            // @ts-ignore
            json: item.eventData.json,
            // @ts-ignore
            meta: item.eventData.meta,
          }) as EmittableEvent,
        }));

        return parsedData;
      });
    };
  }),
);
