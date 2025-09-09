import { Effect } from 'effect';
import { chunker } from '../../common';
import { ConfigService } from '../config/configService';
import { MarginAccountDbService } from './marginAccountDbService';
import { UpdateMarginAccountOwnerService } from './updateMarginAccountOwner';

export class MarginAccountSeedingError {
  readonly _tag = 'MarginAccountSeedingError';
  constructor(readonly message: string) {}
}

export type SeedMarginAccountsInput = {
  marginAccountAddresses: string[];
  batchSize?: number;
};

export type SeedMarginAccountsOutput = {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ address: string; error: string }>;
};

export class MarginAccountSeedingService extends Effect.Service<MarginAccountSeedingService>()(
  'MarginAccountSeedingService',
  {
    effect: Effect.gen(function* () {
      const marginAccountDb = yield* MarginAccountDbService;
      const updateMarginAccountOwner = yield* UpdateMarginAccountOwnerService;
      const configService = yield* ConfigService;

      const seedMarginAccounts = Effect.fn(function* (
        input: SeedMarginAccountsInput,
      ) {
        // Get current state version
        const currentStateVersion = yield* configService.getStateVersion();
        if (!currentStateVersion) {
          return yield* Effect.fail(
            new MarginAccountSeedingError(
              'Could not get current state version',
            ),
          );
        }

        const atLedgerState = { state_version: currentStateVersion };
        const batchSize = input.batchSize || 20; // Default batch size of 20

        let processed = 0;
        let inserted = 0;
        let updated = 0;
        let skipped = 0;
        const errors: Array<{ address: string; error: string }> = [];

        yield* Effect.logInfo(
          `Starting to seed ${input.marginAccountAddresses.length} margin accounts in batches of ${batchSize} at state version ${currentStateVersion}`,
        );

        // Process addresses in batches
        const batches = chunker(input.marginAccountAddresses, batchSize);
        const totalBatches = batches.length;

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          if (!batch) continue;
          const batchNum = i + 1;

          yield* Effect.logInfo(
            `Processing batch ${batchNum}/${totalBatches} (${batch.length} accounts)`,
          );

          yield* Effect.gen(function* () {
            // Step 1: Get existing database records for this batch
            const existingRecords =
              yield* marginAccountDb.getMarginAccountsByAddresses(batch);

            // Create a map of latest records per margin account
            const existingRecordsMap = new Map<
              string,
              (typeof existingRecords)[0]
            >();
            for (const record of existingRecords) {
              const existing = existingRecordsMap.get(
                record.marginAccountAddress,
              );
              if (!existing || record.stateVersion > existing.stateVersion) {
                existingRecordsMap.set(record.marginAccountAddress, record);
              }
            }

            // Step 2: Batch API call to get ownership data from blockchain
            const ownershipResults = yield* updateMarginAccountOwner(
              batch,
              atLedgerState,
            );

            yield* Effect.logInfo(
              `Batch ${batchNum}: Gateway API returned ${ownershipResults.length} results for ${batch.length} accounts`,
            );

            // Check for missing accounts from Gateway API response
            if (ownershipResults.length !== batch.length) {
              const returnedAddresses = new Set(
                ownershipResults.map((r) => r.marginAccountAddress),
              );
              const missingAccounts = batch.filter(
                (addr) => !returnedAddresses.has(addr),
              );
              yield* Effect.logWarning(
                `Batch ${batchNum}: Missing ${missingAccounts.length} accounts from Gateway API response: ${missingAccounts.join(', ')}`,
              );
            }

            // Step 3: Determine what needs to be inserted/updated/skipped
            const toInsert: Array<{
              marginAccountAddress: string;
              recoveryAccountAddress: string | null;
              collateralAccountAddress: string | null;
              tradingAccountAddress: string | null;
              stateVersion: number;
              isUpdate: boolean;
            }> = [];

            let batchSkipped = 0;

            for (const ownership of ownershipResults) {
              const existing = existingRecordsMap.get(
                ownership.marginAccountAddress,
              );
              let isUpdate = false;

              if (existing) {
                // Compare ownership data (ignore state version differences)
                const dataMatches =
                  existing.recoveryAccountAddress ===
                    ownership.recoveryAccountAddress &&
                  existing.collateralAccountAddress ===
                    ownership.collateralAccountAddress &&
                  existing.tradingAccountAddress ===
                    ownership.tradingAccountAddress;

                if (dataMatches) {
                  yield* Effect.logDebug(
                    `Batch ${batchNum}: Skipping ${ownership.marginAccountAddress} - data matches existing entry`,
                  );
                  skipped++;
                  batchSkipped++;
                  continue;
                }

                isUpdate = true;
              }

              toInsert.push({
                marginAccountAddress: ownership.marginAccountAddress,
                recoveryAccountAddress: ownership.recoveryAccountAddress,
                collateralAccountAddress: ownership.collateralAccountAddress,
                tradingAccountAddress: ownership.tradingAccountAddress,
                stateVersion: currentStateVersion,
                isUpdate,
              });
            }

            yield* Effect.logInfo(
              `Batch ${batchNum}: Processing summary - API returned: ${ownershipResults.length}, Skipped (duplicates): ${batchSkipped}, To insert/update: ${toInsert.length}`,
            );

            // Step 4: Bulk database operation
            if (toInsert.length > 0) {
              yield* marginAccountDb.upsertMarginAccountOwnership(
                toInsert.map((item) => ({
                  marginAccountAddress: item.marginAccountAddress,
                  recoveryAccountAddress: item.recoveryAccountAddress,
                  collateralAccountAddress: item.collateralAccountAddress,
                  tradingAccountAddress: item.tradingAccountAddress,
                  stateVersion: item.stateVersion,
                })),
              );

              // Count insertions vs updates
              for (const item of toInsert) {
                if (item.isUpdate) {
                  updated++;
                  yield* Effect.logDebug(
                    `Updated margin account: ${item.marginAccountAddress}`,
                  );
                } else {
                  inserted++;
                  yield* Effect.logDebug(
                    `Inserted margin account: ${item.marginAccountAddress}`,
                  );
                }
              }
            }

            processed += batch.length;

            yield* Effect.logInfo(
              `Batch ${batchNum}/${totalBatches} completed. Processed: ${batch.length}, To insert/update: ${toInsert.length}, Accounts: ${batch[0]} to ${batch[batch.length - 1]}`,
            );
          }).pipe(
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                const errorMessage =
                  error instanceof Error ? error.message : String(error);
                yield* Effect.logError(
                  `Error processing batch ${batchNum}/${totalBatches}: ${errorMessage}`,
                );

                // Add all batch addresses to errors
                for (const address of batch) {
                  errors.push({
                    address,
                    error: errorMessage,
                  });
                }
              }),
            ),
          );
        }

        const expectedBatches = Math.ceil(
          input.marginAccountAddresses.length / batchSize,
        );
        const actualBatches = Math.ceil(processed / batchSize);

        yield* Effect.logInfo(
          `Margin account seeding completed. Processed: ${processed}/${input.marginAccountAddresses.length}, Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors.length}, Batches: ${actualBatches}/${expectedBatches}`,
        );

        return {
          processed,
          inserted,
          updated,
          skipped,
          errors,
        };
      });

      return {
        seedMarginAccounts,
      };
    }),
  },
) {}

export const MarginAccountSeedingServiceLive =
  MarginAccountSeedingService.Default;
