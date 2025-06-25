import { Context, Effect, Layer } from "effect";
import {
  transformTransactions,
  type TransformedTransaction,
} from "./transformEvent";
import { DbClientService, DbError } from "../db/dbClient";
import { inArray } from "drizzle-orm";
import { type Account, accounts } from "db/incentives";
import type { CommittedTransactionInfo } from "@radixdlt/babylon-gateway-api-sdk";
import Bignumber from "bignumber.js";

export type RegisteredFeePayer = {
  txId: string;
  accountAddress: string;
  fee: Bignumber;
  timestamp: Date;
};

export type FilterTransactionsServiceOutput = {
  registeredAccounts: Account[];
  filteredTransactions: TransformedTransaction[];
  registeredFeePayers: RegisteredFeePayer[];
  stateVersion: number;
};

export class FilterTransactionsService extends Context.Tag(
  "FilterTransactionsService"
)<
  FilterTransactionsService,
  (input: {
    transactions: CommittedTransactionInfo[];
    stateVersion: number;
  }) => Effect.Effect<FilterTransactionsServiceOutput, DbError, DbClientService>
>() {}

type AccountAddress = string;
type TransactionId = string;

export const FilterTransactionsLive = Layer.effect(
  FilterTransactionsService,
  Effect.gen(function* () {
    const dbClient = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        const transactions = transformTransactions(input.transactions);
        const addressTransactionMap = new Map<
          AccountAddress,
          Set<TransactionId>
        >();

        for (const transaction of transactions) {
          for (const event of transaction.events) {
            const globalEmitter = event.emitter.globalEmitter;
            if (globalEmitter.startsWith("account_")) {
              const transactionIdSet =
                addressTransactionMap.get(globalEmitter) ??
                new Set<TransactionId>();
              transactionIdSet.add(transaction.transactionId);
              addressTransactionMap.set(globalEmitter, transactionIdSet);
            }
          }
        }

        const accountAddresses = Array.from(addressTransactionMap.keys());

        const registeredAccounts = yield* Effect.tryPromise({
          try: () =>
            dbClient
              .select()
              .from(accounts)
              .where(inArray(accounts.address, accountAddresses)),
          catch: (err) => new DbError(err),
        });

        const filteredTransactions: TransformedTransaction[] = [];
        const allRegisteredFeePayers: RegisteredFeePayer[] = [];

        for (const registeredAccount of registeredAccounts) {
          const transactionIdSet = addressTransactionMap.get(
            registeredAccount.address
          );
          if (!transactionIdSet) continue;

          const transaction = transactions.find((transaction) =>
            transactionIdSet.has(transaction.transactionId)
          );

          const registeredFeePayers = transactions
            .map((tx) => ({
              txId: tx.transactionId,
              accountAddress: registeredAccount.address,
              fee: (
                tx.feeBalanceChanges[registeredAccount.address] ??
                new Bignumber(0)
              ).multipliedBy(-1),
              timestamp: new Date(tx.round_timestamp),
            }))
            .filter((feePayer) => feePayer.fee.gt(0));

          const highestFeePayer = registeredFeePayers[0]
            ? registeredFeePayers?.reduce(
                (max, current) => (current.fee.gt(max.fee) ? current : max),
                registeredFeePayers[0]
              )?.accountAddress
            : undefined;

          allRegisteredFeePayers.push(...registeredFeePayers);

          if (transaction) {
            filteredTransactions.push({ ...transaction, highestFeePayer });
          }
        }

        return {
          registeredAccounts,
          filteredTransactions,
          stateVersion: input.stateVersion,
          registeredFeePayers: allRegisteredFeePayers,
        };
      });
    };
  })
);
