import { it } from '@effect/vitest';
import { accounts } from 'db/incentives';
import { Effect } from 'effect';
import { dbTestLive } from '../../test-helpers/dbTestLive';
import { DbClientService, DbError } from './dbClient';

it.effect('should create a db client', () =>
  Effect.gen(function* () {
    const db = yield* DbClientService;

    const result = yield* Effect.tryPromise({
      try: () => db.select().from(accounts).limit(1),
      catch: (error) => new DbError(error),
    });

    expect(result).toBeDefined();
  }).pipe(Effect.provide(dbTestLive)),
);
