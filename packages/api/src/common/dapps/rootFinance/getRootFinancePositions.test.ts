import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../../gateway/getEntityDetails";
import { GetLedgerStateService } from "../../gateway/getLedgerState";
import { it } from "@effect/vitest";

import { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";

import { GetRootFinancePositionsService } from "./getRootFinancePositions";
import { GetNonFungibleBalanceService } from "../../gateway/getNonFungibleBalance";
import { EntityNonFungiblesPageService } from "../../gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataService } from "../../gateway/entityNonFungiblesData";
import { KeyValueStoreDataService } from "../../gateway/keyValueStoreData";
import { KeyValueStoreKeysService } from "../../gateway/keyValueStoreKeys";
import { GetKeyValueStoreService } from "../../gateway/getKeyValueStore";
import { GetNftResourceManagersService } from "../../gateway/getNftResourceManagers";
import { GetNonFungibleIdsService } from "../../gateway/getNonFungibleIds";
import { poolStatesKvs } from "./fixtures/poolStatesKvs";

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getLedgerStateLive = GetLedgerStateService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungiblesPageServiceLive =
  EntityNonFungiblesPageService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

const entityNonFungibleDataServiceLive =
  EntityNonFungibleDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

const keyValueStoreDataServiceLive = KeyValueStoreDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreServiceLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

const getNonFungibleIdsLive = GetNonFungibleIdsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive)
);

const getNftResourceManagersLive = GetNftResourceManagersService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleIdsLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(getNftResourceManagersLive)
);

describe("GetRootFinancePositionService", () => {
  it.effect(
    "should get root finance position",
    Effect.fn(function* () {
      const getRootFinancePositionLive =
        GetRootFinancePositionsService.Default.pipe(
          Layer.provide(getNonFungibleBalanceLive)
        );

      const service = Effect.provide(
        GetRootFinancePositionsService,
        getRootFinancePositionLive
      ).pipe(
        Effect.provideService(
          GetKeyValueStoreService,
          new GetKeyValueStoreService(() => Effect.succeed(poolStatesKvs))
        )
      );

      const getRootFinancePositions = yield* service;

      const result = yield* getRootFinancePositions.run({
        accountAddresses: [
          "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew",
        ],
        at_ledger_state: {
          timestamp: new Date("2025-07-25T00:00:00Z"),
        },
      });

      const expectedOutput = {
        items: [
          {
            accountAddress:
              "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew",
            collaterizedDebtPositions: [
              {
                nft: {
                  resourceAddress:
                    "resource_rdx1ngekvyag42r0xkhy2ds08fcl7f2ncgc0g74yg6wpeeyc4vtj03sa9f",
                  localId: "#448#",
                },
                collaterals: {
                  resource_rdx1t5kmyj54jt85malva7fxdrnpvgfgs623yt7ywdaval25vrdlmnwe97:
                    "3431.65301219063",
                  resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf:
                    "0.15729165084904900461533186135590679355",
                  resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd:
                    "100.11927219258979110506850436224421905",
                  resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75:
                    "0.0000074389330650136446225220367402994",
                  resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww:
                    "0.00034946983525823083419950622758474985",
                  resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf:
                    "500.00470929512909167980875707003637673",
                  resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw:
                    "0.49501081762677235203768615687828843671",
                },
                loans: {
                  resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf:
                    "0.10077000718925633084245647493453883267532029004752829736",
                },
              },
            ],
          },
        ],
      };

      expect(result).toEqual(expectedOutput);
    })
  );
});
