import { Effect } from "effect";
import { TransactionStreamService } from "./transactionStream";
import { LoggerService } from "../../common/logger/logger";

import { transformTransactions } from "./transformEvent";

const ACCOUNT_ADDRESSES = new Set([
  "account_rdx12yvpng9r5u3ggqqfwva0u6vya3hjrd6jantdq72p0jm6qarg8lld2f",
  "account_rdx1cx26ckdep9t0lut3qaz3q8cj9wey3tdee0rdxhc5f0nce64lw5gt70",
  "account_rdx168nr5dwmll4k2x5apegw5dhrpejf3xac7khjhgjqyg4qddj9tg9v4d",
  "account_rdx168fjn9fcts5h59k3z64acp8xszz8sf2a66hnw050vdnkurullz9rge",
]);

const intersection = (a: Set<string>, b: Set<string>) => {
  const result = new Set<string>();
  for (const elem of a) {
    if (b.has(elem)) {
      result.add(elem);
    }
  }
  return result;
};

const [START_STATE_VERSION, END_STATE_VERSION] = [
  {
    stateVersion: 264980257,
    confirmed_at: new Date("2025-04-13T23:59:07.064Z"),
  },
  {
    stateVersion: 269932183,
    confirmed_at: new Date("2025-04-20T23:59:07.521Z"),
  },
];

export const transactionStreamLoop = Effect.gen(function* () {
  const transactionStream = yield* TransactionStreamService;
  const logger = yield* LoggerService;
  // const stateVersionManager = yield* StateVersionManagerService;

  // const stateVersion = yield* stateVersionManager.getStateVersion();

  // logger.debug({ stateVersion });

  let stateVersion = START_STATE_VERSION.stateVersion;

  let cycleCount = 0;
  const startTime = performance.now();

  while (stateVersion <= END_STATE_VERSION.stateVersion) {
    cycleCount++;

    const result = yield* transactionStream(stateVersion);

    const transactions = transformTransactions(result.transactions);

    const firstTx = transactions.at(0);
    const lastTx = transactions.at(-1);

    // logger.debug(
    //   `stateVersions ${stateVersion} -> ${result.stateVersion} (${firstTx?.round_timestamp} -> ${lastTx?.round_timestamp}) `
    // );

    const matchedTxs = transactions.filter(
      (tx) => intersection(tx.entityAddresses, ACCOUNT_ADDRESSES).size
    );

    for (const tx of matchedTxs) {
      for (const entityAddress of tx.entityAddresses) {
        // counter.set(entityAddress, (counter.get(entityAddress) ?? 0) + 1);

        logger.debug({
          txId: tx.transactionId,
          balanceChanges: Object.fromEntries(tx.balanceChangesMap.entries()),
          stateVersion: tx.stateVersion,
          round_timestamp: tx.round_timestamp,
        });
      }
    }

    if (matchedTxs.length > 0) {
      // const fungibleBalanceChange = matchedTxs.find(
      //   (tx) => tx.balanceChanges.fungible_balance_changes.length
      // );
      // if (fungibleBalanceChange) {
      //   // const tx = matchedTxs.at(1);
      //   logger.debug({
      //     ...fungibleBalanceChange,
      //     entityAddresses: [
      //       ...(fungibleBalanceChange?.entityAddresses.values() ?? []),
      //     ],
      //   });
      //   return;
      // }
      // logger.debug(`found ${matchedTxs.length} txs`);
      // logger.debug({ counter: Object.fromEntries(counter) });
    }

    stateVersion = result.stateVersion;
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  logger.debug(`Done after ${cycleCount} cycles in ${duration}ms`);

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  // const result = yield* transactionStreamClient(stateVersion!);

  // logger.debug({ result });

  // if (result.transactions.length > 0) {
  //   if (matchedTxs.length > 0) {
  //     const lastTx = transformedTransactions.at(-1);

  //     logger.debug(
  //       `found ${matchedTxs.length} txs at state version ${result?.stateVersion} ${lastTx?.round_timestamp}`
  //     );

  //     // for (const tx of accountMatches) {
  //     //   for (const entityAddress of tx.entityAddresses) {
  //     //     counter.set(entityAddress, (counter.get(entityAddress) ?? 0) + 1);
  //     //   }
  //     // }

  //     // logger.debug({ counter: Object.fromEntries(counter) });
  //   }

  //   // yield* stateVersionManager.setStateVersion(result.stateVersion);
  // }
});
