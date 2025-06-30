import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { transactionFees } from "db/incentives";
import { and, between, inArray, sum } from "drizzle-orm";
import BigNumber from "bignumber.js";

export type GetTransactionFeesServiceInput = {
  endTimestamp: Date;
  startTimestamp: Date;
  limit?: number;
  addresses?: string[];
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
  ) => Effect.Effect<GetTransactionFeesServiceOutput, DbError>
>() {}

export const GetTransactionFeesPaginatedLive = Layer.effect(
  GetTransactionFeesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      const limit = input.limit ?? 10_000;

      const andConditions = [
        between(
          transactionFees.timestamp,
          input.startTimestamp,
          input.endTimestamp
        ),
      ];

      if (input.addresses) {
        andConditions.push(
          inArray(transactionFees.accountAddress, input.addresses)
        );
      }

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
                .where(and(...andConditions))
                .groupBy(transactionFees.accountAddress)
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
            const fee = new BigNumber(r.totalFee ?? 0);
            const existingFee = accounts.get(r.accountAddress);
            if (existingFee) {
              accounts.set(r.accountAddress, existingFee.plus(fee));
            } else {
              accounts.set(r.accountAddress, fee);
            }
          }
          offset += limit;
        }

        return Array.from(accounts.entries()).map(([accountAddress, fee]) => ({
          accountAddress,
          fee,
        }));
      });
    };
  })
);
