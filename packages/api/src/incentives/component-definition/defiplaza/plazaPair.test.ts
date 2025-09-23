import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { GetComponentEntityDetails } from '../getComponentEntityDetails';
import { PlazaPairSchema } from './plazaPair';

layer(GetComponentEntityDetails.Default)('fromComponentEntityDetails', (it) => {
  it.effect('should get basic pool component', () => {
    return Effect.gen(function* () {
      const getComponentEntityDetails = yield* GetComponentEntityDetails;
      const componentEntityDetails = yield* getComponentEntityDetails({
        componentAddresses: [
          'component_rdx1cp2jlkev5mvkr2grlyeyhghwxkanjs5j9ahntak6ah3x4dz27st7vv',
        ],
        at_ledger_state: {
          timestamp: new Date(),
        },
      });
      const component = yield* PlazaPairSchema.fromComponentEntityDetails(
        componentEntityDetails[0],
      );
      yield* Effect.log(component);
    }).pipe(Effect.provide(Logger.pretty));
  });
});
