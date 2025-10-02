import { accounts, users } from 'db/incentives';
import { Effect } from 'effect';
import { DbClientService, dbClientLive } from '../incentives/db/dbClient';
import { createAccount } from './createAccount';

export const createUser = Effect.gen(function* () {
  const db = yield* DbClientService;
  const { address } = yield* createAccount();
  const [user] = yield* Effect.promise(() =>
    db
      .insert(users)
      .values({ identityAddress: crypto.randomUUID() })
      .returning(),
  );
  const [account] = yield* Effect.promise(() =>
    db
      .insert(accounts)
      .values({ userId: user.id, address, label: 'Account' })
      .returning(),
  );

  return { user, account };
}).pipe(Effect.provide(dbClientLive));
