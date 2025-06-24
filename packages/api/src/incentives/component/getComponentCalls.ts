import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { componentCalls } from "db/incentives";
import { and, gte, inArray, lt, sum } from "drizzle-orm";
import BigNumber from "bignumber.js";

export type GetComponentCallsServiceInput = {
  endTimestamp: Date;
  startTimestamp: Date;
  limit?: number;
  addresses?: string[];
};

export type GetComponentCallsServiceOutput = {
  accountAddress: string;
  calls: BigNumber;
}[];

export class GetComponentCallsService extends Context.Tag(
  "GetComponentCallsService"
)<
  GetComponentCallsService,
  (
    input: GetComponentCallsServiceInput
  ) => Effect.Effect<GetComponentCallsServiceOutput, DbError, DbClientService>
>() {}

export const GetComponentCallsPaginatedLive = Layer.effect(
  GetComponentCallsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      const limit = input.limit ?? 10_000;

      const andConditions = [
        gte(componentCalls.timestamp, input.startTimestamp),
        lt(componentCalls.timestamp, input.endTimestamp),
      ];

      if (input.addresses) {
        andConditions.push(
          inArray(componentCalls.accountAddress, input.addresses)
        );
      }

      return Effect.gen(function* () {
        const getData = (offset: number) =>
          Effect.tryPromise({
            try: () =>
              db
                .select({
                  accountAddress: componentCalls.accountAddress,
                  calls: sum(componentCalls.calls),
                })
                .from(componentCalls)
                .where(and(...andConditions))
                .groupBy(componentCalls.accountAddress)
                .limit(limit)
                .offset(offset),
            catch: (error) => new DbError(error),
          });

        let offset = 0;
        const accounts = new Map<string, BigNumber>();

        while (true) {
          const data = yield* getData(offset);
          if (data.length === 0) break;
          for (const r of data) {
            const calls = new BigNumber(r.calls ?? 0);
            const existingCalls = accounts.get(r.accountAddress);
            if (existingCalls) {
              accounts.set(r.accountAddress, existingCalls.plus(calls));
            } else {
              accounts.set(r.accountAddress, calls);
            }
          }
          offset += 1000;
        }

        return Array.from(accounts.entries()).map(
          ([accountAddress, calls]) => ({
            accountAddress,
            calls,
          })
        );
      });
    };
  })
);
