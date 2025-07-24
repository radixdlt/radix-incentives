import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { startOfISOWeek, endOfISOWeek } from "date-fns";
import { utc } from "@date-fns/utc";

import { componentCalls } from "db/incentives";
import { inArray, sql, and, between } from "drizzle-orm";
import { GetUserIdByAccountAddressService } from "../user/getUserIdByAccountAddress";
import { groupBy } from "effect/Array";

export type AddComponentCallsServiceInput = {
  accountAddress: string;
  timestamp: Date;
  componentAddresses: string[];
}[];

export class AddComponentCallsService extends Context.Tag(
  "AddComponentCallsService"
)<
  AddComponentCallsService,
  (input: AddComponentCallsServiceInput) => Effect.Effect<void, DbError>
>() {}

type UserId = string;
type ComponentAddress = string;

export const AddComponentCallsLive = Layer.effect(
  AddComponentCallsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const getUserIdByAccountAddress = yield* GetUserIdByAccountAddressService;

    return (input) => {
      return Effect.gen(function* () {
        if (input.length === 0) return;

        const accountAddressUserIdMap = yield* getUserIdByAccountAddress(
          input.map((item) => item.accountAddress)
        );

        const groupedByWeek = new Map<
          string,
          {
            items: {
              accountAddress: string;
              componentAddresses: string[];
            }[];
            startDate: Date;
            endDate: Date;
          }
        >();

        for (const item of input) {
          const startDate = startOfISOWeek(item.timestamp, { in: utc });
          const endDate = endOfISOWeek(item.timestamp, { in: utc });
          const startDateString = startDate.toISOString();

          const weekGroup = groupedByWeek.get(startDateString);

          if (!weekGroup) {
            groupedByWeek.set(startDateString, {
              items: [
                {
                  accountAddress: item.accountAddress,
                  componentAddresses: item.componentAddresses,
                },
              ],
              startDate,
              endDate,
            });
          } else {
            weekGroup.items.push({
              accountAddress: item.accountAddress,
              componentAddresses: item.componentAddresses,
            });
          }
        }

        const dbEntries: {
          userId: string;
          data: string[];
          timestamp: Date;
        }[] = [];

        for (const [, weekGroup] of groupedByWeek) {
          const userIds = weekGroup.items
            .map((item) => accountAddressUserIdMap.get(item.accountAddress))
            .filter((userId) => userId !== undefined);

          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  userId: componentCalls.userId,
                  data: componentCalls.data,
                })
                .from(componentCalls)
                .where(
                  and(
                    inArray(componentCalls.userId, userIds),
                    between(
                      componentCalls.timestamp,
                      weekGroup.startDate,
                      weekGroup.endDate
                    )
                  )
                ),
            catch: (error) => new DbError(error),
          });

          const componentCallMap = new Map<UserId, Set<ComponentAddress>>();

          for (const { userId, data } of result) {
            const componentCalls = new Set(data as ComponentAddress[]);
            const existing = componentCallMap.get(userId);
            if (!existing) {
              componentCallMap.set(userId, componentCalls);
            } else {
              for (const componentCall of componentCalls) {
                existing.add(componentCall);
              }
            }
          }

          for (const item of weekGroup.items) {
            const userId = accountAddressUserIdMap.get(item.accountAddress);
            if (!userId) continue;
            let existing = componentCallMap.get(userId);

            if (!existing) {
              existing = new Set(item.componentAddresses);
              componentCallMap.set(userId, existing);
            } else {
              for (const componentAddress of item.componentAddresses) {
                existing.add(componentAddress);
              }
            }

            dbEntries.push({
              userId,
              data: Array.from(existing),
              timestamp: weekGroup.startDate,
            });
          }
        }

        if (dbEntries.length === 0) return;

        // Handle duplicate inserts for the same user
        const itemsToInsert = Object.values(
          groupBy(dbEntries, (item) => item.userId)
        ).map((userComponentCalls) => {
          const componentCalls = userComponentCalls.reduce((acc, item) => {
            for (const componentCall of item.data) {
              acc.add(componentCall);
            }
            return acc;
          }, new Set<string>());
          return {
            userId: userComponentCalls[0].userId,
            data: Array.from(componentCalls),
            timestamp: userComponentCalls[0].timestamp,
          };
        });

        yield* Effect.tryPromise({
          try: () =>
            db
              .insert(componentCalls)
              .values(itemsToInsert)
              .onConflictDoUpdate({
                target: [componentCalls.userId, componentCalls.timestamp],
                set: { data: sql`excluded.data` },
              }),
          catch: (error) => new DbError(error),
        });

        return;
      });
    };
  })
);
