import { DappConstants } from 'data';
import { config } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

// Fallback value from constants
const HARDCODED_SURGE_COMPONENT =
  DappConstants.Surge.constants.exchange.componentAddress;

// Module-level cache for synchronous access
// Allows event matchers and other code to access all historical addresses without service dependencies
let allSurgeComponentAddresses: Set<string> = new Set([
  HARDCODED_SURGE_COMPONENT,
]);

// Standalone synchronous function that can be used by event matchers
// Now checks against all historical component addresses
export const isSurgeComponent = (componentAddress: string): boolean => {
  return allSurgeComponentAddresses.has(componentAddress);
};

// Get all historical component addresses (for debugging/testing)
export const getAllSurgeComponents = (): string[] => {
  return Array.from(allSurgeComponentAddresses);
};

export class SurgeComponentAddressService extends Effect.Service<SurgeComponentAddressService>()(
  'SurgeComponentAddressService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const dbClient = yield* DbClientService;

      // In-memory cache for all historical addresses
      let cachedAddresses: Set<string> | null = null;

      const loadFromDatabase = Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            dbClient.query.config.findFirst({
              where: eq(config.key, 'surge_component_addresses'),
            }),
          catch: (error) => new DbError(error),
        });

        // Parse JSONB array of historical component addresses
        if (result?.value && Array.isArray(result.value)) {
          return new Set(result.value as string[]);
        }
        return null;
      }).pipe(Effect.catchAll(() => Effect.succeed(null)));

      const saveToDatabase = (addresses: Set<string>) =>
        Effect.gen(function* () {
          const addressArray = Array.from(addresses);
          yield* Effect.tryPromise({
            try: () =>
              dbClient
                .insert(config)
                .values({
                  key: 'surge_component_addresses',
                  value: addressArray, // Store array of all historical addresses as JSONB
                })
                .onConflictDoUpdate({
                  target: [config.key],
                  set: { value: addressArray },
                }),
            catch: (error) => new DbError(error),
          });

          yield* Effect.logInfo(
            `Saved surge component addresses to database: ${JSON.stringify(addressArray)}`,
          );
        }).pipe(
          Effect.catchAll((error) =>
            Effect.logError(
              `Failed to save surge component addresses to database: ${error}`,
            ),
          ),
        );

      const initializeService = Effect.gen(function* () {
        const dbAddresses = yield* loadFromDatabase;
        if (dbAddresses && dbAddresses.size > 0) {
          cachedAddresses = dbAddresses;
          allSurgeComponentAddresses = new Set(dbAddresses);
          yield* Effect.logInfo(
            `Loaded surge component addresses from database: ${JSON.stringify(Array.from(dbAddresses))}`,
          );
        } else {
          cachedAddresses = new Set([HARDCODED_SURGE_COMPONENT]);
          allSurgeComponentAddresses = new Set([HARDCODED_SURGE_COMPONENT]);
          yield* Effect.logInfo(
            `Using default surge component address from constants: ${HARDCODED_SURGE_COMPONENT}`,
          );
        }
      });

      return {
        initialize: () => initializeService,
        // Get all historical component addresses
        getAllComponentAddresses: () =>
          Effect.sync(
            () => cachedAddresses || new Set([HARDCODED_SURGE_COMPONENT]),
          ),

        // Add a new component address to the historical list
        addComponentAddress: (newAddress: string) =>
          Effect.gen(function* () {
            const currentAddresses =
              cachedAddresses || new Set([HARDCODED_SURGE_COMPONENT]);

            if (currentAddresses.has(newAddress)) {
              yield* Effect.logDebug(
                `Surge component address already known: ${newAddress}`,
              );
              return;
            }

            // Add new address to the set
            const newAddresses = new Set([...currentAddresses, newAddress]);
            cachedAddresses = newAddresses;
            allSurgeComponentAddresses = new Set(newAddresses);

            yield* Effect.logInfo(
              `Added new surge component address: ${newAddress}. All known addresses: ${JSON.stringify(Array.from(newAddresses))}`,
            );

            yield* saveToDatabase(newAddresses);
          }),

        // For compatibility with existing code that calls updateComponentAddress
        updateComponentAddress: (newAddress: string) =>
          Effect.gen(function* () {
            yield* Effect.logInfo(
              `updateComponentAddress is deprecated, use addComponentAddress. Adding: ${newAddress}`,
            );
            const currentAddresses =
              cachedAddresses || new Set([HARDCODED_SURGE_COMPONENT]);

            if (!currentAddresses.has(newAddress)) {
              const newAddresses = new Set([...currentAddresses, newAddress]);
              cachedAddresses = newAddresses;
              allSurgeComponentAddresses = new Set(newAddresses);
              yield* saveToDatabase(newAddresses);
            }
          }),

        isSurgeComponent: (address: string) =>
          Effect.gen(function* () {
            const addresses =
              cachedAddresses || new Set([HARDCODED_SURGE_COMPONENT]);
            return addresses.has(address);
          }),
      };
    }),
  },
) {}

export const SurgeComponentAddressServiceLive =
  SurgeComponentAddressService.Default;
