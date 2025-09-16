import { CaviarNineConstants } from 'data';
import { Effect, Layer } from 'effect';
import { GetLedgerStateService } from '../../gateway/getLedgerState';
import { GetResourceHoldersService } from '../../gateway/getResourceHolders';
import {
  GetShapeLiquidityAssetsLive,
  GetShapeLiquidityAssetsService,
} from './getShapeLiquidityAssets';

const getLedgerStateLive = GetLedgerStateService.Default;

const getResourceHoldersLive = GetResourceHoldersService.Default;

const getShapeLiquidityAssetsLive = GetShapeLiquidityAssetsLive;

describe('getShapeLiquidityAssets', () => {
  it('should get the shape liquidity assets', async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getShapeLiquidityAssetsService =
          yield* GetShapeLiquidityAssetsService;
        const getLedgerState = yield* GetLedgerStateService;
        const getResourceHoldersService = yield* GetResourceHoldersService;

        const state = yield* getLedgerState({
          at_ledger_state: {
            timestamp: new Date('2025-04-01T00:00:00.000Z'),
          },
        });

        const {
          componentAddress,
          liquidity_receipt: liquidityReceiptResourceAddress,
        } = CaviarNineConstants.shapeLiquidityPools.XRD_xUSDC;

        const resourceHolders = yield* getResourceHoldersService({
          resourceAddress: liquidityReceiptResourceAddress,
        });

        const addresses = resourceHolders
          .filter((item) => item.holder_address.startsWith('account_'))
          .map((item) => item.holder_address)
          .slice(0, 3);

        const result = yield* getShapeLiquidityAssetsService({
          componentAddress,
          addresses: addresses,
          priceBounds: {
            lower: 0.7,
            upper: 1.3,
          },
          at_ledger_state: {
            state_version: state.state_version,
          },
        });

        return result;
      }),
      Layer.mergeAll(
        getResourceHoldersLive,
        getLedgerStateLive,
        getShapeLiquidityAssetsLive,
      ),
    );

    const result = await Effect.runPromise(
      program.pipe(
        Effect.catchAll((error) => {
          console.error(JSON.stringify(error, null, 2));
          return Effect.fail(error);
        }),
      ),
    );

    expect(result.length).toBeGreaterThan(0);
  }, 300_000);
});
