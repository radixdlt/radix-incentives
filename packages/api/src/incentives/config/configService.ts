import { config } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Cache, Duration, Effect } from 'effect';
import { GetLedgerStateService } from '../../common/gateway/getLedgerState';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export const TransactionStreamStateKeys = {
  Initializing: 'INITIALIZING',
  Starting: 'STARTING',
  Running: 'RUNNING',
  Paused: 'PAUSED',
  Pausing: 'PAUSING',
} as const;

export type TransactionStreamStateKeys =
  (typeof TransactionStreamStateKeys)[keyof typeof TransactionStreamStateKeys];

export class ConfigService extends Effect.Service<ConfigService>()(
  'ConfigService',
  {
    dependencies: [GetLedgerStateService.Default, dbClientLive],
    effect: Effect.gen(function* () {
      const dbClient = yield* DbClientService;
      const getLedgerStateService = yield* GetLedgerStateService;

      const getConfigFromDb = Effect.fn(function* <T = unknown>(key: string) {
        const result = yield* Effect.tryPromise({
          try: () =>
            dbClient.query.config.findFirst({ where: eq(config.key, key) }),
          catch: (error) => new DbError(error),
        });

        const value = result?.value as T | undefined;

        return value;
      });

      const configCache = yield* Cache.make({
        capacity: 1000,
        timeToLive: Duration.infinity,
        lookup: (key: string) => getConfigFromDb(key),
      });

      const setConfig = Effect.fn(function* (key: string, value: unknown) {
        yield* Effect.tryPromise({
          try: () =>
            dbClient
              .insert(config)
              .values({ key, value })
              .onConflictDoUpdate({
                target: [config.key],
                set: { value },
              }),
          catch: (error) => new DbError(error),
        });
        yield* configCache.invalidate(key);
      });

      const getConfig = Effect.fn(function* <T = unknown>(key: string) {
        return (yield* configCache.get(key)) as T | undefined;
      });

      const setStartStateVersion = Effect.fn(function* (startTimestamp: Date) {
        const stateVersionResult = yield* getLedgerStateService({
          at_ledger_state: {
            timestamp: startTimestamp,
          },
        });

        yield* setConfig('stateVersion', stateVersionResult.state_version);

        return stateVersionResult.state_version;
      });

      return {
        setStartStateVersion,
        getStateVersion: Effect.fn(function* () {
          return yield* getConfig<number>('stateVersion');
        }),
        setStateVersion: Effect.fn(function* (stateVersion: number) {
          yield* setConfig('stateVersion', stateVersion);
        }),
        getTransactionStreamState: Effect.fn(function* () {
          return yield* getConfig<TransactionStreamStateKeys>(
            'transactionStreamState',
          ).pipe(Effect.map((state) => state ?? 'RUNNING'));
        }),
        setTransactionStreamState: Effect.fn(function* (
          value: TransactionStreamStateKeys,
        ) {
          yield* setConfig('transactionStreamState', value);
        }),
      };
    }),
  },
) {}
