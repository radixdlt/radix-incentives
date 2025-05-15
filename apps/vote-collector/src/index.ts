import { Exit, Effect } from "effect";
import { createDependencyLayer } from "api/consultation";
import { db } from "db/consultation";
import { accounts } from "./accounts";
import { Client } from 'pg'
import { createObjectCsvWriter as csvWriter } from 'csv-writer';

const { getVotingPowerAtStateVersion } = createDependencyLayer({
  dbClient: db,
});

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
    addresses,
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
        { id: 'selected_option', title: 'Selected Option' }
      ]
    });

    const records = timeWeightedAverageResult.rows.map((row:
      { account_address: any; time_weighted_average: any; selected_option: any; }) => ({
        account_address: row.account_address,
        time_weighted_average: row.time_weighted_average,
        selected_option: row.selected_option
      }));

    await csvWriterInstance.writeRecords(records);
    console.log(`Time-weighted averages successfully saved to ${csvFilePath}`);
  }

  if (Exit.isSuccess(result)) {
    // Map the selected_option to each record in the result
    const updatedResult = result.value.map((item) => {
      return item.map((record) => {
        const account = accounts.find(acc => acc.account_address === record.accountAddress);
        return {
          ...record,
          selected_option: account ? account.selected_option : null
        };
      });
    });

    const client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/radix-incentives',
    });

    await client.connect();

    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS voting_power_results (
          account_address VARCHAR(255),
          voting_power NUMERIC,
          balances JSONB,
          timestamp TIMESTAMP,
          selected_option VARCHAR(255),
          PRIMARY KEY (account_address, timestamp)
        );
      `;

      await client.query(createTableQuery);

      const insertQuery = `
        INSERT INTO voting_power_results (account_address, voting_power, balances, timestamp, selected_option)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (account_address, timestamp) DO UPDATE
        SET voting_power = EXCLUDED.voting_power,
            balances = EXCLUDED.balances;
      `;

      for (const item of updatedResult) {
        for (const record of item) {
          await client.query(insertQuery, [
            record.accountAddress,
            record.votingPower,
            JSON.stringify(record.balances),
            record.timestamp,
            record.selected_option
          ]);
        }
      }


      console.log('Results successfully stored in the database.');
    } catch (error) {
      console.error('Error storing results in the database:', error);
    }

    const timeWeightedAverageQuery = `
      WITH intervals AS (
            SELECT 
              account_address,
              voting_power,
              selected_option,
              EXTRACT(EPOCH FROM (LEAD(timestamp, 1, NOW()) OVER (PARTITION BY account_address ORDER BY timestamp) - timestamp)) AS interval_seconds
            FROM 
              voting_power_results
          )
          SELECT 
            account_address, selected_option,
            SUM(voting_power * interval_seconds) / SUM(interval_seconds) AS time_weighted_average
          FROM 
            intervals
          GROUP BY 
            account_address,selected_option;
    `;

    try {
      const timeWeightedAverageResult = await client.query(timeWeightedAverageQuery);
      await saveToCsv(timeWeightedAverageResult);
    } catch (error) {
      console.error('Error calculating time-weighted averages:', error);
    }

    await client.end();


    // if failure report the error and exit


  }
  if (Exit.isFailure(result)) {
    console.log(JSON.stringify(result.cause, null, 2));
    process.exit(1);
  }

};

main();
