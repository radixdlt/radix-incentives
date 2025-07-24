import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../gateway/getEntityDetails";
import { GetLedgerStateService } from "../gateway/getLedgerState";
import { GetFungibleBalanceService } from "../gateway/getFungibleBalance";
import { EntityFungiblesPageService } from "../gateway/entityFungiblesPage";
import { GetUserStakingPositionsService } from "./getUserStakingPositions";
import { EntityNonFungiblesPageService } from "../gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataService } from "../gateway/entityNonFungiblesData";
import { GetNonFungibleBalanceService } from "../gateway/getNonFungibleBalance";
import { GetAllValidatorsService } from "../gateway/getAllValidators";
import { accounts } from "../../fixtures/accounts";
import {
  GetNftResourceManagersService,
  GetNonFungibleIdsService,
} from "../gateway";

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getLedgerStateLive = GetLedgerStateService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getAllValidatorsServiceLive = GetAllValidatorsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const stateEntityDetailsLive = GetFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const entityNonFungiblesPageServiceLive =
  EntityNonFungiblesPageService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

const entityNonFungibleDataServiceLive =
  EntityNonFungibleDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

const getNftResourceManagersServiceLive =
  GetNftResourceManagersService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

const getNonFungibleIdsServiceLive = GetNonFungibleIdsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNftResourceManagersServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getNonFungibleIdsServiceLive)
);

const getUserStakingPositionsLive = GetUserStakingPositionsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(getAllValidatorsServiceLive)
);

describe("getUserStakingPositions", () => {
  it("should get user staking positions", async () => {
    const result = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const getUserStakingPositionsService =
            yield* GetUserStakingPositionsService;

          return yield* getUserStakingPositionsService({
            addresses: [accounts[0].account_address],
            at_ledger_state: {
              state_version: 283478629,
            },
          });
        }),
        getUserStakingPositionsLive
      )
    );

    expect(result.items.length).toBeGreaterThan(0);
  });
});
