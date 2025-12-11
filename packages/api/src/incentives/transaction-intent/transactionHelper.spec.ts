import { it } from '@effect/vitest';
import { Cause, Effect, Exit, Logger, Redacted } from 'effect';
import { createAccount } from '../../test-helpers/createAccount';
import { DisableTestClock } from '../../test-helpers/disableTestClock';
import { HexString, NetworkId } from '../schemas/brandedTypes';
import { Signer } from './signer/signer';
import {
  TransactionHelper,
  TransactionHelperConfig,
  TransactionLifeCycleHook,
} from './transactionHelper';

const signer = Signer.makePrivateKeySigner(
  Redacted.make(
    HexString.make(
      'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    ),
  ),
);

process.env.NOTARIZER_PRIVATE_KEY =
  'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

describe.skip('TransactionHelper', () => {
  it.effect('should submit a transaction', () =>
    DisableTestClock(
      Effect.gen(function* () {
        const transactionHelper = yield* TransactionHelper;
        const account = yield* createAccount({ networkId: 2 });

        const transaction = yield* transactionHelper.faucet({
          account: {
            address: account.address,
            type: 'unsecurifiedAccount',
          },
        });

        expect(transaction).toBeDefined();
      }).pipe(
        Effect.provide(TransactionHelper.Default),
        Effect.provide(
          TransactionHelperConfig.provide({ networkId: NetworkId.make(2) }),
        ),
        Effect.provide(signer),
        Effect.provide(Logger.pretty),
        Effect.provideService(TransactionLifeCycleHook, {
          onSubmit: (input) => Effect.log(input),
        }),
      ),
    ),
  );

  it.effect(
    'should fail to submit a transaction if life cycle hook fails',
    () =>
      DisableTestClock(
        Effect.gen(function* () {
          const transactionHelper = yield* TransactionHelper;
          const account = yield* createAccount({ networkId: 2 });

          const exit = yield* transactionHelper
            .faucet({
              account: {
                address: account.address,
                type: 'unsecurifiedAccount',
              },
            })
            .pipe(Effect.exit);

          yield* Exit.match(exit, {
            onSuccess: () => Effect.die('expected failure'),
            onFailure: (cause) => Effect.succeed(Cause.isDie(cause)),
          });
        }).pipe(
          Effect.provide(TransactionHelper.Default),
          Effect.provide(
            TransactionHelperConfig.provide({ networkId: NetworkId.make(2) }),
          ),
          Effect.provide(signer),
          Effect.provide(Logger.pretty),
          Effect.provideService(TransactionLifeCycleHook, {
            onSubmit: Effect.die,
          }),
        ),
      ),
  );
});
