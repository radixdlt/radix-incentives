import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { componentCalls } from "db/incentives";
import { and, between } from "drizzle-orm";

import { GetAccountAddressByUserIdService } from "../account/getAccountAddressByUserId";

export type GetComponentCallsServiceInput = {
  endTimestamp: Date;
  startTimestamp: Date;
  limit?: number;
  addresses?: string[];
};

type UserId = string;
type ComponentAddress = string;

export type GetComponentCallsServiceOutput = {
  componentCalls: number;
  accountAddress: string;
}[];

export class GetComponentCallsService extends Context.Tag(
  "GetComponentCallsService"
)<
  GetComponentCallsService,
  (
    input: GetComponentCallsServiceInput
  ) => Effect.Effect<GetComponentCallsServiceOutput, DbError>
>() {}

export const GetComponentCallsPaginatedLive = Layer.effect(
  GetComponentCallsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const getAccountAddressByUserId = yield* GetAccountAddressByUserIdService;

    return (input) => {
      return Effect.gen(function* () {
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
                  between(
                    componentCalls.timestamp,
                    input.startTimestamp,
                    input.endTimestamp
                  )
                )
              ),
          catch: (error) => new DbError(error),
        }).pipe(
          Effect.map((items) => {
            return items.reduce<{ userId: UserId; componentCalls: number }[]>(
              (acc, curr) => {
                const componentCalls = curr.data as ComponentAddress[];
                acc.push({
                  userId: curr.userId,
                  componentCalls: componentCalls.length,
                });
                return acc;
              },
              []
            );
          })
        );

        const userIdAccountAddressMap = yield* getAccountAddressByUserId(
          result.map((item) => item.userId)
        );

        return result
          .map((item) => {
            const accountAddresses = userIdAccountAddressMap.get(item.userId);
            if (!accountAddresses) return null;

            const accountAddress = Array.from(accountAddresses)[0];
            if (!accountAddress) return null;

            return {
              componentCalls: item.componentCalls,
              accountAddress,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);
      });
    };
  })
);
