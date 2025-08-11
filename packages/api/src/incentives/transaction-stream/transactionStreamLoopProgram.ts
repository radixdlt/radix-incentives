import { db } from 'db/incentives';
import { Config, Effect, Layer } from 'effect';
import { createTransactionStream } from 'radix-transaction-stream';
import { createRadixNetworkClient } from 'radix-web3.js';
import { AddressValidationServiceLive } from '../../common/address-validation/addressValidation';
import { GatewayApiClientLive } from '../../common/gateway/gatewayApiClient';
import { GetLedgerStateService } from '../../common/gateway/getLedgerState';
import { FetchService } from '../../common/helpers/fetch';
import { AddComponentCallsLive } from '../component/addComponentCalls';
import { createAppConfigLive, createConfig } from '../config/appConfig';
import { ConfigService } from '../config/configService';
import { createDbClientLive } from '../db/dbClient';
import { AddToEventQueueLive } from '../events/addToEventQueue';
import { EventQueueClientLive } from '../events/eventQueueClient';
import { AddEventsToDbLive } from '../events/queries/addEventToDb';
import { GetUsdValueLive } from '../token-price/getUsdValue';
import { AddTradingVolumeLive } from '../trading-volume/addTradingVolume';
import { FilterTradingEventsServiceLive } from '../trading-volume/filterTradingEvents';
import { ProcessSwapEventTradingVolumeLive } from '../trading-volume/processSwapEventTradingVolume';
import { AddTransactionFeeLive } from '../transaction-fee/addTransactionFee';
import { GetUserIdByAccountAddressLive } from '../user/getUserIdByAccountAddress';
import { FilterTransactionsLive } from './filterTransactions';
import { TransactionStreamLive } from './transactionStream';
import { TransactionStreamLoopService } from './transactionStreamLoop';

const config = createConfig({
  networkId: 1,
  logLevel: 'debug',
});

const configLive = createAppConfigLive(config);

const dbClientLive = createDbClientLive(db);

const apiGatewayClientLive = GatewayApiClientLive.pipe(
  Layer.provide(configLive),
);

const getLedgerStateLive = GetLedgerStateService.Default.pipe(
  Layer.provide(apiGatewayClientLive),
  Layer.provide(configLive),
);

const addEventsLive = AddEventsToDbLive.pipe(Layer.provide(dbClientLive));

const getAccountAddressByUserIdLive = GetUserIdByAccountAddressLive.pipe(
  Layer.provide(dbClientLive),
);

const addComponentCallsLive = AddComponentCallsLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getAccountAddressByUserIdLive),
);

const transactionStreamClient = createTransactionStream({
  gatewayApi: createRadixNetworkClient({
    networkId: config.networkId,
  }),
  optIns: {
    detailed_events: true,
    balance_changes: true,
    manifest_instructions: true,
  },
  startStateVersion: 1,
});

const transactionStreamLive = TransactionStreamLive(transactionStreamClient);

const filterTransactionsLive = FilterTransactionsLive.pipe(
  Layer.provide(dbClientLive),
);

const eventQueueClientLive = EventQueueClientLive;

const addToEventQueueLive = AddToEventQueueLive.pipe(
  Layer.provide(eventQueueClientLive),
);

const addTransactionFeeLive = AddTransactionFeeLive.pipe(
  Layer.provide(dbClientLive),
);

const addTradingVolumeLive = AddTradingVolumeLive.pipe(
  Layer.provide(dbClientLive),
);

const addressValidationServiceLive = AddressValidationServiceLive;

const getUsdValueLive = GetUsdValueLive.pipe(
  Layer.provide(addressValidationServiceLive),
);

const filterTradingEventsLive = FilterTradingEventsServiceLive.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(addressValidationServiceLive),
  Layer.provide(dbClientLive),
);

const processSwapEventTradingVolumeLive =
  ProcessSwapEventTradingVolumeLive.pipe(
    Layer.provide(filterTradingEventsLive),
    Layer.provide(addTradingVolumeLive),
  );

const configServiceLive = ConfigService.Default.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getLedgerStateLive),
);

const transactionStreamLoopLive = TransactionStreamLoopService.Default.pipe(
  Layer.provide(transactionStreamLive),
  Layer.provide(configServiceLive),
  Layer.provide(filterTransactionsLive),
  Layer.provide(addEventsLive),
  Layer.provide(addToEventQueueLive),
  Layer.provide(addTransactionFeeLive),
  Layer.provide(addComponentCallsLive),
  Layer.provide(processSwapEventTradingVolumeLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(FetchService.Default),
);

export const transactionStreamLoopProgram = () => {
  const runnable = Effect.provide(
    Effect.gen(function* () {
      const transactionStreamEnabled = yield* Config.boolean(
        'TRANSACTION_STREAM_ENABLED',
      ).pipe(Config.withDefault(true));

      if (!transactionStreamEnabled) {
        yield* Effect.log('Transaction streamer is disabled');
        return;
      }

      const transactionStreamLoopService = yield* TransactionStreamLoopService;
      const configService = yield* ConfigService;

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
        yield* Effect.log(
          `Starting streamer from last processed state version: ${lastProcessedStateVersion}`,
        );
      } else {
        yield* Effect.log(
          `Starting streamer from current date: ${new Date().toISOString()}`,
        );
        yield* configService.setStartStateVersion(new Date());
      }

      return yield* transactionStreamLoopService.run();
    }),
    Layer.merge(transactionStreamLoopLive, configServiceLive),
  );

  return Effect.runPromise(runnable);
};
