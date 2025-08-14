import { db } from 'db/incentives';
import { Context, Effect, Layer, Ref } from 'effect';
import { z } from 'zod';
import {
  GatewayApiClientLive,
  GetLedgerStateService,
} from '../../common/gateway';
import { createAppConfigLive, createConfig } from '../config';
import {
  ConfigService,
  TransactionStreamStateKeys,
} from '../config/configService';
import { createDbClientLive } from '../db/dbClient';

export class TransactionStreamLoopState extends Context.Tag(
  'TransactionStreamLoopState',
)<TransactionStreamLoopState, Ref.Ref<TransactionStreamStateKeys>>() {}

export const transactionStreamLoopState =
  Ref.make<TransactionStreamStateKeys>('STARTING');

// Create a shared state instance
export const sharedTransactionStreamState = Effect.runSync(
  transactionStreamLoopState,
);

const dbClientLive = createDbClientLive(db);

const config = createConfig({
  networkId: 1,
  logLevel: 'debug',
});

const configLive = createAppConfigLive(config);

const apiGatewayClientLive = GatewayApiClientLive.pipe(
  Layer.provide(configLive),
);

const getLedgerStateLive = GetLedgerStateService.Default.pipe(
  Layer.provide(apiGatewayClientLive),
  Layer.provide(configLive),
);

const configServiceLive = ConfigService.Default.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getLedgerStateLive),
);

export const setTransactionStreamState = Effect.fn(function* (
  value: TransactionStreamStateKeys,
) {
  const state = yield* TransactionStreamLoopState;
  const configService = yield* Effect.provide(ConfigService, configServiceLive);
  yield* Ref.update(state, () => value);
  yield* configService.setTransactionStreamState(value);
  yield* Effect.log(`Transaction stream state set to: ${value}`);
});

export const setTransactionStreamStateVersion = Effect.fn(function* (
  value: number,
) {
  const configService = yield* Effect.provide(ConfigService, configServiceLive);
  yield* configService.setStateVersion(value);
  yield* Effect.log(`Transaction stream state version set to: ${value}`);
});

const transactionStreamStateSchema = z.enum([
  TransactionStreamStateKeys.Starting,
  TransactionStreamStateKeys.Running,
  TransactionStreamStateKeys.Paused,
  TransactionStreamStateKeys.Pausing,
] as const);

export const setTransactionStreamStateProgram = (
  value: TransactionStreamStateKeys,
) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const parsedState = transactionStreamStateSchema.safeParse(value);
      if (!parsedState.success) {
        return yield* Effect.fail(parsedState.error.message);
      }
      yield* setTransactionStreamState(parsedState.data);
    }).pipe(
      Effect.provideService(
        TransactionStreamLoopState,
        sharedTransactionStreamState,
      ),
    ),
  );

const transactionStreamStateVersionSchema = z.number();

export const setTransactionStreamStateVersionProgram = (value: number) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const parsedStateVersion =
        transactionStreamStateVersionSchema.safeParse(value);
      if (!parsedStateVersion.success) {
        return yield* Effect.fail(parsedStateVersion.error.message);
      }
      yield* setTransactionStreamStateVersion(parsedStateVersion.data);
    }),
  );
