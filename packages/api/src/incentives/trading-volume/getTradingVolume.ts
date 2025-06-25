import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import type { ActivityId } from "db/incentives";
import { tradingVolume } from "db/incentives";
import { gte, inArray, lt, and } from "drizzle-orm";
import BigNumber from "bignumber.js";

export type GetTradingVolumeServiceInput = {
  endTimestamp: Date;
  startTimestamp: Date;
  limit?: number;
  addresses?: string[];
};

export type GetTradingVolumeServiceOutput = {
  accountAddress: string;
  activityId: ActivityId;
  usdValue: BigNumber;
}[];

export class GetTradingVolumeService extends Context.Tag(
  "GetTradingVolumeService"
)<
  GetTradingVolumeService,
  (
    input: GetTradingVolumeServiceInput
  ) => Effect.Effect<GetTradingVolumeServiceOutput, DbError>
>() {}

type AccountAddress = string;

export const GetTradingVolumeLive = Layer.effect(
  GetTradingVolumeService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        const limit = input.limit ?? 10_000;

        const andConditions = [
          gte(tradingVolume.timestamp, input.startTimestamp),
          lt(tradingVolume.timestamp, input.endTimestamp),
        ];

        if (input.addresses) {
          andConditions.push(
            inArray(tradingVolume.accountAddress, input.addresses)
          );
        }

        const getTradingVolumeData = (offset: number) =>
          Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(tradingVolume)
                .where(and(...andConditions))
                .limit(limit)
                .offset(offset)
                .then((result) =>
                  result.map((r) => ({
                    accountAddress: r.accountAddress,
                    data: r.data as {
                      activityId: ActivityId;
                      usdValue: string;
                    }[],
                  }))
                ),
            catch: (error) => new DbError(error),
          });

        let offset = 0;
        const accounts = new Map<AccountAddress, Map<ActivityId, BigNumber>>();

        while (true) {
          const result = yield* getTradingVolumeData(offset);
          if (result.length === 0) break;

          for (const item of result) {
            const accountAddress = item.accountAddress;

            const accountData =
              accounts.get(accountAddress) ?? new Map<ActivityId, BigNumber>();

            for (const data of item.data) {
              const existingValue = accountData.get(data.activityId);
              if (existingValue) {
                accountData.set(
                  data.activityId,
                  existingValue.plus(data.usdValue)
                );
              } else {
                accountData.set(data.activityId, new BigNumber(data.usdValue));
              }
            }

            accounts.set(accountAddress, accountData);
          }

          offset += limit;
        }

        return Array.from(accounts.entries()).flatMap(
          ([accountAddress, data]) =>
            Array.from(data.entries()).map(([activityId, usdValue]) => ({
              accountAddress,
              activityId,
              usdValue,
            }))
        );
      });
    };
  })
);
