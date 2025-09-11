import { Config, Effect, Layer, Schedule } from 'effect';
import { GetLedgerStateService } from '../../common/gateway/getLedgerState';
import { ConfigService } from '../config/configService';
import { MarginAccountDbService } from '../surge/marginAccountDbService';
import { SurgeComponentAddressService } from '../surge/surgeComponentAddressService';
import { UpdateMarginAccountOwnerService } from '../surge/updateMarginAccountOwner';
import { TransactionStreamLoopService } from './transactionStreamLoop';
import {
  setTransactionStreamState,
  sharedTransactionStreamState,
  TransactionStreamLoopState,
} from './transactionStreamState';

const getLedgerStateLive = GetLedgerStateService.Default;

export const transactionStreamLoopProgram = async () => {
  await Effect.runPromise(
    Effect.gen(function* () {
      const configService = yield* ConfigService;

      const transactionStreamState =
        yield* configService.getTransactionStreamState();

      yield* setTransactionStreamState(transactionStreamState);
    }).pipe(
      Effect.provide(ConfigService.Default),
      Effect.provideService(
        TransactionStreamLoopState,
        sharedTransactionStreamState,
      ),
    ),
  );

  const runnable = Effect.provide(
    Effect.gen(function* () {
      const transactionStreamEnabled = yield* Config.boolean(
        'TRANSACTION_STREAM_ENABLED',
      ).pipe(Config.withDefault(true));

      if (!transactionStreamEnabled) {
        yield* Effect.log(
          'Transaction streamer is disabled through TRANSACTION_STREAM_ENABLED',
        );
        return;
      }

      const configService = yield* ConfigService;

      const transactionStreamState =
        yield* configService.getTransactionStreamState();

      if (
        yield* configService
          .getTransactionStreamState()
          .pipe(Effect.map((state) => state === 'PAUSED'))
      ) {
        return;
      }

      const surgeComponentAddressService = yield* SurgeComponentAddressService;
      yield* surgeComponentAddressService.initialize();

      const transactionStreamLoopService = yield* TransactionStreamLoopService;
      const getLedgerStateService = yield* GetLedgerStateService;

      yield* setTransactionStreamState(transactionStreamState);

      const startTimestamp = yield* Config.string('START_TIMESTAMP').pipe(
        Config.withDefault(null),
      );

      const lastProcessedStateVersion = yield* configService.getStateVersion();

      if (startTimestamp) {
        yield* Effect.log(
          `Starting streamer from START_TIMESTAMP: ${startTimestamp}`,
        );
        yield* configService.setStartStateVersion(new Date(startTimestamp));
      } else if (lastProcessedStateVersion) {
        const ledgerState = yield* getLedgerStateService({
          at_ledger_state: {
            state_version: lastProcessedStateVersion,
          },
        });
        yield* Effect.log(
          `Starting streamer from last processed state version: ${lastProcessedStateVersion}, timestamp: ${ledgerState.proposer_round_timestamp}`,
        );
      } else {
        yield* Effect.log(
          `Starting streamer from current date: ${new Date().toISOString()}`,
        );
        yield* configService.setStartStateVersion(new Date());
      }

      yield* transactionStreamLoopService.run();

      if ((yield* configService.getTransactionStreamState()) !== 'PAUSED') {
        yield* setTransactionStreamState('PAUSED');
      }
    }),
    Layer.mergeAll(
      TransactionStreamLoopService.Default,
      ConfigService.Default,
      getLedgerStateLive,
      SurgeComponentAddressService.Default,
      MarginAccountDbService.Default,
      UpdateMarginAccountOwnerService.Default,
    ),
  ).pipe(
    Effect.provideService(
      TransactionStreamLoopState,
      sharedTransactionStreamState,
    ),
  );

  return Effect.runPromise(Effect.repeat(runnable, Schedule.forever));
};
