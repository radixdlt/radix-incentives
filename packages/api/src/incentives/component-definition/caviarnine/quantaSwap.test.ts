import { layer } from '@effect/vitest';
import { Effect } from 'effect';
import { GetComponentEntityDetails } from '../getComponentEntityDetails';
import { QuantaSwapComponent } from './quantaSwap';

layer(GetComponentEntityDetails.Default)('getTVL', (it) => {
  it.effect('should get TVL', () => {
    return Effect.gen(function* () {
      const getComponentEntityDetails = yield* GetComponentEntityDetails;

      const [componentEntityDetails] = yield* getComponentEntityDetails({
        componentAddresses: [
          'component_rdx1cp9w8443uyz2jtlaxnkcq84q5a5ndqpg05wgckzrnd3lgggpa080ed',
        ],
        at_ledger_state: {
          timestamp: new Date(),
        },
      });

      const _quantaSwapComponent =
        yield* QuantaSwapComponent.fromComponentEntityDetails(
          componentEntityDetails,
        );
    });
  });
});
