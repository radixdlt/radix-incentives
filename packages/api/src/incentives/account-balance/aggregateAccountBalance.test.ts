import { it } from '@effect/vitest';
import { Effect, Layer } from 'effect';

import {
  AggregateAccountBalanceLive,
  AggregateAccountBalanceService,
} from './aggregateAccountBalance';
import { GetUsdValueLive } from '../token-price/getUsdValue';
import { AddressValidationServiceLive } from '../../common/address-validation/addressValidation';
import { AggregatePoolPositionsService } from './aggregatePoolPositions';
import { AggregateSurgePositionsLive } from './aggregateSurgePositions';
import { AggregateDefiPlazaPositionsLive } from './aggregateDefiPlazaPositions';
import { AggregateRootFinancePositionsServiceLive } from './aggregateRootFinancePositions';
import { AggregateWeftFinancePositionsServiceLive } from './aggregateWeftFinancePositions';
import { AggregateOciswapPositionsLive } from './aggregateOciswapPositions';
import { AggregateCaviarninePositionsLive } from './aggregateCaviarninePositions';
import { XrdBalanceLive } from './aggregateXrdBalance';
import { accountBalanceFixture } from './fixtures/accountBalances';
import { FetchService } from '../../common/helpers';

const addressValidationServiceLive = AddressValidationServiceLive;

const getUsdValueLive = GetUsdValueLive.pipe(
  Layer.provide(addressValidationServiceLive),
);

const aggregatePoolPositionsLive = AggregatePoolPositionsService.Default.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(addressValidationServiceLive),
);

const aggregateCaviarninePositionsLive = AggregateCaviarninePositionsLive.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(addressValidationServiceLive),
);

const aggregateOciswapPositionsLive = AggregateOciswapPositionsLive.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(addressValidationServiceLive),
);

const aggregateWeftFinancePositionsLive =
  AggregateWeftFinancePositionsServiceLive.pipe(Layer.provide(getUsdValueLive));

const aggregateRootFinancePositionsLive =
  AggregateRootFinancePositionsServiceLive.pipe(Layer.provide(getUsdValueLive));

const aggregateDefiPlazaPositionsLive = AggregateDefiPlazaPositionsLive.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(addressValidationServiceLive),
);

const aggregateSurgePositionsLive = AggregateSurgePositionsLive.pipe(
  Layer.provide(getUsdValueLive),
);

const xrdBalanceLive = XrdBalanceLive.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(addressValidationServiceLive),
);

const aggregateAccountBalanceLive = AggregateAccountBalanceLive.pipe(
  Layer.provide(aggregateCaviarninePositionsLive),
  Layer.provide(aggregateOciswapPositionsLive),
  Layer.provide(xrdBalanceLive),
  Layer.provide(aggregateWeftFinancePositionsLive),
  Layer.provide(aggregateRootFinancePositionsLive),
  Layer.provide(aggregateDefiPlazaPositionsLive),
  Layer.provide(aggregateSurgePositionsLive),
  Layer.provide(aggregatePoolPositionsLive),
  Layer.provide(FetchService.Default),
);

describe('aggregateAccountBalance', { retry: 0 }, () => {
  it.effect('should aggregate account balance', () =>
    Effect.gen(function* () {
      const aggregateAccountBalanceService = yield* Effect.provide(
        AggregateAccountBalanceService,
        aggregateAccountBalanceLive,
      );

      const result = yield* aggregateAccountBalanceService(
        // @ts-expect-error
        accountBalanceFixture.input,
      );

      for (const [index, item] of result[0].data.entries()) {
        const expected = accountBalanceFixture.output.data[index];
        expect(item.activityId, `activityId at index ${index}`).toEqual(
          expected.activityId,
        );
        expect(item.usdValue, `usdValue at index ${index}`).toEqual(
          expected.usdValue,
        );
      }
    }),
  );
});
