import { Effect, Layer } from "effect";
import { ConvertLsuToXrdLive, ConvertLsuToXrdService } from "./convertLsuToXrd";
import { GatewayApiClientLive } from "../gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../gateway/getEntityDetails";
import { GetLedgerStateService } from "../gateway/getLedgerState";
import { GetAllValidatorsService } from "../gateway/getAllValidators";

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const convertLsuToXrdServiceLive = ConvertLsuToXrdLive.pipe(
  Layer.provide(getEntityDetailsServiceLive)
);

const getStateVersionLive = GetLedgerStateService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getAllValidatorsServiceLive = GetAllValidatorsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

describe("ConvertLsuToXrdService", () => {
  it("should convert lsu to xrd", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const convertLsuToXrd = yield* ConvertLsuToXrdService;

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
        getAllValidatorsServiceLive
      )
    );

    const result = await Effect.runPromise(program);

    expect(result).toBeDefined();
  });
});
