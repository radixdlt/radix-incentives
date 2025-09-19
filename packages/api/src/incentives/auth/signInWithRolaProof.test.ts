import { layer } from '@effect/vitest';
import { user } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect, Logger } from 'effect';
import { createPersona } from '../../test-helpers/createPersona';
import { createRolaMessage } from '../../test-helpers/createRolaMessage';
import { truncateTables } from '../../test-helpers/truncateTables';
import { CreateChallengeService } from '../challenge/createChallenge';
import { DbClientService, dbClientLive } from '../db/dbClient';
import { SignInWithRolaProofService } from './signInWithRolaProof';

layer(SignInWithRolaProofService.Default)(
  'signInWithRolaProofService',
  (it) => {
    beforeEach(async () => {
      await truncateTables();
    });

    it.effect('should sign in with a valid rola proof', () =>
      Effect.gen(function* () {
        const signInWithRolaProofService = yield* SignInWithRolaProofService;
        const createChallengeService = yield* CreateChallengeService;
        const db = yield* DbClientService;
        const challenge = yield* createChallengeService();

        const persona = yield* createPersona();
        const rolaMessage = yield* createRolaMessage(challenge);
        const signature = persona.sign(rolaMessage);

        yield* signInWithRolaProofService({
          rolaProof: {
            challenge,
            type: 'persona',
            address: persona.address,
            label: 'test',
            proof: {
              publicKey: persona.publicKeyHex,
              signature,
              curve: 'curve25519',
            },
          },
        });

        const result = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(user)
            .where(eq(user.identityAddress, persona.address)),
        ).pipe(Effect.map(([user]) => user));

        expect(result).toHaveProperty('id', expect.any(String));
        expect(result).toHaveProperty('identityAddress', persona.address);
        expect(result).toHaveProperty('label', 'test');
        expect(result).toHaveProperty('referralCode', expect.any(String));
        expect(result).toHaveProperty('referredBy', null);

        // should fail to sign in with same proof
        const result2 = yield* signInWithRolaProofService({
          rolaProof: {
            challenge,
            type: 'persona',
            address: persona.address,
            label: 'test',
            proof: {
              publicKey: persona.publicKeyHex,
              signature,
              curve: 'curve25519',
            },
          },
        }).pipe(
          Effect.catchTag('InvalidChallengeError', () =>
            Effect.succeed('InvalidChallengeError'),
          ),
        );

        expect(result2).toBe('InvalidChallengeError');
      }).pipe(
        Effect.provide(CreateChallengeService.Default),
        Effect.provide(dbClientLive),
        Effect.provide(Logger.pretty),
      ),
    );
    it.effect('should fail to sign in with an invalid rola proof', () =>
      Effect.gen(function* () {
        const signInWithRolaProofService = yield* SignInWithRolaProofService;
        const createChallengeService = yield* CreateChallengeService;
        const challenge = yield* createChallengeService();

        const persona = yield* createPersona();

        const result = yield* signInWithRolaProofService({
          rolaProof: {
            challenge,
            type: 'persona',
            address: persona.address,
            label: 'test',
            proof: {
              publicKey: persona.publicKeyHex,
              signature: 'INVALID_SIGNATURE',
              curve: 'curve25519',
            },
          },
        }).pipe(
          Effect.catchTag('VerifyRolaProofError', () =>
            Effect.succeed('VerifyRolaProofError'),
          ),
        );

        expect(result).toBe('VerifyRolaProofError');
      }).pipe(
        Effect.provide(CreateChallengeService.Default),
        Effect.provide(dbClientLive),
        Effect.provide(Logger.pretty),
      ),
    );
  },
);
