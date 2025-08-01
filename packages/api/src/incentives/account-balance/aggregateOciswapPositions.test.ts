import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { AggregateOciswapPositionsService } from "./aggregateOciswapPositions";
import { AddressValidationServiceLive } from "../../common/address-validation/addressValidation";
import { GetUsdValueLive } from "../token-price/getUsdValue";
import type { AccountBalanceData } from "data";
import { AggregatePoolPositionsService } from "./aggregatePoolPositions";
import { getDefaultLpPositions } from "./getDefaultLpPositions";

const getUsdValueLive = GetUsdValueLive.pipe(
  Layer.provide(AddressValidationServiceLive)
);

const aggregatePoolPositionsLive = AggregatePoolPositionsService.Default.pipe(
  Layer.provide(AddressValidationServiceLive),
  Layer.provide(getUsdValueLive)
);

const aggregateOciswapPositionsLive =
  AggregateOciswapPositionsService.Default.pipe(
    Layer.provide(aggregatePoolPositionsLive)
  );

describe("AggregateOciswapPositionsService", () => {
  it.effect("should return defaults when no positions are found", () =>
    Effect.gen(function* () {
      const ociswapLpActivityIds = yield* getDefaultLpPositions("oc").pipe(
        Effect.map((items) => items.map((item) => item.activityId))
      );

      const expectedActivityIds = new Set(ociswapLpActivityIds);

      const service = yield* Effect.provide(
        AggregateOciswapPositionsService,
        aggregateOciswapPositionsLive
      );

      const result = yield* service({
        accountBalance: {
          positions: [],
        },
        timestamp: new Date(),
      });

      // Check that defaults are returned for all expected activity ids
      for (const position of result) {
        expect(expectedActivityIds.has(position.activityId)).toBe(true);
        expect(position.usdValue).toBe("0");
      }

      // Check that all expected activity ids are present
      for (const activityId of expectedActivityIds) {
        const position = result.find((p) => p.activityId === activityId);
        expect(position).toBeDefined();
      }
    })
  );

  it.effect("should return positions when they are found", () =>
    Effect.gen(function* () {
      const input = {
        accountBalance: {
          component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr:
            [
              {
                xToken: {
                  totalAmount: "0.00001745",
                  amountInBounds: "0.00000645",
                  resourceAddress:
                    "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75",
                },
                yToken: {
                  totalAmount: "192.01560585402385267",
                  amountInBounds: "124.065452742129436395",
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                },
                isActive: true,
              },
            ],
          component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm:
            [
              {
                xToken: {
                  totalAmount: "262.935475887328954031",
                  amountInBounds: "91.773186901405386137",
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                },
                yToken: {
                  totalAmount: "0.000373343680204139",
                  amountInBounds: "0.000267495492726955",
                  resourceAddress:
                    "resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww",
                },
                isActive: true,
              },
            ],
          component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f:
            [
              {
                xToken: {
                  totalAmount: "4.061255",
                  amountInBounds: "0.954428",
                  resourceAddress:
                    "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
                },
                yToken: {
                  totalAmount: "654.437237057678826637",
                  amountInBounds: "156.038434728909787027",
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                },
                isActive: true,
              },
            ],
          component_rdx1cz79xc57dpuhzd3wylnc88m3pyvfk7c5e03me2qv7x8wh9t6c3aw4g:
            [
              {
                xToken: {
                  totalAmount: "189.642389971135403843",
                  amountInBounds: "102.858056408095457293",
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                },
                yToken: {
                  totalAmount: "2.394421",
                  amountInBounds: "1.106921",
                  resourceAddress:
                    "resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw",
                },
                isActive: true,
              },
            ],
          component_rdx1crm530ath85gcwm4gvwq8m70ay07df085kmupp6gte3ew94vg5pdcp:
            [
              {
                xToken: {
                  totalAmount: "225.62161115129308196",
                  amountInBounds: "95.406931784173501506",
                  resourceAddress:
                    "resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8",
                },
                yToken: {
                  totalAmount: "219.82303247658630923",
                  amountInBounds: "122.631109425377016933",
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                },
                isActive: true,
              },
            ],
          component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd:
            [
              {
                xToken: {
                  totalAmount: "295.39039885146696781200638650391476665835",
                  amountInBounds: "295.39039885146696781200638650391476665835",
                  resourceAddress:
                    "resource_rdx1t4r86qqjtzl8620ahvsxuxaf366s6rf6cpy24psdkmrlkdqvzn47c2",
                },
                yToken: {
                  totalAmount: "241.3223084393149584691523569483273188951",
                  amountInBounds: "241.3223084393149584691523569483273188951",
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                },
              },
            ],
          component_rdx1cz8p5lc8vmj96hdguy02hkfq4z5xyxf9k759dj8ym8exj8x8zgmw9p:
            [
              {
                xToken: {
                  totalAmount: "800.31048567353294943932607671780543697108",
                  amountInBounds: "800.31048567353294943932607671780543697108",
                  resourceAddress:
                    "resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s",
                },
                yToken: {
                  totalAmount: "87.55060125482761792367960893507371293368",
                  amountInBounds: "87.55060125482761792367960893507371293368",
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                },
              },
            ],
          component_rdx1cz89w3ecvh9jvdd892vycs44rr042lteg75zgdydq9csn5d87snvdw:
            [
              {
                xToken: {
                  totalAmount: "108.86684748897750486997876748204838537152",
                  amountInBounds: "108.86684748897750486997876748204838537152",
                  resourceAddress:
                    "resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8",
                },
                yToken: {
                  totalAmount: "105.3531839176594986465481234028185276904",
                  amountInBounds: "105.3531839176594986465481234028185276904",
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                },
              },
            ],
        },
        timestamp: new Date("2025-07-20T00:00:00.000Z"),
      };

      const expected: Record<string, AccountBalanceData> = [
        {
          activityId: "oc_lp_nat_early-xrd",
          usdValue:
            "0.400855957897505699727552608912803372022294061177484758648",
        },
        {
          activityId: "oc_lp_der_early-xrd",
          usdValue: "0.3698820291693706236516031382367207209279525904",
        },
        {
          activityId: "oc_lp_nat_oci-xrd",
          usdValue: "1.203046698603362023010370965932697348431681229275776",
        },
        {
          activityId: "oc_lp_der_oci-xrd",
          usdValue: "1.481272941307938123888363060789759659415848112",
        },
        {
          activityId: "oc_lp_nat_ilis-xrd",
          usdValue:
            "1.07619306210764290397515540327189190045078699969233869435",
        },
        {
          activityId: "oc_lp_der_ilis-xrd",
          usdValue: "1.019533662248249050241305494588154290321640578",
        },
        {
          activityId: "oc_lp_blu_xrd-xwbtc",
          usdValue: "0.742612394412",
        },
        {
          activityId: "oc_lp_der_xrd-xwbtc",
          usdValue: "1.0482984868717872005857362",
        },
        {
          activityId: "oc_lp_der_xeth-xrd",
          usdValue: "0.77544304911463889448774972",
        },
        {
          activityId: "oc_lp_blu_xeth-xrd",
          usdValue: "0.9577543114972802882851923566075",
        },
        {
          activityId: "oc_lp_sta_xrd-xusdc",
          usdValue: "0.946241820255333738984",
        },
        {
          activityId: "oc_lp_der_xrd-xusdc",
          usdValue: "1.31845611654800698007185812",
        },
        {
          activityId: "oc_lp_der_xrd-xusdt",
          usdValue: "0.86910531910358705212464108",
        },
        {
          activityId: "oc_lp_sta_xrd-xusdt",
          usdValue: "1.0960775314838244",
        },
      ].reduce(
        (acc, item) => {
          acc[item.activityId] = item;
          return acc;
        },
        {} as Record<string, AccountBalanceData>
      );

      const service = yield* Effect.provide(
        AggregateOciswapPositionsService,
        aggregateOciswapPositionsLive
      );

      const result = yield* service(input);

      for (const position of result) {
        const expectedPosition = expected[position.activityId];

        expect(
          position.usdValue,
          `usdValue for ${position.activityId}`
        ).toEqual(expectedPosition.usdValue);
      }
    })
  );
});
