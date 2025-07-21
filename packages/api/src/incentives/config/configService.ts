import { Duration, Effect, Cache } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { eq } from "drizzle-orm";
import { config } from "db/incentives";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";

export class ConfigService extends Effect.Service<ConfigService>()(
  "ConfigService",
  {
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

        yield* setConfig("stateVersion", stateVersionResult.state_version);

        return stateVersionResult.state_version;
      });

      return {
        setStartStateVersion,
        getStateVersion: Effect.fn(function* () {
          return yield* getConfig<number>("stateVersion");
        }),
        setStateVersion: Effect.fn(function* (stateVersion: number) {
          yield* setConfig("stateVersion", stateVersion);
        }),
      };
    }),
  }
) {}
