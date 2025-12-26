import { layer } from '@effect/vitest';
import {
  Duration,
  Effect,
  Fiber,
  Layer,
  Logger,
  Option,
  Redacted,
  TestClock,
} from 'effect';
import { HexString, NetworkId } from 'shared/brandedTypes';
import { createAccount } from '../../test-helpers/createAccount';
import { AccountAddress } from '../account-balance/v2/schemas';
import { CompileTransaction } from './compileTransaction';
import { CreateTransactionIntent } from './createTransactionIntent';
import { IntentHashService } from './intentHash';
import { faucet } from './manifests/faucet';
import { Signer } from './signer/signer';
import { SubmitTransaction } from './submitTransaction';
import { TransactionStatus } from './transactionStatus';

const testLayer = Layer.mergeAll(
  CreateTransactionIntent.Default,
  CompileTransaction.Default,
  SubmitTransaction.Default,
  TransactionStatus.Default,
  IntentHashService.Default,
).pipe(
  Layer.provide(
    Signer.makePrivateKeySigner(
      Redacted.make(
        HexString.make(
          'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        ),
      ),
    ),
  ),
);

layer(testLayer)('CreateTransactionIntent', (it) => {
  it.effect(
    'should create, compile, submit, and poll a transaction intent',
    () =>
      Effect.gen(function* () {
        yield* Effect.log('Creating transaction intent');
        const createTransactionIntent = yield* CreateTransactionIntent;
        const compileTransaction = yield* CompileTransaction;
        const submitTransaction = yield* SubmitTransaction;
        const pollTransactionStatus = yield* TransactionStatus;
        const intentHashService = yield* IntentHashService;
        const account = yield* createAccount({ networkId: 2 });
        yield* Effect.log('Creating transaction intent');
        const intent = yield* createTransactionIntent({
          networkId: NetworkId.make(2),
          manifest: yield* faucet(AccountAddress(account.address)),
        });
        yield* Effect.log('Notary public key', {
          notaryPublicKey: intent.header.notaryPublicKey.hexString(),
        });
        const { id } = yield* intentHashService.create(intent);
        yield* Effect.log('Compiling transaction');
        const compiledTransaction = yield* compileTransaction({
          intent,
          signatures: [],
        });
        yield* Effect.log('Submitting transaction');
        yield* submitTransaction({
          networkId: NetworkId.make(2),
          compiledTransaction: compiledTransaction,
        });
        yield* Effect.log('Polling transaction status');
        const fiber = yield* Effect.fork(
          pollTransactionStatus.poll({
            id,
            networkId: NetworkId.make(2),
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
      }).pipe(Effect.tapError(Effect.logError), Effect.provide(Logger.pretty)),
    {
      timeout: 300_000,
    },
  );
});
