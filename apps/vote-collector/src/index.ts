import { Exit } from "effect";
import { createDependencyLayer } from "api/consultation";
import { db } from "db/consultation";

const { calculateVotingPowerAtStateVersion, calculateTWAVotingPower } = createDependencyLayer({
  dbClient: db,
});

const START_DATE = process.env.START_DATE;
const END_DATE = process.env.END_DATE;
const ACCOUNTS_FILE_PATH = process.env.ACCOUNTS_FILE_PATH || "./accounts.ts";

if (!START_DATE || !END_DATE) {
  throw new Error("START_DATE and END_DATE must be set");
}

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const main = async () => {
  const startDate = new Date(START_DATE);
  const endDate = new Date(END_DATE);

  // get addresses from dynamic file
  const { accounts } = await import(ACCOUNTS_FILE_PATH);
  // const addresses = accounts.map((account: { account_address: string }) => account.account_address);

  console.log(`Getting voting power for ${accounts.length} addresses`);

  // Split addresses into batches of 1000
  const addressBatches = chunkArray<{
    account_address: string, selected_option: string, rola_proof: {
      curve: string;
      publicKey: string;
      signature: string;
    }
  }>(accounts, 1000);
  console.log(`Processing ${addressBatches.length} batches of up to 1000 addresses each`);

  const allResults: unknown[] = [];
  const failedBatches: number[] = [];

  for (let i = 0; i < addressBatches.length; i++) {
    const batch = addressBatches[i];
    console.log(`Processing batch ${i + 1}/${addressBatches.length} with ${batch.length} addresses`);

    const result = await calculateVotingPowerAtStateVersion({
      accounts: batch,
      startDate,
      endDate,
    });

    // if success store the results
    if (Exit.isSuccess(result)) {
      allResults.push(result.value);
      console.log(`Batch ${i + 1} completed successfully`);
    }

    // if failure record the batch number and continue
    if (Exit.isFailure(result)) {
      console.error(`Batch ${i + 1} failed:`, JSON.stringify(result.cause, null, 2));
      failedBatches.push(i + 1);
    }
  }

  // Report final results
  console.log("\nProcessing complete:");
  console.log(`- Successful batches: ${allResults.length}`);
  console.log(`- Failed batches: ${failedBatches.length}`);

  if (failedBatches.length > 0) {
    console.log(`- Failed batch numbers: ${failedBatches.join(', ')}`);
  }

  // Exit with error code if any batches failed
  if (failedBatches.length > 0) {
    process.exit(1);
  }

  // calculate time weighted average
  await calculateTWAVotingPower();
  console.log("Time weighted average calculated");
};

main();
