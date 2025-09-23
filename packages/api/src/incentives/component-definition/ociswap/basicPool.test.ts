import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { GetComponentEntityDetails } from '../getComponentEntityDetails';
import { BasicPoolComponent } from './basicPool';

layer(GetComponentEntityDetails.Default)('fromComponentEntityDetails', (it) => {
  it.effect('should get basic pool component', () => {
    return Effect.gen(function* () {
      const getComponentEntityDetails = yield* GetComponentEntityDetails;
      const componentEntityDetails = yield* getComponentEntityDetails({
        componentAddresses: [
          'component_rdx1cpzydtpn2pvq5xp584mk5hz0nakq4dr5e6xv8mwhpuzd4flu6t2jv5',
        ],
        at_ledger_state: {
          timestamp: new Date(),
        },
      });
      const component = yield* BasicPoolComponent.fromComponentEntityDetails(
        componentEntityDetails[0],
      );
      yield* Effect.log(component);
    }).pipe(Effect.provide(Logger.pretty));
  });
});
