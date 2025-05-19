import { Exit, Effect } from "effect";
import { createDependencyLayer } from "api/consultation";
import { db } from "db/consultation";
import { accounts } from "./consultation-all";
import { Client } from 'pg'
import { createObjectCsvWriter as csvWriter } from 'csv-writer';

const { getVotingPowerAtStateVersion } = createDependencyLayer({
  dbClient: db});

const START_DATE = process.env.START_DATE;
const END_DATE = process.env.END_DATE;

if (!START_DATE || !END_DATE) {
  throw new Error("START_DATE and END_DATE must be set");
}

const main = async () => {
  const startDate = new Date(START_DATE);
  const endDate = new Date(END_DATE);

  // get addresses from DB
  const addresses = accounts.map((account) => account.account_address);

  console.log(`Getting voting power for ${addresses.length} addresses`);

  const result = await getVotingPowerAtStateVersion({
    addresses: accounts,
    startDate,
    endDate,
  });


  async function saveToCsv(timeWeightedAverageResult: any) {


    const csvFilePath = 'time_weighted_averages.csv';
    const csvWriterInstance = csvWriter({
      path: csvFilePath,
      header: [
        { id: 'account_address', title: 'Account Address' },
        { id: 'time_weighted_average', title: 'Time Weighted Average' },
        { id: 'selected_option', title: 'Selected Option' },
        { id: 'rola_proof', title: 'Rola Proof' }
      ]
    });

    const records = timeWeightedAverageResult.rows.map((row:
      { account_address: any; time_weighted_average: any; selected_option: any; rola_proof: any; }) => ({
        account_address: row.account_address,
        time_weighted_average: parseFloat(Number(row.time_weighted_average).toFixed(2)),
        selected_option: row.selected_option,
        rola_proof: row.rola_proof
      }));

    await csvWriterInstance.writeRecords(records);
    console.log(`Time-weighted averages successfully saved to ${csvFilePath}`);
  }

  if (Exit.isSuccess(result)) {
    console.log("Successfully got voting power for all addresses");

  }
  if (Exit.isFailure(result)) {
    console.log(JSON.stringify(result.cause, null, 2));
    process.exit(1);
  }

};

main();
