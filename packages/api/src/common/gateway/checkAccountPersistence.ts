import { Context, Effect, Layer } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";

export class CheckAccountPersistenceError {
  readonly _tag = "CheckAccountPersistenceError";
  constructor(readonly error: unknown) {}
}

export class VirtualAccountError {
  readonly _tag = "VirtualAccountError";
  constructor(readonly address: string) {}
}

type AccountPersistenceResult = {
  address: string;
  isPersisted: boolean;
  stateVersion?: number;
};

export class CheckAccountPersistenceService extends Context.Tag(
  "CheckAccountPersistenceService"
)<
  CheckAccountPersistenceService,
  (
    addresses: string[]
  ) => Effect.Effect<AccountPersistenceResult[], CheckAccountPersistenceError>
>() {}

export const CheckAccountPersistenceServiceLive = Layer.effect(
  CheckAccountPersistenceService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (addresses: string[]) => {
      return Effect.gen(function* () {
        return yield* Effect.forEach(
          addresses,
          (address) => {
            return Effect.gen(function* () {
              yield* Effect.logInfo(
                `Checking persistence for account: ${address}`
              );

              const response = yield* Effect.tryPromise({
                try: () =>
                  gatewayClient.gatewayApiClient.state.innerClient.stateEntityDetails(
                    {
                      stateEntityDetailsRequest: {
                        addresses: [address],
                        aggregation_level: "Vault",
                        opt_ins: {
                          ancestor_identities: false,
                          component_royalty_vault_balance: false,
                          package_royalty_vault_balance: false,
                          non_fungible_include_nfids: false,
                          explicit_metadata: ["owner_keys", "owner_badge"],
                        },
                      },
                    }
                  ),
                catch: (error) => {
                  Effect.logError(
                    `Gateway API call failed for ${address}:`,
                    error
                  );
                  return new CheckAccountPersistenceError(error);
                },
              });

              // Check if account exists and has metadata
              const accountData = response.items?.[0];
              if (!accountData) {
                return { address, isPersisted: false };
              }

              // Check metadata for persistence indicators
              const metadata = accountData.metadata?.items;
              if (!metadata) {
                return { address, isPersisted: false };
              }

              // Look for owner_keys or owner_badge metadata with state_version > 0
              const ownerKeysMetadata = metadata.find(
                (item) => item.key === "owner_keys"
              );
              const ownerBadgeMetadata = metadata.find(
                (item) => item.key === "owner_badge"
              );

              const ownerKeysStateVersion =
                ownerKeysMetadata?.last_updated_at_state_version || 0;
              const ownerBadgeStateVersion =
                ownerBadgeMetadata?.last_updated_at_state_version || 0;

              // Account is persisted if either owner_keys or owner_badge has state_version > 0
              const isPersisted =
                ownerKeysStateVersion > 0 || ownerBadgeStateVersion > 0;
              const stateVersion = Math.max(
                ownerKeysStateVersion,
                ownerBadgeStateVersion
              );

              return {
                address,
                isPersisted,
                stateVersion: isPersisted ? stateVersion : undefined,
              };
            });
          },
          { concurrency: 10 }
        );
      });
    };
  })
);

// Helper function to check if any accounts are virtual
export const checkForVirtualAccounts = (
  addresses: string[]
): Effect.Effect<
  void,
  VirtualAccountError | CheckAccountPersistenceError,
  CheckAccountPersistenceService
> =>
  Effect.gen(function* () {
    const checkAccountPersistence = yield* CheckAccountPersistenceService;
    const results = yield* checkAccountPersistence(addresses);

    const virtualAccounts = results.filter((result) => !result.isPersisted);

    if (virtualAccounts.length > 0) {
      // Return the first virtual account found
      const firstVirtualAccount = virtualAccounts[0];
      if (firstVirtualAccount) {
        yield* Effect.fail(
          new VirtualAccountError(firstVirtualAccount.address)
        );
      }
    }
  });
