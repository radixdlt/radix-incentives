import { Effect, Either, Layer } from "effect";
import { ConvertLsuToXrdLive, ConvertLsuToXrdService } from "./convertLsuToXrd";
import { GatewayApiClientLive } from "./gatewayApiClient";
import { GetEntityDetailsServiceLive } from "./getEntityDetails";
import { createAppConfigLive } from "../config/appConfig";
import { BigNumber } from "bignumber.js";
import { LoggerLive, LoggerService } from "../logger/logger";
import { GetStateVersionLive } from "./getStateVersion";
import {
  GetAllValidatorsLive,
  GetAllValidatorsService,
} from "./getAllValidators";

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

const getStateVersionLive = GetStateVersionLive.pipe(
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
          items: validators.map((validator) => ({
            lsuResourceAddress: validator.lsuResourceAddress,
            amount: lsuAmount,
          })),
          stateVersion: {
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

    const successResponses = result
      .filter(Either.isRight)
      .map((response) => response.right);

    console.log(successResponses);

    // expect(lsuAmount.lt(result)).toBe(true);
  });
});
