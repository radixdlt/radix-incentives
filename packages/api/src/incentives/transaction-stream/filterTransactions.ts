import { Context, Effect, Layer } from "effect";
import {
  transformTransactions,
  type TransformedTransaction,
} from "./transformEvent";
import { DbClientService, DbError } from "../db/dbClient";
import { inArray } from "drizzle-orm";
import { type Account, accounts } from "db/incentives";
import type { CommittedTransactionInfo } from "@radixdlt/babylon-gateway-api-sdk";

export class FilterTransactionsService extends Context.Tag(
  "FilterTransactionsService"
)<
  FilterTransactionsService,
  (input: {
    transactions: CommittedTransactionInfo[];
    stateVersion: number;
  }) => Effect.Effect<
    {
      registeredAccounts: Account[];
      filteredTransactions: TransformedTransaction[];
      stateVersion: number;
    },
    DbError,
    DbClientService
  >
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

        for (const registeredAccount of registeredAccounts) {
          const transactionIdSet = addressTransactionMap.get(
            registeredAccount.address
          );
          if (!transactionIdSet) continue;

          const transaction = transactions.find((transaction) =>
            transactionIdSet.has(transaction.transactionId)
          );

          if (transaction) {
            filteredTransactions.push(transaction);
          }
        }

        return {
          registeredAccounts,
          filteredTransactions,
          stateVersion: input.stateVersion,
        };
      });
    };
  })
);
