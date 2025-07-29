import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { AggregateOciswapPositionsService } from "./aggregateOciswapPositions";
import { AddressValidationServiceLive } from "../../common/address-validation/addressValidation";
import { GetUsdValueLive } from "../token-price/getUsdValue";
import { ActivityId } from "data";

const getUsdValueLive = GetUsdValueLive.pipe(
  Layer.provide(AddressValidationServiceLive)
);

const aggregateOciswapPositionsLive =
  AggregateOciswapPositionsService.Default.pipe(
    Layer.provide(AddressValidationServiceLive),
    Layer.provide(getUsdValueLive)
  );

const ociswapLpActivityIds = Object.values(ActivityId).filter(
  (id) => id.startsWith("oci_lp_") || id.startsWith("oci_nativeLp_")
);

const expectedActivityIds = new Set(ociswapLpActivityIds);

describe("AggregateOciswapPositionsService", () => {
  it.effect("should return defaults when no positions are found", () =>
    Effect.gen(function* () {
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
        // @ts-expect-error
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

      const output = {
        "oci_lp_xrd-xwbtc": {
          activityId: "oci_lp_xrd-xwbtc",
          usdValue: "0.742612394412",
          poolShare: undefined,
          metadata: {
            component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr:
              {
                componentAddress:
                  "component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr",
                tokenPair: "xrd-xwbtc",
                baseToken: {
                  resourceAddress:
                    "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75",
                  amount: "0.00000645",
                  outsidePriceBounds: "0.000011",
                  isNativeAsset: false,
                },
                quoteToken: {
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                  amount: "124.065452742129436395",
                  outsidePriceBounds: "67.950153111894416275",
                  isNativeAsset: true,
                },
              },
          },
        },
        "oci_lp_xeth-xrd": {
          activityId: "oci_lp_xeth-xrd",
          usdValue: "0.95775431149728028829",
          poolShare: undefined,
          metadata: {
            component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm:
              {
                componentAddress:
                  "component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm",
                tokenPair: "xeth-xrd",
                baseToken: {
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                  amount: "91.773186901405386137",
                  outsidePriceBounds: "171.162288985923567894",
                  isNativeAsset: true,
                },
                quoteToken: {
                  resourceAddress:
                    "resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww",
                  amount: "0.000267495492726955",
                  outsidePriceBounds: "0.000105848187477184",
                  isNativeAsset: false,
                },
              },
          },
        },
        "oci_lp_xrd-xusdc": {
          activityId: "oci_lp_xrd-xusdc",
          usdValue: "0.94624182025533373898",
          poolShare: undefined,
          metadata: {
            component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f:
              {
                componentAddress:
                  "component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f",
                tokenPair: "xrd-xusdc",
                baseToken: {
                  resourceAddress:
                    "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
                  amount: "0.954428",
                  outsidePriceBounds: "3.106827",
                  isNativeAsset: false,
                },
                quoteToken: {
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                  amount: "156.038434728909787027",
                  outsidePriceBounds: "498.39880232876903961",
                  isNativeAsset: true,
                },
              },
          },
        },
        "oci_lp_xrd-xusdt": {
          activityId: "oci_lp_xrd-xusdt",
          usdValue: "1.0960775314838244",
          poolShare: undefined,
          metadata: {
            component_rdx1cz79xc57dpuhzd3wylnc88m3pyvfk7c5e03me2qv7x8wh9t6c3aw4g:
              {
                componentAddress:
                  "component_rdx1cz79xc57dpuhzd3wylnc88m3pyvfk7c5e03me2qv7x8wh9t6c3aw4g",
                tokenPair: "xrd-xusdt",
                baseToken: {
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                  amount: "102.858056408095457293",
                  outsidePriceBounds: "86.78433356303994655",
                  isNativeAsset: true,
                },
                quoteToken: {
                  resourceAddress:
                    "resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw",
                  amount: "1.106921",
                  outsidePriceBounds: "1.2875",
                  isNativeAsset: false,
                },
              },
          },
        },
        "oci_nativeLp_oci-xrd": {
          activityId: "oci_nativeLp_oci-xrd",
          usdValue: "2.6843196399113001469",
          poolShare: {
            component_rdx1crm530ath85gcwm4gvwq8m70ay07df085kmupp6gte3ew94vg5pdcp: 0.671375884505564,
            component_rdx1cz89w3ecvh9jvdd892vycs44rr042lteg75zgdydq9csn5d87snvdw: 0.32862411549443604,
          },
          metadata: {
            component_rdx1crm530ath85gcwm4gvwq8m70ay07df085kmupp6gte3ew94vg5pdcp:
              {
                componentAddress:
                  "component_rdx1crm530ath85gcwm4gvwq8m70ay07df085kmupp6gte3ew94vg5pdcp",
                tokenPair: "oci-xrd",
                baseToken: {
                  resourceAddress:
                    "resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8",
                  amount: "95.406931784173501506",
                  outsidePriceBounds: "130.214679367119580454",
                  isNativeAsset: true,
                },
                quoteToken: {
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                  amount: "122.631109425377016933",
                  outsidePriceBounds: "97.191923051209292297",
                  isNativeAsset: true,
                },
              },
            component_rdx1cz89w3ecvh9jvdd892vycs44rr042lteg75zgdydq9csn5d87snvdw:
              {
                componentAddress:
                  "component_rdx1cz89w3ecvh9jvdd892vycs44rr042lteg75zgdydq9csn5d87snvdw",
                tokenPair: "oci-xrd",
                baseToken: {
                  resourceAddress:
                    "resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8",
                  amount: "108.86684748897750486997876748204838537152",
                  outsidePriceBounds: "0",
                  isNativeAsset: true,
                },
                quoteToken: {
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                  amount: "105.3531839176594986465481234028185276904",
                  outsidePriceBounds: "0",
                  isNativeAsset: true,
                },
              },
          },
        },
        "oci_nativeLp_ilis-xrd": {
          activityId: "oci_nativeLp_ilis-xrd",
          usdValue: "2.09572672435589195422",
          poolShare: undefined,
          metadata: {
            component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd:
              {
                componentAddress:
                  "component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd",
                tokenPair: "ilis-xrd",
                baseToken: {
                  resourceAddress:
                    "resource_rdx1t4r86qqjtzl8620ahvsxuxaf366s6rf6cpy24psdkmrlkdqvzn47c2",
                  amount: "295.39039885146696781200638650391476665835",
                  outsidePriceBounds: "0",
                  isNativeAsset: true,
                },
                quoteToken: {
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                  amount: "241.3223084393149584691523569483273188951",
                  outsidePriceBounds: "0",
                  isNativeAsset: true,
                },
              },
          },
        },
        "oci_nativeLp_early-xrd": {
          activityId: "oci_nativeLp_early-xrd",
          usdValue: "0.77073798706687632338",
          poolShare: undefined,
          metadata: {
            component_rdx1cz8p5lc8vmj96hdguy02hkfq4z5xyxf9k759dj8ym8exj8x8zgmw9p:
              {
                componentAddress:
                  "component_rdx1cz8p5lc8vmj96hdguy02hkfq4z5xyxf9k759dj8ym8exj8x8zgmw9p",
                tokenPair: "early-xrd",
                baseToken: {
                  resourceAddress:
                    "resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s",
                  amount: "800.31048567353294943932607671780543697108",
                  outsidePriceBounds: "0",
                  isNativeAsset: true,
                },
                quoteToken: {
                  resourceAddress:
                    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                  amount: "87.55060125482761792367960893507371293368",
                  outsidePriceBounds: "0",
                  isNativeAsset: true,
                },
              },
          },
        },
      };

      const service = yield* Effect.provide(
        AggregateOciswapPositionsService,
        aggregateOciswapPositionsLive
      );

      const result = yield* service(input);

      for (const position of result) {
        // @ts-expect-error
        expect(position).toEqual(output[position.activityId]);
      }
    })
  );
});
