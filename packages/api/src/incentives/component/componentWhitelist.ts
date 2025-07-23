import { Effect, Ref } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { componentWhitelist } from "db/incentives";
import { AppConfigService } from "../config/appConfig";

export class ComponentWhitelistService extends Effect.Service<ComponentWhitelistService>()(
  "ComponentWhitelistService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const appConfig = yield* AppConfigService;

      const whitelistRef = yield* Ref.make(new Set<string>());

      const loadWhitelist = () =>
        Effect.gen(function* () {
          if (!appConfig.useComponentWhitelist) {
            return;
          }

          const whitelist = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  componentAddress: componentWhitelist.componentAddress,
                })
                .from(componentWhitelist),
            catch: (error) => new DbError(error),
          });

          const whitelistSet = new Set(
            whitelist.map((item) => item.componentAddress)
          );

          yield* Ref.set(whitelistRef, whitelistSet);
          yield* Effect.log(
            `Loaded ${whitelistSet.size} components into whitelist`
          );
        });

      // Load whitelist on initialization
      yield* loadWhitelist();

      return {
        getCount: () =>
          Effect.gen(function* () {
            const result = yield* Effect.tryPromise({
              try: () =>
                db
                  .select({ count: componentWhitelist.componentAddress })
                  .from(componentWhitelist),
              catch: (error) => new DbError(error),
            });
            return result.length;
          }),

        uploadCsv: (componentAddresses: string[]) =>
          Effect.gen(function* () {
            yield* Effect.tryPromise({
              try: () =>
                db.transaction(async (tx) => {
                  // Clear existing whitelist
                  await tx.delete(componentWhitelist);

                  // Insert new whitelist entries
                  const batchSize = 1000;
                  for (
                    let i = 0;
                    i < componentAddresses.length;
                    i += batchSize
                  ) {
                    const batch = componentAddresses.slice(i, i + batchSize);
                    await tx
                      .insert(componentWhitelist)
                      .values(
                        batch.map((address) => ({ componentAddress: address }))
                      );
                  }
                }),
              catch: (error) => new DbError(error),
            });

            // Reload cache after updating
            yield* loadWhitelist();
          }),

        isWhitelisted: (componentAddress: string) =>
          Effect.gen(function* () {
            if (!appConfig.useComponentWhitelist) {
              return true; // If whitelist is disabled, all components are valid
            }

            const whitelist = yield* Ref.get(whitelistRef);
            return whitelist.has(componentAddress);
          }),

        filterComponents: (components: string[]) =>
          Effect.gen(function* () {
            if (!appConfig.useComponentWhitelist) {
              return components; // Return all components if whitelist is disabled
            }

            const whitelist = yield* Ref.get(whitelistRef);
            return components.filter((component) => whitelist.has(component));
          }),

        reloadWhitelist: () => loadWhitelist(),
      };
    }),
  }
) {}
