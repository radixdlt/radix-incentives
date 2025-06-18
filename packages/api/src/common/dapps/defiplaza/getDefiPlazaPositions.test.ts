import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { GetLedgerStateLive } from "../../gateway/getLedgerState";

import { EntityFungiblesPageLive } from "../../gateway/entityFungiblesPage";

import {
  GetDefiPlazaPositionsLive,
  GetDefiPlazaPositionsService,
} from "./getDefiPlazaPositions";
import { GetFungibleBalanceLive } from "../../gateway/getFungibleBalance";
import { GetResourcePoolUnitsLive } from "../../resource-pool/getResourcePoolUnits";

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getLedgerStateLive = GetLedgerStateLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getFungibleBalanceLive = GetFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getResourcePoolUnitsServiceLive = GetResourcePoolUnitsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive)
);

const getDefiPlazaPositionsLive = GetDefiPlazaPositionsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),

  Layer.provide(getResourcePoolUnitsServiceLive),
  Layer.provide(entityFungiblesPageServiceLive)
);

describe("GetDefiPlazaPositionsService", () => {
  it("should get defi plaza positions", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getDefiPlazaPositions = yield* GetDefiPlazaPositionsService;

        return yield* getDefiPlazaPositions({
          accountAddresses: [
            // contains xUSDC BaseLP tokens
            "account_rdx12x2a5dft0gszufcce98ersqvsd8qr5kzku968jd50n8w4qyl9awecr",
          ],
          at_ledger_state: {
            timestamp: new Date("2025-06-17T00:00:00Z"),
          },
        });
      }),
      Layer.mergeAll(
        getDefiPlazaPositionsLive,
        gatewayApiClientLive,
        getLedgerStateLive,
        getEntityDetailsServiceLive,
        getFungibleBalanceLive,
        getResourcePoolUnitsServiceLive,
        entityFungiblesPageServiceLive
      )
    );

    const [result] = await Effect.runPromise(program);

    expect(JSON.parse(JSON.stringify(result))).toEqual({
      address:
        "account_rdx12x2a5dft0gszufcce98ersqvsd8qr5kzku968jd50n8w4qyl9awecr",
      items: [
        {
          lpResourceAddress:
            "resource_rdx1tkdws0nvfwjnn2q62x4gqgelyt4t5z7cn58pwvrtf4zrxtdw2sem8x",
          position: [
            {
              resourceAddress:
                "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
              amount: "7.20196425754516467120635574699603023544",
            },
            {
              resourceAddress:
                "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
              amount: "678.18721659673193757154871619238609567803",
            },
          ],
        },
      ],
    });

    console.log(JSON.stringify(result, null, 2));
  });
});
