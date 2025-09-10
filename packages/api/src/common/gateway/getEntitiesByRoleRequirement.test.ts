import { it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { GatewayApiClientLive } from './gatewayApiClient';
import { GetEntitiesByRoleRequirementService } from './getEntitiesByRoleRequirement';

const gatewayApiClientLive = GatewayApiClientLive;

const getEntitiesByRoleRequirementServiceLive =
  GetEntitiesByRoleRequirementService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

const TEST_REQUIREMENTS = [
  {
    resource_address:
      'resource_rdx1nfxxxxxxxxxxed25sgxxxxxxxxx002236757237xxxxxxxxxed25sg',
    non_fungible_id:
      '[9958442eb79f82094f7cb973f693b60e6ce9872a68463c82ec7b475495]',
  },
];

describe('GetEntitiesByRoleRequirementService', () => {
  it.effect(
    'should get entities by role requirement lookup',
    Effect.fn(function* () {
      const getEntitiesByRoleRequirement = yield* Effect.provide(
        GetEntitiesByRoleRequirementService,
        getEntitiesByRoleRequirementServiceLive,
      );

      const result = yield* getEntitiesByRoleRequirement({
        requirements: TEST_REQUIREMENTS,
        at_ledger_state: {
          state_version: 325996297,
        },
      });

      expect(result).toBeDefined();
      // Add more specific assertions based on the expected response structure
      console.log('Response:', JSON.stringify(result, null, 2));
    }),
  );
});
