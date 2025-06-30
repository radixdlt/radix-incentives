import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Layer } from "effect";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import { GetUsdValueLive, GetUsdValueService } from "./getUsdValue";
import { AddressValidationServiceLive } from "../../common/address-validation/addressValidation";

describe("GetUsdValueService", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return USD value for xUSDC", async () => {
    const amount = new BigNumber("100");
    const timestamp = new Date("2024-01-01");
    const expectedPrice = 1;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          prices: {
            [Assets.Fungible.xUSDC]: { usd_price: expectedPrice },
          },
        }),
    });

    const program = Effect.provide(
      Effect.gen(function* () {
        const getUsdValue = yield* GetUsdValueService;
        return yield* getUsdValue({
          amount,
          resourceAddress: Assets.Fungible.xUSDC,
          timestamp,
        });
      }),
      Layer.mergeAll(GetUsdValueLive, AddressValidationServiceLive)
    );

    const result = await Effect.runPromise(program);

    expect(result.toString()).toBe("100");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://token-price-service.radixdlt.com/price/historicalPrice",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(Assets.Fungible.xUSDC),
      })
    );
  });

  it("should return USD value for XRD", async () => {
    const amount = new BigNumber("100");
    const timestamp = new Date("2024-01-01");
    const expectedPrice = 0.01;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          prices: {
            [Assets.Fungible.XRD]: { usd_price: expectedPrice },
          },
        }),
    });

    const program = Effect.provide(
      Effect.gen(function* () {
        const getUsdValue = yield* GetUsdValueService;
        return yield* getUsdValue({
          amount,
          resourceAddress: Assets.Fungible.XRD,
          timestamp,
        });
      }),
      Layer.mergeAll(GetUsdValueLive, AddressValidationServiceLive)
    );

    const result = await Effect.runPromise(program);

    expect(result.toString()).toBe("1");
  });

  it("should fail with InvalidResourceAddressError for unknown token", async () => {
    const amount = new BigNumber("100");
    const timestamp = new Date("2024-01-01");
    const invalidAddress = "invalid_address";

    const program = Effect.provide(
      Effect.gen(function* () {
        const getUsdValue = yield* GetUsdValueService;
        return yield* getUsdValue({
          amount,
          resourceAddress: invalidAddress,
          timestamp,
        });
      }),
      Layer.mergeAll(GetUsdValueLive, AddressValidationServiceLive)
    );

    await expect(Effect.runPromise(program)).rejects.toMatchObject({
      message: expect.stringContaining(
        "Invalid resource address: invalid_address"
      ),
    });
  });

  it("should fail with ApiError when API call fails", async () => {
    const amount = new BigNumber("100");
    const timestamp = new Date("2024-01-01");

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const program = Effect.provide(
      Effect.gen(function* () {
        const getUsdValue = yield* GetUsdValueService;
        return yield* getUsdValue({
          amount,
          resourceAddress: Assets.Fungible.XRD,
          timestamp,
        });
      }),
      Layer.mergeAll(GetUsdValueLive, AddressValidationServiceLive)
    );

    await expect(Effect.runPromise(program)).rejects.toMatchObject({
      message: expect.stringContaining("Failed to get USD value"),
    });
  });

  it("should fail with ApiError when API returns invalid response", async () => {
    const amount = new BigNumber("100");
    const timestamp = new Date("2024-01-01");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          prices: {}, // Missing price data
        }),
    });

    const program = Effect.provide(
      Effect.gen(function* () {
        const getUsdValue = yield* GetUsdValueService;
        return yield* getUsdValue({
          amount,
          resourceAddress: Assets.Fungible.XRD,
          timestamp,
        });
      }),
      Layer.mergeAll(GetUsdValueLive, AddressValidationServiceLive)
    );

    await expect(Effect.runPromise(program)).rejects.toMatchObject({
      message: expect.stringContaining("Failed to get USD value"),
    });
  });
});
