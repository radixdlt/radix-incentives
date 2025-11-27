import { layer } from '@effect/vitest';
import { RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import { Duration, Effect, Fiber, Logger, Option, TestClock } from 'effect';
import { createAccount } from '../../test-helpers/createAccount';
import { CompileTransaction } from './compileTransaction';
import { CreateTransactionIntent } from './createTransactionIntent';
import { NetworkId, TransactionManifestString } from './schemas';
import { SubmitTransaction } from './submitTransaction';
import { TransactionStatus } from './transactionStatus';

process.env.NOTARIZER_PRIVATE_KEY =
  'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

layer(CreateTransactionIntent.Default)('CreateTransactionIntent', (it) => {
  it.effect(
    'should create, compile, submit, and poll a transaction intent',
    () =>
      Effect.gen(function* () {
        const createTransactionIntent = yield* CreateTransactionIntent;
        const compileTransaction = yield* CompileTransaction;
        const submitTransaction = yield* SubmitTransaction;
        const pollTransactionStatus = yield* TransactionStatus;

        const account = yield* createAccount({ networkId: 2 });

        const knownAddresses = yield* Effect.tryPromise(() =>
          RadixEngineToolkit.Utils.knownAddresses(2),
        );

        const faucetManifest = TransactionManifestString(`
        CALL_METHOD
          Address("${knownAddresses.componentAddresses.faucet}")
          "lock_fee"
          Decimal("10")
        ;

        CALL_METHOD
          Address("${knownAddresses.componentAddresses.faucet}")
          "free"
        ;

        CALL_METHOD
          Address("${account.address}")
          "try_deposit_batch_or_abort"
          Expression("ENTIRE_WORKTOP")
          Enum<0u8>()
        ;`);

        yield* Effect.log('Creating transaction intent');
        const { intent, id } = yield* createTransactionIntent({
          networkId: NetworkId(2),
          manifest: faucetManifest,
        });

        yield* Effect.log('Compiling transaction');
        const compiledTransaction = yield* compileTransaction({
          intent,
          signatures: [],
        });

        yield* Effect.log('Submitting transaction');
        yield* submitTransaction({
          networkId: NetworkId(2),
          compiledTransaction: compiledTransaction,
        });

        yield* Effect.log('Polling transaction status');
        const fiber = yield* Effect.fork(
          pollTransactionStatus.poll({
            id,
            networkId: NetworkId(2),
          }),
        );

        while (Option.isNone(yield* Fiber.poll(fiber))) {
          yield* Effect.promise(
            async () => new Promise((resolve) => setTimeout(resolve, 1000)),
          );
          yield* TestClock.adjust(Duration.seconds(1));
        }

        const statusResult = yield* Fiber.join(fiber);

        yield* Effect.log('Transaction status', {
          id,
          status: statusResult.intent_status,
        });

        expect(statusResult).toBeDefined();
      }).pipe(
        // Effect.provide(TestContext.TestContext),
        Effect.provide(Logger.pretty),
        Effect.provide(CompileTransaction.Default),
        Effect.provide(SubmitTransaction.Default),
        Effect.provide(TransactionStatus.Default),
      ),
  );
});
