import { BigNumber } from 'bignumber.js';
import { Assets } from 'data';
import { Effect, Layer } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddressValidationServiceLive } from '../../common/address-validation/addressValidation';
import { FetchService } from '../../common/helpers';
import { GetUsdValueService } from './getUsdValue';

describe('GetUsdValueService', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFetchLayer = Layer.succeed(FetchService, mockFetch as any);

  const getUsdValueLive = GetUsdValueService.DefaultWithoutDependencies.pipe(
    Layer.provide(AddressValidationServiceLive),
    Layer.provide(mockFetchLayer),
  );

  it('should return USD value for xUSDC', async () => {
    const amount = new BigNumber('100');
    const timestamp = new Date('2025-01-01');
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

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: Assets.Fungible.xUSDC,
        timestamp,
      });
    }).pipe(Effect.provide(getUsdValueLive));

    const result = await Effect.runPromise(program);

    expect(result.toString()).toBe('100');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://token-price-service.radixdlt.com/price/historicalPrice',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(Assets.Fungible.xUSDC),
      }),
    );
  });

  it('should return USD value for XRD', async () => {
    const amount = new BigNumber('100');
    const timestamp = new Date('2025-01-01');
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

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: Assets.Fungible.XRD,
        timestamp,
      });
    }).pipe(Effect.provide(getUsdValueLive));

    const result = await Effect.runPromise(program);

    expect(result.toString()).toBe('1');
  });

  it('should use fallback price for unknown token', async () => {
    const amount = new BigNumber('100');
    const timestamp = new Date('2025-01-01');
    const invalidAddress = 'invalid_address';

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Price missing for tokens: invalid_address'),
    });

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: invalidAddress,
        timestamp,
      });
    }).pipe(Effect.provide(getUsdValueLive));

    const result = await Effect.runPromise(program);

    expect(result.toString()).toBe('100');
  });

  it('should fail with ApiError when API call fails', async () => {
    const amount = new BigNumber('100');
    const timestamp = new Date('2025-01-01');

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: Assets.Fungible.XRD,
        timestamp,
      });
    }).pipe(Effect.provide(getUsdValueLive));

    await expect(Effect.runPromise(program)).rejects.toMatchObject({
      name: expect.stringContaining('PriceServiceApiError'),
    });
  });

  it('should fail with ApiError when API returns invalid response', async () => {
    const amount = new BigNumber('100');
    const timestamp = new Date('2025-01-01');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          prices: {}, // Missing price data
        }),
    });

    const program = Effect.gen(function* () {
      const getUsdValue = yield* GetUsdValueService;
      return yield* getUsdValue({
        amount,
        resourceAddress: Assets.Fungible.XRD,
        timestamp,
      });
    }).pipe(Effect.provide(getUsdValueLive));

    await expect(Effect.runPromise(program)).rejects.toMatchObject({
      name: expect.stringContaining('PriceServiceApiError'),
    });
  });
});
