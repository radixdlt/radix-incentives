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
import {
  createAppConfigLive,
  createConfig,
} from "../../consultation/config/appConfig";
import { createRedisClientLive } from "../../common/redis/redisClient";
import { LoggerLive } from "../../common/logger/logger";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import {
  getStateVersion,
  GetStateVersionLive,
  GetStateVersionService,
  SetStateVersionLive,
} from "../stateversion";
import {
  GetLedgerStateLive,
  GetLedgerStateService,
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
    redisUrl: REDIS_HOST,
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
    Layer.provide(apiGatewayClientLive)
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

  const stateVersion = await Effect.runPromise(
    Effect.provide(
      Effect.gen(function* () {
        const getLedgerStateService = yield* GetLedgerStateService;
        const getStateVersion = yield* GetStateVersionService;

        if (START_STATE_VERSION) {
          yield* Effect.log(
            `Using start state version from env: ${START_STATE_VERSION}`
          );
          const ledgerState = yield* getLedgerStateService({
            at_ledger_state: {
              timestamp: new Date(START_STATE_VERSION),
            },
          });
          return ledgerState.state_version;
        }

        const stateVersion = yield* getStateVersion();
        if (stateVersion) {
          yield* Effect.log(`Using state version from redis: ${stateVersion}`);
          return stateVersion;
        }

        const ledgerState = yield* getLedgerStateService({
          at_ledger_state: {
            timestamp: new Date(),
          },
        });

        yield* Effect.log(
          `Using current ledger state version: ${ledgerState.state_version}`
        );
        return ledgerState.state_version;
      }),
      Layer.mergeAll(
        apiGatewayClientLive,
        getLedgerStateLive,
        getStateVersionLive
      )
    )
  );

  const loggerLive = LoggerLive.pipe(Layer.provide(configLive));

  const setStateVersionLive = SetStateVersionLive.pipe(
    Layer.provide(redisClientLive),
    Layer.provide(configLive)
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

  const transactionStreamLive = TransactionStreamLive(
    transactionStreamClient
  ).pipe(Layer.provide(loggerLive));

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
      addTransactionsToDbLive
    )
  );

  return await Effect.runPromise(transactionStream);
};
