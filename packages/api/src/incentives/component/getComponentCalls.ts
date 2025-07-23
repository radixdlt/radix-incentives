import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { componentCalls } from "db/incentives";
import { and, between } from "drizzle-orm";

import { GetAccountAddressByUserIdService } from "../account/getAccountAddressByUserId";
import { ComponentWhitelistService } from "./componentWhitelist";

export type GetComponentCallsServiceInput = {
  endTimestamp: Date;
  startTimestamp: Date;
  limit?: number;
  addresses?: string[];
};

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
    const componentWhitelistService = yield* ComponentWhitelistService;

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
        });

        // Process each user's component calls, filter with whitelist
        const processedResult = yield* Effect.all(
          result.map((item) =>
            Effect.gen(function* () {
              const allComponents = item.data as ComponentAddress[];

              // Filter components using the efficient whitelist service
              const validComponents =
                yield* componentWhitelistService.filterComponents(
                  allComponents
                );

              return {
                userId: item.userId,
                componentCalls: validComponents.length,
              };
            })
          )
        );

        const userIdAccountAddressMap = yield* getAccountAddressByUserId(
          processedResult.map((item) => item.userId)
        );

        return processedResult
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
