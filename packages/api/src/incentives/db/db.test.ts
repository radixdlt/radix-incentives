import { inject, it } from '@effect/vitest';
import { accounts } from 'db/incentives';
import { ConfigProvider, Effect } from 'effect';
import { DbService } from './dbClient';

it.effect('should create a db client', () =>
  Effect.gen(function* () {
    const db = yield* DbService;

    const result = yield* db.select().from(accounts).limit(1);

    expect(result).toBeDefined();
  }).pipe(
    Effect.provide(DbService.Default),
    Effect.withConfigProvider(
      ConfigProvider.fromJson({
        DATABASE_URL: inject('testDbUrl'),
      }),
    ),
  ),
);
