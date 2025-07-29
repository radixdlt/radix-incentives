import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { AggregateOciswapPositionsService } from "./aggregateOciswapPositions";
import { AddressValidationServiceLive } from "../../common/address-validation/addressValidation";
import { GetUsdValueLive } from "../token-price/getUsdValue";
import { ActivityId } from "data";
import { AggregateDefiPlazaPositionsService } from "./aggregateDefiPlazaPositions";

const getUsdValueLive = GetUsdValueLive.pipe(
  Layer.provide(AddressValidationServiceLive)
);

const aggregateDefiPlazaPositionsLive =
  AggregateDefiPlazaPositionsService.Default.pipe(
    Layer.provide(AddressValidationServiceLive),
    Layer.provide(getUsdValueLive)
  );

const defiPlazaLpActivityIds = Object.values(ActivityId).filter(
  (id) => id.startsWith("defiPlaza_lp_") || id.startsWith("defiPlaza_nativeLp_")
);

const expectedActivityIds = new Set(defiPlazaLpActivityIds);

describe("AggregateDefiPlazaPositionsService", () => {
  it.effect(
    "should return defaults when no positions are found",
    () =>
      Effect.gen(function* () {
        const service = yield* Effect.provide(
          AggregateDefiPlazaPositionsService,
          aggregateDefiPlazaPositionsLive
        );
        const result = yield* service({
          accountBalance: {
            address: "",
            items: [],
          },
          timestamp: new Date(),
        });

        // Check that defaults are returned for all expected activity ids
        for (const position of result) {
          // @ts-expect-error
          expect(expectedActivityIds.has(position.activityId)).toBe(true);
          expect(position.usdValue).toBe("0");
        }

        // Check that all expected activity ids are present
        for (const activityId of expectedActivityIds) {
          const position = result.find((p) => p.activityId === activityId);

          expect(
            position,
            `Position not found for activity id: ${activityId}`
          ).toBeDefined();
        }
      }),
    { retry: 0 }
  );
});
