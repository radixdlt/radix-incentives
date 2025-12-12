import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { VerifyRolaProofService } from './verifyRolaProof';

layer(VerifyRolaProofService.Default)('verifyRolaProofService', (it) => {
  it.effect('should verify a valid rola proof', () =>
    Effect.gen(function* () {
      const verifyRolaProofService = yield* VerifyRolaProofService;
      const challenge =
        '31bc7bd41e464ad32246ff980e8170568a6981cd88d5b9ca1095aa26af52cdf6';

      yield* verifyRolaProofService.verifyProofs({
        challenge,
        items: [
          {
            address:
              'identity_rdx12fykg2td6mn5d3pv7pa5frd5gy6jtxrp2lp39yxuelp23h9j3lk6d9',
            label: '',
            proof: {
              signature:
                '4e4980ebe46d9f008f4b47f2f0de709c8382272d337d7dd8c7ec7869ee93deeeff92b806ba5b2c4f74b069d227df962369dd1f69f741e6b0cd61c3703a702203',
              curve: 'curve25519',
              publicKey:
                'b9d8809652b39192a10287a3199257eb55cc729a643b2cf136adad8b65d3f022',
            },
            type: 'persona',
          },
        ],
      });
    }).pipe(Effect.provide(Logger.pretty)),
  );
});
