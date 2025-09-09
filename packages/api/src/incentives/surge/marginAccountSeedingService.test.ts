import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { it } from '@effect/vitest';
import { schema } from 'db/incentives';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Effect, Layer } from 'effect';
import postgres from 'postgres';
import { beforeEach, describe, expect, inject } from 'vitest';
import { GatewayApiClientLive } from '../../common/gateway/gatewayApiClient';
import { GetEntitiesByRoleRequirementService } from '../../common/gateway/getEntitiesByRoleRequirement';
import { GetEntityRoleAssignmentsService } from '../../common/gateway/getEntityRoleAssignments';
import { truncateAllTables } from '../../integration-tests/utils';
import { ConfigService } from '../config/configService';
import { createDbClientLive } from '../db/dbClient';
import { MarginAccountDbService } from './marginAccountDbService';
import { MarginAccountSeedingService } from './marginAccountSeedingService';
import { parseCsvMarginAccounts } from './parseCsvMarginAccounts';
import { UpdateMarginAccountOwnerService } from './updateMarginAccountOwner';

// Load real margin account data from CSV
const loadMarginAccountsFromCsv = () => {
  const csvPath = join(__dirname, 'fixtures', 'all_margin_accounts.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  return parseCsvMarginAccounts({ csvData: csvContent });
};

describe('MarginAccountSeedingService - Integration Tests', () => {
  const dbUrl = inject('testDbUrl');
  const client = postgres(dbUrl);
  const db = drizzle(client, { schema });
  const dbClientLive = createDbClientLive(db);

  // Create Gateway service layers
  const gatewayApiClientLive = GatewayApiClientLive;

  const getEntityRoleAssignmentsLive =
    GetEntityRoleAssignmentsService.Default.pipe(
      Layer.provide(gatewayApiClientLive),
    );

  const getEntitiesByRoleRequirementLive =
    GetEntitiesByRoleRequirementService.Default.pipe(
      Layer.provide(gatewayApiClientLive),
    );

  const updateMarginAccountOwnerLive =
    UpdateMarginAccountOwnerService.Default.pipe(
      Layer.provide(getEntityRoleAssignmentsLive),
      Layer.provide(getEntitiesByRoleRequirementLive),
      Layer.provide(gatewayApiClientLive),
    );

  const marginAccountDbLive = MarginAccountDbService.Default.pipe(
    Layer.provide(dbClientLive),
  );

  // Mock ConfigService to provide a default state version for testing
  const mockConfigService = {
    getStateVersion: () => Effect.succeed(325701783), // Use a reasonable state version for testing
  };

  // @ts-ignore - Mock only implements getStateVersion method needed for seeding tests
  const configServiceLive = Layer.succeed(ConfigService, mockConfigService);

  const marginAccountSeedingLive = MarginAccountSeedingService.Default.pipe(
    Layer.provide(marginAccountDbLive),
    Layer.provide(updateMarginAccountOwnerLive),
    Layer.provide(configServiceLive),
  );

  // Combined live layer for tests that need direct access to services
  const testServicesLive = Layer.mergeAll(
    marginAccountSeedingLive,
    marginAccountDbLive,
    configServiceLive,
    updateMarginAccountOwnerLive,
  );

  beforeEach(async () => {
    await truncateAllTables(db, dbUrl);
  });

  describe('CSV Data Loading', () => {
    it('should successfully load and parse real margin account CSV data', async () => {
      const parseResult = await Effect.runPromise(loadMarginAccountsFromCsv());

      expect(parseResult.marginAccountAddresses.length).toBeGreaterThan(800);
      expect(parseResult.count).toBeGreaterThan(800);

      // Validate first few addresses format
      for (
        let i = 0;
        i < Math.min(10, parseResult.marginAccountAddresses.length);
        i++
      ) {
        expect(parseResult.marginAccountAddresses[i]).toMatch(
          /^component_rdx1[a-z0-9]+$/,
        );
      }
    });
  });

  describe('Real Integration Test with Small Batch', () => {
    it.effect(
      'should successfully seed a small batch of real margin accounts from CSV',
      () =>
        Effect.gen(function* () {
          // Load real CSV data but only use first 5 accounts for testing
          const parseResult = yield* loadMarginAccountsFromCsv();
          const testAddresses = parseResult.marginAccountAddresses.slice(0, 5);

          console.log(
            `Testing with ${testAddresses.length} real margin accounts`,
          );
          console.log(
            `Sample addresses: ${testAddresses.slice(0, 2).join(', ')}`,
          );

          const marginAccountService = yield* MarginAccountSeedingService;

          const result = yield* marginAccountService.seedMarginAccounts({
            marginAccountAddresses: testAddresses,
            batchSize: 3, // Test with batch size of 3
          });

          // Validate results
          expect(result.processed).toBe(testAddresses.length);
          expect(result.errors.length).toBe(0);
          expect(result.inserted + result.updated + result.skipped).toBe(
            testAddresses.length,
          );

          console.log(
            `Results: Processed: ${result.processed}, Inserted: ${result.inserted}, Updated: ${result.updated}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`,
          );

          // Verify data was actually written to database
          const marginAccountDb = yield* MarginAccountDbService;
          const dbRecords =
            yield* marginAccountDb.getMarginAccountsByAddresses(testAddresses);

          expect(dbRecords.length).toBeGreaterThan(0);
          console.log(`Database records created: ${dbRecords.length}`);

          // Validate database record structure
          for (const record of dbRecords.slice(0, 2)) {
            expect(record.marginAccountAddress).toMatch(
              /^component_rdx1[a-z0-9]+$/,
            );
            expect(record.stateVersion).toBeGreaterThan(0);
            // At least one of these should be set (recovery account is required)
            expect(
              record.recoveryAccountAddress ||
                record.collateralAccountAddress ||
                record.tradingAccountAddress,
            ).toBeTruthy();
          }
        }).pipe(Effect.provide(testServicesLive)),
    );
  });

  describe('Batching Performance Validation', () => {
    it.effect(
      'should demonstrate batching efficiency with medium batch size',
      () =>
        Effect.gen(function* () {
          // Load real CSV data but use first 10 accounts for testing
          const parseResult = yield* loadMarginAccountsFromCsv();
          const testAddresses = parseResult.marginAccountAddresses.slice(0, 10);

          console.log(
            `Testing batching with ${testAddresses.length} margin accounts`,
          );

          const marginAccountService = yield* MarginAccountSeedingService;

          const startTime = Date.now();
          const result = yield* marginAccountService.seedMarginAccounts({
            marginAccountAddresses: testAddresses,
            batchSize: 4, // Test with batch size of 4 (should create 3 batches: 4+4+2)
          });
          const duration = Date.now() - startTime;

          console.log(`Batch processing completed in ${duration}ms`);
          console.log(
            `Results: Processed: ${result.processed}, Inserted: ${result.inserted}, Updated: ${result.updated}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`,
          );

          // Validate results
          expect(result.processed).toBe(testAddresses.length);
          expect(result.errors.length).toBe(0);

          // Verify all data was written to database
          const marginAccountDb = yield* MarginAccountDbService;
          const dbRecords =
            yield* marginAccountDb.getMarginAccountsByAddresses(testAddresses);

          expect(dbRecords.length).toBeGreaterThan(0);
          console.log(`Database records verified: ${dbRecords.length}`);

          // Performance expectation: should complete within reasonable time
          expect(duration).toBeLessThan(45000); // Should complete within 45 seconds for 10 accounts
        }).pipe(Effect.provide(testServicesLive)),
    );
  });
});
