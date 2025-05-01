import { Effect, Layer } from "effect";
import { ConvertLsuToXrdLive } from "./convertLsuToXrd";
import { GatewayApiClientLive } from "./gatewayApiClient";
import { GetEntityDetailsServiceLive } from "./getEntityDetails";
import { createAppConfigLive } from "../config/appConfig";
import { LoggerLive } from "../logger/logger";
import { GetStateVersionLive, GetStateVersionService } from "./getStateVersion";
import { GetAllValidatorsLive } from "./getAllValidators";
import { GetFungibleBalanceLive } from "./getFungibleBalance";
import { EntityFungiblesPageLive } from "./entityFungiblesPage";
import { GetLsulpValueLive, GetLsulpValueService } from "./getLsulpValue";

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

const entityFungiblesPageServiceLive = EntityFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getFungibleBalanceLive = GetFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getStateVersionLive)
);

const getLsulpValueLive = GetLsulpValueLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getStateVersionLive)
);

describe("GetLsulpValueService", () => {
  it("should get lsulp value", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getLsulpValue = yield* GetLsulpValueService;
        const getStateVersion = yield* GetStateVersionService;

        const stateVersion = yield* getStateVersion(
          new Date("2025-04-01T00:00:00.000Z")
        );

        return yield* getLsulpValue(stateVersion);
      }),
      Layer.mergeAll(
        gatewayApiClientLive,
        loggerLive,
        getFungibleBalanceLive,
        entityFungiblesPageServiceLive,
        getStateVersionLive,
        getLsulpValueLive
      )
    );

    const result = await Effect.runPromise(program);

    console.log(result);
  });
});
