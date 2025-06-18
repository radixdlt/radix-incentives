import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { transactionFees } from "db/incentives";
import { and, gte, lt, sum } from "drizzle-orm";
import BigNumber from "bignumber.js";

export type GetTransactionFeesServiceInput = {
  endTimestamp: Date;
  startTimestamp: Date;
  limit?: number;
};

export type GetTransactionFeesServiceOutput = {
  accountAddress: string;
  fee: BigNumber;
}[];

export class GetTransactionFeesService extends Context.Tag(
  "GetTransactionFeesService"
)<
  GetTransactionFeesService,
  (
    input: GetTransactionFeesServiceInput
  ) => Effect.Effect<GetTransactionFeesServiceOutput, DbError, DbClientService>
>() {}

export const GetTransactionFeesPaginatedLive = Layer.effect(
  GetTransactionFeesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      const limit = input.limit ?? 10_000;

      return Effect.gen(function* () {
        const getData = (offset: number) =>
          Effect.tryPromise({
            try: () =>
              db
                .select({
                  accountAddress: transactionFees.accountAddress,
                  totalFee: sum(transactionFees.fee),
                })
                .from(transactionFees)
                .where(
                  and(
                    gte(transactionFees.timestamp, input.startTimestamp),
                    lt(transactionFees.timestamp, input.endTimestamp)
                  )
                )
                .groupBy(transactionFees.accountAddress)
                .limit(limit)
                .offset(offset),
            catch: (error) => new DbError(error),
          });

        let offset = 0;
        const accounts: GetTransactionFeesServiceOutput = [];

        while (true) {
          const data = yield* getData(offset);
          if (data.length === 0) break;
          for (const r of data) {
            const fee = new BigNumber(r.totalFee ?? 0);
            accounts.push({ accountAddress: r.accountAddress, fee });
          }
          offset += 1000;
        }

        return accounts;
      });
    };
  })
);
