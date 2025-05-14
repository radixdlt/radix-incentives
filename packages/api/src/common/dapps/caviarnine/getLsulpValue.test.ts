import { Effect, Layer } from "effect";

import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { createAppConfigLive } from "../../config/appConfig";
import { LoggerLive } from "../../logger/logger";
import {
  GetLedgerStateLive,
  GetLedgerStateService,
} from "../../gateway/getLedgerState";
import { GetAllValidatorsLive } from "../../gateway/getAllValidators";
import { GetFungibleBalanceLive } from "../../gateway/getFungibleBalance";
import { EntityFungiblesPageLive } from "../../gateway/entityFungiblesPage";
import { GetLsulpValueLive, GetLsulpValueService } from "./getLsulpValue";
import { ConvertLsuToXrdLive } from "../../staking/convertLsuToXrd";

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

const getLedgerStateLive = GetLedgerStateLive.pipe(
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
  Layer.provide(getLedgerStateLive)
);

const getLsulpValueLive = GetLsulpValueLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive)
);

describe("GetLsulpValueService", () => {
  it("should get lsulp value", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getLsulpValue = yield* GetLsulpValueService;
        const getLedgerState = yield* GetLedgerStateService;

        const state = yield* getLedgerState({
          // timestamp: new Date("2025-04-01T00:00:00.000Z"),
          state_version: 286058118,
        });

        console.log(JSON.stringify(state, null, 2));

        return yield* getLsulpValue({
          state: { state_version: state.state_version },
        });
      }),
      Layer.mergeAll(
        gatewayApiClientLive,
        loggerLive,
        getFungibleBalanceLive,
        entityFungiblesPageServiceLive,
        getLedgerStateLive,
        getLsulpValueLive
      )
    );

    const result = await Effect.runPromise(program);

    console.log(result);
  });
});
