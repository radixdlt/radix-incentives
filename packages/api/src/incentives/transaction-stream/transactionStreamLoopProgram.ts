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
import { AddEventsToDbLive } from "../events/addEventToDb";
import { AddTransactionsToDbLive } from "./addTransactionsToDb";
import { GetActivitiesLive } from "../activity/getActivities";

export const runTransactionStreamLoop = async () => {
  const REDIS_HOST = process.env.REDIS_HOST;
  const START_STATE_VERSION = process.env.START_STATE_VERSION;

  if (!REDIS_HOST) {
    throw new Error("REDIS_URL is not set");
  }

  const config = createConfig({
    networkId: 1,
    logLevel: "debug",
    redisHost: REDIS_HOST,
  });

  const redis = new Redis({
    host: REDIS_HOST,
    port: config.redisPort,
    password: config.redisPassword,
  });

  const configLive = createAppConfigLive(config);

  const dbClientLive = createDbClientLive(db);

  const apiGatewayClientLive = GatewayApiClientLive.pipe(
    Layer.provide(configLive)
  );

  const getLedgerStateLive = GetLedgerStateLive.pipe(
    Layer.provide(apiGatewayClientLive),
    Layer.provide(configLive)
  );

  const ledgerState = await Effect.runPromise(
    Effect.provide(
      getLedgerStateProgram({
        at_ledger_state: {
          timestamp: new Date(),
        },
      }),
      Layer.mergeAll(getLedgerStateLive, apiGatewayClientLive)
    )
  );

  const addEventsLive = AddEventsToDbLive.pipe(Layer.provide(dbClientLive));

  const addTransactionsToDbLive = AddTransactionsToDbLive.pipe(
    Layer.provide(dbClientLive)
  );

  const redisClientLive = createRedisClientLive(redis);

  const getStateVersionLive = GetStateVersionLive.pipe(
    Layer.provide(redisClientLive),
    Layer.provide(configLive)
  );

  const setStateVersionLive = SetStateVersionLive.pipe(
    Layer.provide(redisClientLive),
    Layer.provide(configLive)
  );

  const stateVersion = await Effect.runPromise(
    Effect.provide(
      getStateVersionProgram,
      Layer.mergeAll(getStateVersionLive, configLive)
    ).pipe(
      Effect.catchTags({
        StateVersionNotFoundError: () => {
          console.log(
            "State version not found, using current ledger state version",
            ledgerState.state_version
          );
          return Effect.succeed(ledgerState.state_version);
        },
      })
    )
  );

  await Effect.runPromise(
    Effect.provide(
      setStateVersionProgram(stateVersion),
      Layer.mergeAll(setStateVersionLive, configLive)
    )
  );

  const stateVersionManagerLive = createStateVersionManagerLive(
    createStateVersionManager()
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

  const transactionStream = Effect.provide(
    transactionStreamLoop(stateVersion),
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
      configLive
    )
  );

  return await Effect.runPromise(transactionStream);
};
