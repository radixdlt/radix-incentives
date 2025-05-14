import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../common/gateway/getEntityDetails";
import { createAppConfigLive } from "../../common/config/appConfig";
import { LoggerLive } from "../../common/logger/logger";
import { GetStateVersionLive } from "../../common/gateway/getStateVersion";
import { GetFungibleBalanceLive } from "../../common/gateway/getFungibleBalance";
import { EntityFungiblesPageLive } from "../../common/gateway/entityFungiblesPage";
import { EntityNonFungiblesPageLive } from "../../common/gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataLive } from "../../common/gateway/entityNonFungiblesData";
import { GetNonFungibleBalanceLive } from "../../common/gateway/getNonFungibleBalance";
import { GetAllValidatorsLive } from "../../common/gateway/getAllValidators";
import { accounts } from "../../fixtures/accounts";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { calculateVotingPower } from "./calculateVotingPower";
import { BigNumber } from "bignumber.js";
import { GetUserStakingPositionsLive } from "../../common/staking/getUserStakingPositions";
import { GetLsulpLive } from "../../common/dapps/caviarnine/getLsulp";
import { GetLsulpValueLive } from "../../common/dapps/caviarnine/getLsulpValue";
import { ConvertLsuToXrdLive } from "../../common/staking/convertLsuToXrd";

const appConfigServiceLive = createAppConfigLive();

const loggerLive = LoggerLive.pipe(Layer.provide(appConfigServiceLive));

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const getStateVersionLive = GetStateVersionLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getAllValidatorsServiceLive = GetAllValidatorsLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const stateEntityDetailsLive = GetFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getStateVersionLive)
);

const entityNonFungiblesPageServiceLive = EntityNonFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataServiceLive = EntityNonFungibleDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getStateVersionLive)
);

const getUserStakingPositionsLive = GetUserStakingPositionsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getStateVersionLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(getAllValidatorsServiceLive)
);

const getLsulpServiceLive = GetLsulpLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getStateVersionLive)
);

const getLsulpValueServiceLive = GetLsulpValueLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getStateVersionLive)
);

const convertLsuToXrdServiceLive = ConvertLsuToXrdLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getStateVersionLive)
);

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const selectedOptionMap = new Map<string, string>();

for (const account of accounts) {
  selectedOptionMap.set(account.account_address, account.selected_option);
}

describe("calculateVotingPower", () => {
  it("should get user voting power", async () => {
    const addresses = accounts.map((account) => account.account_address);
    const program = Effect.provide(
      calculateVotingPower({
        addresses,
        state: {
          // state_version: 283478629,
        },
      }),
      Layer.mergeAll(
        gatewayApiClientLive,
        loggerLive,
        stateEntityDetailsLive,
        entityFungiblesPageServiceLive,
        getStateVersionLive,
        entityNonFungiblesPageServiceLive,
        entityNonFungibleDataServiceLive,
        getNonFungibleBalanceLive,
        getAllValidatorsServiceLive,
        getUserStakingPositionsLive,
        getLsulpServiceLive,
        getLsulpValueServiceLive,
        convertLsuToXrdServiceLive
      )
    );

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(NodeSdkLive))
    );

    const no = {
      xrd: new BigNumber(0),
      lsu: new BigNumber(0),
      lsulp: new BigNumber(0),
      unstaked: new BigNumber(0),
      voteCount: 0,
    };
    const yes = {
      xrd: new BigNumber(0),
      lsu: new BigNumber(0),
      lsulp: new BigNumber(0),
      unstaked: new BigNumber(0),
      voteCount: 0,
    };

    const voteCount = accounts.reduce(
      (acc, account) => {
        const selected_option = selectedOptionMap.get(account.account_address);
        if (selected_option === "no") {
          acc.no++;
        } else if (selected_option === "yes") {
          acc.yes++;
        }

        return acc;
      },
      {
        no: 0,
        yes: 0,
      }
    );

    no.voteCount = voteCount.no;
    yes.voteCount = voteCount.yes;

    for (const item of result) {
      const selected_option = selectedOptionMap.get(item.address);
      if (selected_option === "no") {
        no.xrd = no.xrd.plus(item.xrd);
        no.lsu = no.lsu.plus(item.lsus);
        no.lsulp = no.lsulp.plus(item.lsulp);
        no.unstaked = no.unstaked.plus(item.unstaked);
      } else if (selected_option === "yes") {
        yes.xrd = yes.xrd.plus(item.xrd);
        yes.lsu = yes.lsu.plus(item.lsus);
        yes.lsulp = yes.lsulp.plus(item.lsulp);
        yes.unstaked = yes.unstaked.plus(item.unstaked);
      }
    }

    console.log({ no, yes });
  }, 60_000);
});
