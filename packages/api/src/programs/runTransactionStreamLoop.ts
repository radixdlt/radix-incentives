import Redis from "ioredis";
import { Effect, Layer } from "effect";
import {
  createAppConfigLive,
  createConfig,
  createRedisClientLive,
  GatewayApiClientLive,
  getStateVersion,
  LoggerLive,
  SetStateVersionLive,
} from "../services";
import {
  createStateVersionManager,
  createStateVersionManagerLive,
} from "../transaction-stream/stateVersionManager";
import { TransactionStreamLive } from "../transaction-stream/transactionStream";
import { transactionStreamLoop } from "../transaction-stream/transactionStreamLoop";
import { createTransactionStream } from "radix-transaction-stream";
import { createRadixNetworkClient } from "radix-web3.js";

const REDIS_URL = process.env.REDIS_URL;

export const runTransactionStreamLoop = async () => {
  if (!REDIS_URL) {
    throw new Error("REDIS_URL is not set");
  }

  const redis = new Redis(REDIS_URL);

  const config = createConfig({
    networkId: 1,
    logLevel: "debug",
    redisUrl: REDIS_URL,
  });

  const configLive = createAppConfigLive(config);

  const stateVersion = await getStateVersion(config.stateVersionKey, redis);

  const stateVersionManager = createStateVersionManager(264980257);

  const loggerLive = LoggerLive.pipe(Layer.provide(configLive));

  const apiGatewayClientLive = GatewayApiClientLive.pipe(
    Layer.provide(configLive)
  );

  const redisClientLive = createRedisClientLive(redis);

  const setStateVersionLive = SetStateVersionLive.pipe(
    Layer.provide(redisClientLive),
    Layer.provide(configLive)
  );

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

  const transactionStreamLive = TransactionStreamLive(
    transactionStreamClient
  ).pipe(Layer.provide(loggerLive));

  const transactionStream = Effect.provide(
    transactionStreamLoop,
    Layer.mergeAll(
      loggerLive,
      transactionStreamLive,
      setStateVersionLive,
      stateVersionManagerLive
    )
  );

  return await Effect.runPromise(transactionStream);
};
