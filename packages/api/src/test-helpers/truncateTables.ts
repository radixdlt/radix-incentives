import {
  activityCategories,
  challenge,
  marginAccounts,
  seasons,
  sessions,
  users,
} from 'db/incentives';
import { Effect } from 'effect';
import { DbClientService, dbClientLive } from '../incentives/db/dbClient';

export const truncateTables = async () => {
  const runnable = Effect.gen(function* () {
    const db = yield* DbClientService;
    yield* Effect.promise(() =>
      Promise.all([
        db.delete(users),
        db.delete(seasons),
        db.delete(activityCategories),
        db.delete(marginAccounts),
        db.delete(challenge),
        db.delete(sessions),
      ]),
    );
  }).pipe(Effect.provide(dbClientLive));

  await Effect.runPromise(runnable);
};
