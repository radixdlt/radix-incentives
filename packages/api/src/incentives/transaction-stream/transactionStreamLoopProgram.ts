import Redis from "ioredis";
import { Effect, Layer } from "effect";

import {
  createStateVersionManager,
  createStateVersionManagerLive,
} from "./stateVersionManager";
import { TransactionStreamLive } from "./transactionStream";
import { transactionStreamLoop } from "./transactionStreamLoop";
import { createTransactionStream } from "radix-transaction-stream";
import { createRadixNetworkClient } from "radix-web3.js";
import { createAppConfigLive, createConfig } from "../config/appConfig";
import { createRedisClientLive } from "../../common/redis/redisClient";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import {
  GetStateVersionLive,
  getStateVersionProgram,
  SetStateVersionLive,
  setStateVersionProgram,
} from "../stateversion";
import {
  GetLedgerStateLive,
  getLedgerStateProgram,
} from "../../common/gateway/getLedgerState";

import { createDbClientLive } from "../db/dbClient";
import { db } from "db/incentives";
import { FilterTransactionsLive } from "./filterTransactions";
import { AddEventsToDbLive } from "../events/queries/addEventToDb";
import { AddTransactionsToDbLive } from "./addTransactionsToDb";
import { GetActivitiesLive } from "../activity/getActivities";
import { AddToEventQueueLive } from "../events/addToEventQueue";
import { EventQueueClientLive } from "../events/eventQueueClient";
import { AddTransactionFeeLive } from "../transaction-fee/addTransactionFee";

export const runTransactionStreamLoop = async () => {
  const REDIS_HOST = process.env.REDIS_HOST;
  const REDIS_PORT = process.env.REDIS_PORT;

  if (!REDIS_HOST || !REDIS_PORT) {
    throw new Error("REDIS_HOST, REDIS_PORT must be set");
  }

  const START_TIMESTAMP = process.env.START_TIMESTAMP
    ? new Date(process.env.START_TIMESTAMP)
    : undefined;

  const config = createConfig({
    networkId: 1,
    logLevel: "debug",
    redisHost: REDIS_HOST,
  });

  const redis = new Redis({
    host: REDIS_HOST,
    port: config.redisPort,
  });

  const stateVersionManager = createStateVersionManager();

  const configLive = createAppConfigLive(config);

  const dbClientLive = createDbClientLive(db);

  const apiGatewayClientLive = GatewayApiClientLive.pipe(
    Layer.provide(configLive)
  );

  const getLedgerStateLive = GetLedgerStateLive.pipe(
    Layer.provide(apiGatewayClientLive),
    Layer.provide(configLive)
  );

  const redisClientLive = createRedisClientLive(redis);

  const setStateVersionLive = SetStateVersionLive.pipe(
    Layer.provide(redisClientLive),
    Layer.provide(configLive)
  );

  const addEventsLive = AddEventsToDbLive.pipe(Layer.provide(dbClientLive));

  const addTransactionsToDbLive = AddTransactionsToDbLive.pipe(
    Layer.provide(dbClientLive)
  );

  const getStateVersionLive = GetStateVersionLive.pipe(
    Layer.provide(redisClientLive),
    Layer.provide(configLive)
  );

  const currentLedgerState = await Effect.runPromise(
    Effect.provide(
      getLedgerStateProgram({
        at_ledger_state: {
          timestamp: new Date(),
        },
      }),
      Layer.mergeAll(getLedgerStateLive, apiGatewayClientLive)
    )
  );

  if (START_TIMESTAMP) {
    console.log(
      `using START_TIMESTAMP "${START_TIMESTAMP.toISOString()}", overriding state version`
    );

    const ledgerState = await Effect.runPromise(
      Effect.provide(
        getLedgerStateProgram({
          at_ledger_state: {
            timestamp: START_TIMESTAMP,
          },
        }),
        Layer.mergeAll(getLedgerStateLive, apiGatewayClientLive)
      )
    );

    await Effect.runPromise(
      Effect.provide(
        setStateVersionProgram(ledgerState.state_version),
        Layer.mergeAll(setStateVersionLive, configLive)
      )
    );

    stateVersionManager.setStateVersion(ledgerState.state_version);
  } else {
    const stateVersion = await Effect.runPromise(
      Effect.provide(
        getStateVersionProgram,
        Layer.mergeAll(getStateVersionLive, configLive)
      ).pipe(
        Effect.catchTags({
          StateVersionNotFoundError: () => {
            console.log(
              "State version not found, using current ledger state version",
              currentLedgerState.state_version
            );
            return Effect.succeed(currentLedgerState.state_version);
          },
        })
      )
    );
    const ledgerState = await Effect.runPromise(
      Effect.provide(
        getLedgerStateProgram({
          at_ledger_state: {
            state_version: stateVersion,
          },
        }),
        Layer.mergeAll(getLedgerStateLive, apiGatewayClientLive)
      )
    );

    console.log(
      `using last processed state version ${ledgerState.proposer_round_timestamp}`
    );

    await Effect.runPromise(
      Effect.provide(
        setStateVersionProgram(stateVersion),
        Layer.mergeAll(setStateVersionLive, configLive)
      )
    );
    stateVersionManager.setStateVersion(stateVersion);
  }

  const stateVersionManagerLive = createStateVersionManagerLive(
    stateVersionManager
  ).pipe(Layer.provide(setStateVersionLive));

  const transactionStreamClient = createTransactionStream({
    gatewayApi: createRadixNetworkClient({
      networkId: config.networkId,
    }),
    optIns: {
      detailed_events: true,
      balance_changes: true,
    },
    startStateVersion: 1,
  });

  const transactionStreamLive = TransactionStreamLive(transactionStreamClient);

  const filterTransactionsLive = FilterTransactionsLive.pipe(
    Layer.provide(dbClientLive)
  );

  const getActivitiesLive = GetActivitiesLive.pipe(Layer.provide(dbClientLive));

  const eventQueueClientLive = EventQueueClientLive;

  const addToEventQueueLive = AddToEventQueueLive.pipe(
    Layer.provide(eventQueueClientLive)
  );

  const addTransactionFeeLive = AddTransactionFeeLive.pipe(
    Layer.provide(dbClientLive)
  );

  const transactionStream = Effect.provide(
    transactionStreamLoop(),
    Layer.mergeAll(
      transactionStreamLive,
      setStateVersionLive,
      stateVersionManagerLive,
      getLedgerStateLive,
      apiGatewayClientLive,
      dbClientLive,
      filterTransactionsLive,
      getActivitiesLive,
      addEventsLive,
      addTransactionsToDbLive,
      configLive,
      addToEventQueueLive,
      eventQueueClientLive,
      addTransactionFeeLive
    )
  );

  await Effect.runPromise(transactionStream);
};
