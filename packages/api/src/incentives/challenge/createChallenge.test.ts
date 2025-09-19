import { layer } from '@effect/vitest';
import { challenge } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { truncateTables } from '../../test-helpers/truncateTables';
import { DbClientService, dbClientLive } from '../db/dbClient';
import { CreateChallengeService } from './createChallenge';

layer(CreateChallengeService.Default)('createChallengeService', (it) => {
  beforeEach(async () => {
    await truncateTables();
  });
  it.effect('should create a challenge', () =>
    Effect.gen(function* () {
      const createChallengeService = yield* CreateChallengeService;
      const db = yield* DbClientService;

      const newChallenge = yield* createChallengeService();

      const result = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(challenge)
          .where(eq(challenge.challenge, newChallenge))
          .limit(1)
          .then(([value]) => value),
      );

      // expect challenge to be a hexadecimal string of length 64
      expect(newChallenge).toMatch(/^[0-9a-f]{64}$/);
      expect(result).toHaveProperty('createdAt', expect.any(Date));
    }).pipe(Effect.provide(dbClientLive)),
  );
});
