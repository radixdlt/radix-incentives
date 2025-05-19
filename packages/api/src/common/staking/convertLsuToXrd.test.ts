import { Effect, Either, Layer } from "effect";
import { ConvertLsuToXrdLive, ConvertLsuToXrdService } from "./convertLsuToXrd";
import { GatewayApiClientLive } from "../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../gateway/getEntityDetails";
import { createAppConfigLive } from "../config/appConfig";
import { BigNumber } from "bignumber.js";
import { LoggerLive, LoggerService } from "../logger/logger";
import { GetLedgerStateLive } from "../gateway/getLedgerState";
import {
  GetAllValidatorsLive,
  GetAllValidatorsService,
} from "../gateway/getAllValidators";

const appConfigServiceLive = createAppConfigLive();

const loggerLive = LoggerLive.pipe(Layer.provide(appConfigServiceLive));

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const convertLsuToXrdServiceLive = ConvertLsuToXrdLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive)
);

const getStateVersionLive = GetLedgerStateLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getAllValidatorsServiceLive = GetAllValidatorsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

describe("ConvertLsuToXrdService", () => {
  it("should convert lsu to xrd", async () => {
    const lsuAmount = new BigNumber(1_000_000);

    const program = Effect.provide(
      Effect.gen(function* () {
        const convertLsuToXrd = yield* ConvertLsuToXrdService;
        const getAllValidators = yield* GetAllValidatorsService;
        const logger = yield* LoggerService;

        const validators = yield* getAllValidators();

        return yield* convertLsuToXrd({
          addresses: [],
          at_ledger_state: {
            timestamp: new Date("2025-01-01T00:00:00Z"),
          },
        });
      }),
      Layer.mergeAll(
        convertLsuToXrdServiceLive,
        getEntityDetailsServiceLive,
        getStateVersionLive,
        gatewayApiClientLive,
        getAllValidatorsServiceLive,
        loggerLive
      )
    );

    const result = await Effect.runPromise(program);

    console.log(result);

    // expect(lsuAmount.lt(result)).toBe(true);
  });
});
