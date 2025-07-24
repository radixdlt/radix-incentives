import type { TransactionMessage } from "@radixdlt/babylon-core-api-sdk";
import type {
  CommittedTransactionInfo,
  DetailedEventIdentifier,
  DetailedEventsItem,
  ProgrammaticScryptoSborValue,
} from "@radixdlt/babylon-gateway-api-sdk";
import Bignumber from "bignumber.js";
import { extractComponentAddressFromMethodCalls } from "./extractComponentAddressFromMethodCalls";

export type TransformedEvent = {
  package: {
    address: string;
    blueprint: string;
  };
  event: {
    name: string;
    payload: ProgrammaticScryptoSborValue;
  };
  emitter: {
    globalEmitter: string;
    methodEmitter: string;
    outerEmitter?: string;
  };
};

export const transformEvent = (
  event: DetailedEventsItem
): TransformedEvent | undefined => {
  if (event.emitter.type === "EntityMethod") {
    return {
      package: {
        // @ts-expect-error: invalid type from babylon-gateway-api-sdk
        address: event.identifier.package as string,
        blueprint: event.identifier.blueprint,
      },
      event: {
        name: event.identifier.event,
        payload: event.payload
          .programmatic_json as ProgrammaticScryptoSborValue,
      },
      emitter: {
        globalEmitter: event.emitter.global_emitter,
        methodEmitter: event.emitter.method_emitter.entity,
        outerEmitter: event.emitter.outer_emitter,
      },
    } satisfies TransformedEvent;
  }

  if (event.emitter.type === "PackageFunction") {
    const packageAddress = (
      event.identifier as unknown as DetailedEventIdentifier & {
        package: DetailedEventIdentifier["_package"];
      }
    ).package;

    return {
      package: {
        address: packageAddress,
        blueprint: event.identifier.blueprint,
      },
      event: {
        name: event.identifier.event,
        payload: event.payload
          .programmatic_json as ProgrammaticScryptoSborValue,
      },
      emitter: {
        globalEmitter: packageAddress,
        methodEmitter: packageAddress,
        outerEmitter: packageAddress,
      },
    } satisfies TransformedEvent;
  }
};

export type TransformedTransaction = ReturnType<
  typeof transformTransactions
>[0] & {
  highestFeePayer?: string;
};

export type TransformTransactionsOutput = TransformedTransaction[];

export const transformTransactions = (
  transactions: CommittedTransactionInfo[]
) =>
  transactions
    .map((transaction) => {
      const balanceChanges = transaction.balance_changes;
      if (!balanceChanges) return undefined;

      const entityAddressSet = new Set<string>();
      const feeBalanceChangesMap = new Map<string, Bignumber>();

      for (const item of balanceChanges.fungible_fee_balance_changes) {
        if (item.entity_address.startsWith("account_")) {
          entityAddressSet.add(item.entity_address);
          const amountBN =
            feeBalanceChangesMap.get(item.entity_address) ?? new Bignumber(0);

          feeBalanceChangesMap.set(
            item.entity_address,
            amountBN.plus(item.balance_change)
          );
        }
      }

      const events = (transaction.receipt?.detailed_events ?? [])
        .map(transformEvent)
        .filter((event) => event !== undefined);

      const componentAddresses = extractComponentAddressFromMethodCalls(
        transaction?.manifest_instructions ?? ""
      );

      const intentHash = transaction.intent_hash;
      if (!intentHash) return undefined;

      return {
        transactionId: intentHash,
        round_timestamp: transaction.round_timestamp,
        events,
        message: transaction.message as TransactionMessage | undefined,
        balanceChanges,
        entityAddresses: entityAddressSet,
        feeBalanceChanges: Object.fromEntries(
          Array.from(feeBalanceChangesMap.entries())
        ),
        stateVersion: transaction.state_version,
        status: transaction.transaction_status,
        manifest: transaction.manifest_instructions,
        componentAddresses,
      };
    })
    .filter((t) => t !== undefined);

export const toEventMatcherFormat = (items: TransformTransactionsOutput) =>
  items.flatMap((tx) =>
    tx.events.map((event) => ({
      eventName: event.event.name,
      emitterAddress: event.emitter.globalEmitter,
    }))
  );
