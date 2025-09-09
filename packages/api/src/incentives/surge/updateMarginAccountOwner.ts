import { Assets } from 'data';
import { Effect } from 'effect';
import { GetEntitiesByRoleRequirementService } from '../../common/gateway/getEntitiesByRoleRequirement';
import { GetEntityRoleAssignmentsService } from '../../common/gateway/getEntityRoleAssignments';
import type { AtLedgerState } from '../../common/gateway/schemas';

// Account badge resource addresses for Radix accounts (both signature types)
const ACCOUNT_BADGE_RESOURCES = [
  Assets.Signature.ED25519, // EdDSA Ed25519 signature resource
  Assets.Signature.SECP256K1, // ECDSA Secp256k1 signature resource
] as const;

export type MarginAccountOwnership = {
  marginAccountAddress: string;
  recoveryAccountAddress: string | null;
  collateralAccountAddress: string | null;
  tradingAccountAddress: string | null;
  stateVersion: number;
};

export class MarginAccountOwnershipError extends Error {
  readonly _tag = 'MarginAccountOwnershipError';
  constructor(
    readonly reason: string,
    readonly marginAccount: string,
  ) {
    super(
      `Failed to determine owner of margin account ${marginAccount}: ${reason}`,
    );
  }
}

export class UpdateMarginAccountOwnerService extends Effect.Service<UpdateMarginAccountOwnerService>()(
  'UpdateMarginAccountOwnerService',
  {
    dependencies: [
      GetEntityRoleAssignmentsService.Default,
      GetEntitiesByRoleRequirementService.Default,
    ],
    effect: Effect.gen(function* () {
      const getRoleAssignments = yield* GetEntityRoleAssignmentsService;
      const getEntitiesByRole = yield* GetEntitiesByRoleRequirementService;

      // Batched processing for multiple margin accounts
      const processBatchMarginAccounts = Effect.fn(function* (
        marginAccountAddresses: string[],
        at_ledger_state: AtLedgerState,
      ) {
        if (marginAccountAddresses.length === 0) {
          return [];
        }

        yield* Effect.logDebug(
          `Processing ${marginAccountAddresses.length} margin accounts for role assignments`,
        );

        // Single API call to get role assignments for all margin accounts
        const roleAssignmentsResponse = yield* getRoleAssignments(
          { entity_addresses: marginAccountAddresses },
          at_ledger_state,
        );

        yield* Effect.logDebug(
          `GetEntityRoleAssignments returned ${roleAssignmentsResponse.items.length} items for ${marginAccountAddresses.length} accounts`,
        );

        // Check which accounts are missing from role assignments response
        if (
          roleAssignmentsResponse.items.length !== marginAccountAddresses.length
        ) {
          const returnedAddresses = new Set(
            roleAssignmentsResponse.items.map((item) => item.address),
          );
          const missingFromRoleAssignments = marginAccountAddresses.filter(
            (addr) => !returnedAddresses.has(addr),
          );
          yield* Effect.logWarning(
            `Missing role assignments for ${missingFromRoleAssignments.length} accounts: ${missingFromRoleAssignments.join(', ')}`,
          );
        }

        // Collect all unique badge requirements across all accounts
        const allRequirements: Array<{
          resourceAddress: string;
          badgeId: string;
          marginAccountAddress: string;
          levelName: string;
        }> = [];

        const accountRoleMap = new Map<
          string,
          (typeof roleAssignmentsResponse.items)[0]
        >();

        // Build map of account address to role assignments
        for (const item of roleAssignmentsResponse.items) {
          accountRoleMap.set(item.address, item);
        }

        // Process each account and extract badge requirements
        for (const marginAccountAddress of marginAccountAddresses) {
          const roleAssignments =
            accountRoleMap.get(marginAccountAddress)?.role_assignments;

          if (!roleAssignments) {
            yield* Effect.logDebug(
              `No role assignments found for ${marginAccountAddress}`,
            );
            continue;
          }

          let accountHasAnyRequirements = false;

          // Extract requirements for all levels
          for (const levelName of ['level_1', 'level_2', 'level_3']) {
            const role = roleAssignments.entries.find(
              (entry) =>
                entry.role_key.module === 'Main' &&
                entry.role_key.name === levelName,
            );

            if (!role) {
              yield* Effect.logDebug(
                `No ${levelName} role found for ${marginAccountAddress}`,
              );
              continue;
            }

            if (role.assignment.explicit_rule?.type !== 'Protected') {
              yield* Effect.logDebug(
                `${levelName} role for ${marginAccountAddress} is not Protected type: ${role.assignment.explicit_rule?.type}`,
              );
              continue;
            }

            const accountBadgeInfo = yield* extractAccountBadgeId(
              role.assignment.explicit_rule.access_rule,
            );

            if (accountBadgeInfo) {
              allRequirements.push({
                resourceAddress: accountBadgeInfo.resourceAddress,
                badgeId: accountBadgeInfo.badgeId,
                marginAccountAddress,
                levelName,
              });
              accountHasAnyRequirements = true;
            } else {
              yield* Effect.logDebug(
                `Could not extract account badge from ${levelName} role for ${marginAccountAddress}`,
              );
            }
          }

          if (!accountHasAnyRequirements) {
            yield* Effect.logWarning(
              `Account ${marginAccountAddress} has no extractable badge requirements from any role level`,
            );
          }
        }

        // Single API call to get all entities by role requirements
        const entitiesMap = new Map<string, string>(); // key: resourceAddress:badgeId, value: account address

        yield* Effect.logDebug(
          `Extracted ${allRequirements.length} badge requirements from ${marginAccountAddresses.length} accounts`,
        );

        if (allRequirements.length > 0) {
          const uniqueRequirements = Array.from(
            new Set(
              allRequirements.map((r) => `${r.resourceAddress}:${r.badgeId}`),
            ),
          ).map((key) => {
            const [resourceAddress, badgeId] = key.split(':');
            return {
              resource_address: resourceAddress!,
              non_fungible_id: badgeId!,
            };
          });

          yield* Effect.logDebug(
            `Making GetEntitiesByRoleRequirement call with ${uniqueRequirements.length} unique requirements`,
          );

          const entitiesResponse = yield* getEntitiesByRole({
            requirements: uniqueRequirements,
            at_ledger_state,
          });

          yield* Effect.logDebug(
            `GetEntitiesByRoleRequirement returned ${entitiesResponse.items.length} items for ${uniqueRequirements.length} requirements`,
          );

          // Build map of requirements to account addresses
          for (let i = 0; i < entitiesResponse.items.length; i++) {
            const item = entitiesResponse.items[i]!;
            const requirement = uniqueRequirements[i]!;
            const key = `${requirement.resource_address}:${requirement.non_fungible_id}`;

            if (item.entities.length > 0) {
              const accountEntity = item.entities
                .filter((entity) =>
                  entity.entity_address.startsWith('account_'),
                )
                .sort(
                  (a, b) =>
                    a.first_seen_state_version - b.first_seen_state_version,
                )[0];

              if (accountEntity) {
                entitiesMap.set(key, accountEntity.entity_address);
              }
            }
          }
        }

        // Build results for each margin account
        const results: MarginAccountOwnership[] = [];

        for (const marginAccountAddress of marginAccountAddresses) {
          const accountRoleData = accountRoleMap.get(marginAccountAddress);

          if (!accountRoleData) {
            // Account not returned by Gateway API at all - skip it
            yield* Effect.logDebug(
              `Account ${marginAccountAddress} not returned by Gateway API - skipping`,
            );
            continue;
          }

          const roleAssignments = accountRoleData.role_assignments;

          if (!roleAssignments || roleAssignments.entries.length === 0) {
            yield* Effect.logDebug(
              `Account ${marginAccountAddress} has no role assignments - inserting with null addresses`,
            );
            // Still insert the account with null addresses if it exists on Gateway but has no roles
            results.push({
              marginAccountAddress,
              recoveryAccountAddress: null,
              collateralAccountAddress: null,
              tradingAccountAddress: null,
              stateVersion: roleAssignmentsResponse.ledger_state.state_version,
            });
            continue;
          }

          // Extract account addresses for all levels using the batch results
          const getAccountForLevel = (levelName: string): string | null => {
            const requirement = allRequirements.find(
              (r) =>
                r.marginAccountAddress === marginAccountAddress &&
                r.levelName === levelName,
            );

            if (!requirement) {
              return null;
            }

            const key = `${requirement.resourceAddress}:${requirement.badgeId}`;
            const result = entitiesMap.get(key) || null;

            return result;
          };

          const recoveryAccountAddress = getAccountForLevel('level_1');
          const collateralAccountAddress = getAccountForLevel('level_2');
          const tradingAccountAddress = getAccountForLevel('level_3');

          // Always insert the account, even if all addresses are null
          results.push({
            marginAccountAddress,
            recoveryAccountAddress,
            collateralAccountAddress,
            tradingAccountAddress,
            stateVersion: roleAssignmentsResponse.ledger_state.state_version,
          });

          if (
            !recoveryAccountAddress &&
            !collateralAccountAddress &&
            !tradingAccountAddress
          ) {
            yield* Effect.logWarning(
              `Account ${marginAccountAddress} has no valid account addresses for any role level - inserted with null addresses`,
            );
          }
        }

        yield* Effect.logDebug(
          `Returning ${results.length} results out of ${marginAccountAddresses.length} requested accounts`,
        );

        return results;
      });

      return processBatchMarginAccounts;
    }),
  },
) {}

// Helper function to recursively extract account badge ID and resource address from access rules
function extractAccountBadgeId(
  accessRule: Record<string, unknown>,
): Effect.Effect<{ badgeId: string; resourceAddress: string } | null, never> {
  return Effect.gen(function* () {
    function findAccountBadgeInRule(
      rule: unknown,
    ): { badgeId: string; resourceAddress: string } | null {
      if (!rule || typeof rule !== 'object') return null;

      const ruleObj = rule as Record<string, unknown>;

      // Check if this is a ProofRule with NonFungible requirement
      if (ruleObj.type === 'ProofRule' && ruleObj.proof_rule) {
        const proofRule = ruleObj.proof_rule as Record<string, unknown>;
        if (proofRule.type === 'Require' && proofRule.requirement) {
          const requirement = proofRule.requirement as Record<string, unknown>;
          if (requirement.type === 'NonFungible' && requirement.non_fungible) {
            const nonFungible = requirement.non_fungible as Record<
              string,
              unknown
            >;
            const resourceAddress = nonFungible.resource_address as string;
            if (
              ACCOUNT_BADGE_RESOURCES.includes(
                resourceAddress as (typeof ACCOUNT_BADGE_RESOURCES)[number],
              ) &&
              nonFungible.local_id
            ) {
              const localId = nonFungible.local_id as Record<string, unknown>;
              const badgeId = localId.simple_rep as string;
              if (badgeId) {
                return {
                  badgeId,
                  resourceAddress,
                };
              }
            }
          }
        }
      }

      // Recursively search in AnyOf and AllOf rules
      if (ruleObj.type === 'AnyOf' && Array.isArray(ruleObj.access_rules)) {
        for (const subRule of ruleObj.access_rules) {
          const result = findAccountBadgeInRule(subRule);
          if (result) return result;
        }
      }

      if (ruleObj.type === 'AllOf' && Array.isArray(ruleObj.access_rules)) {
        // For AllOf, we still search but don't prioritize these results
        for (const subRule of ruleObj.access_rules) {
          const result = findAccountBadgeInRule(subRule);
          if (result) return result;
        }
      }

      // Search in any other nested objects
      for (const value of Object.values(ruleObj)) {
        if (typeof value === 'object') {
          const result = findAccountBadgeInRule(value);
          if (result) return result;
        }
      }

      return null;
    }

    return findAccountBadgeInRule(accessRule);
  });
}

export const UpdateMarginAccountOwnerServiceLive =
  UpdateMarginAccountOwnerService.Default;
