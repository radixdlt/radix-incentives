import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Layer } from "effect";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import { GetUsdValueLive, GetUsdValueService, InvalidResourceAddressError, ApiError } from "./getUsdValue";

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
      json: () => Promise.resolve({
        prices: {
          [Assets.Fungible.xUSDC]: { usd_price: expectedPrice }
        }
      })
    });

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: Assets.Fungible.xUSDC,
        timestamp
      });
    });

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(GetUsdValueLive)
      )
    );

    expect(result.toString()).toBe("100");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://token-price-service.radixdlt.com/price/historicalPrice",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-api-key": "SsNUTBBoJKg5tINqUKv9"
        }),
        body: expect.stringContaining(Assets.Fungible.xUSDC)
      })
    );
  });

  it("should return USD value for XRD", async () => {
    const amount = new BigNumber("100");
    const timestamp = new Date("2024-01-01");
    const expectedPrice = 0.01;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        prices: {
          [Assets.Fungible.XRD]: { usd_price: expectedPrice }
        }
      })
    });

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: Assets.Fungible.XRD,
        timestamp
      });
    });

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(GetUsdValueLive)
      )
    );

    expect(result.toString()).toBe("1");
  });

  it("should fail with InvalidResourceAddressError for unknown token", async () => {
    const amount = new BigNumber("100");
    const timestamp = new Date("2024-01-01");
    const invalidAddress = "invalid_address";

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: invalidAddress,
        timestamp
      });
    });

    await expect(
      Effect.runPromise(
        program.pipe(
          Effect.provide(GetUsdValueLive)
        )
      )
    ).rejects.toMatchObject({
        message: expect.stringContaining("Invalid resource address: invalid_address")    });
  });

  it("should fail with ApiError when API call fails", async () => {
    const amount = new BigNumber("100");
    const timestamp = new Date("2024-01-01");

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: Assets.Fungible.XRD,
        timestamp
      });
    });

    await expect(
      Effect.runPromise(
        program.pipe(
          Effect.provide(GetUsdValueLive)
        )
      )
    ).rejects.toMatchObject({
      message: expect.stringContaining("Failed to get USD value")
    });
  });

  it("should fail with ApiError when API returns invalid response", async () => {
    const amount = new BigNumber("100");
    const timestamp = new Date("2024-01-01");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        prices: {} // Missing price data
      })
    });

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: Assets.Fungible.XRD,
        timestamp
      });
    });

    await expect(
      Effect.runPromise(
        program.pipe(
          Effect.provide(GetUsdValueLive)
        )
      )
    ).rejects.toMatchObject({
      message: expect.stringContaining("Failed to get USD value")
    });
  });
}); 