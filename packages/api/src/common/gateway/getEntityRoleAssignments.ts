import { Effect } from 'effect';
import { GatewayApiClientService } from '../gateway/gatewayApiClient';
import type { AtLedgerState } from './schemas';

export type GetEntityRoleAssignmentsInput = {
  entity_addresses: string[];
};

export type RoleAssignment = {
  owner?: Record<string, unknown>;
  entries: Array<{
    role_key: {
      module: string;
      name: string;
    };
    assignment: {
      explicit_rule?: {
        type: string;
        access_rule: Record<string, unknown>;
        resolution: string;
      };
    };
    updater_roles?: unknown[];
  }>;
};

export type GetEntityRoleAssignmentsOutput = {
  ledger_state: {
    network: string;
    state_version: number;
    proposer_round_timestamp: string;
    epoch: number;
    round: number;
  };
  items: Array<{
    address: string;
    role_assignments: RoleAssignment;
  }>;
};

export class GetEntityRoleAssignmentsService extends Effect.Service<GetEntityRoleAssignmentsService>()(
  'GetEntityRoleAssignmentsService',
  {
    dependencies: [GatewayApiClientService.Default],
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;

      return Effect.fn(function* (
        input: GetEntityRoleAssignmentsInput,
        at_ledger_state: AtLedgerState,
      ) {
        const entityDetailsResponse =
          yield* gatewayClient.state.innerClient.stateEntityDetails({
            stateEntityDetailsRequest: {
              addresses: input.entity_addresses,
              opt_ins: {
                ancestor_identities: false,
                non_fungible_include_nfids: false,
                package_royalty_vault_balance: false,
                component_royalty_vault_balance: false,
                dapp_two_way_links: false,
              },
              at_ledger_state,
            },
          });

        // Extract only role_assignments from the response
        const result: GetEntityRoleAssignmentsOutput = {
          ledger_state: entityDetailsResponse.ledger_state,
          items: entityDetailsResponse.items.map((item) => ({
            address: item.address,
            role_assignments: item.details
              ? (item.details as { role_assignments?: RoleAssignment })
                  ?.role_assignments || {
                  entries: [],
                }
              : { entries: [] },
          })),
        };

        return result;
      });
    }),
  },
) {}

export const GetEntityRoleAssignmentsServiceLive =
  GetEntityRoleAssignmentsService.Default;
