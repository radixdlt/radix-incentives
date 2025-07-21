
import { createObjectCsvWriter as csvWriter } from 'csv-writer';
import { Effect } from 'effect';
import { DbClientService } from '../db/dbClient';
import { sql } from 'drizzle-orm';

type TimeWeightedAverageRow = {
  account_address: string;
  time_weighted_average: number;
  selected_option: string;
  rola_proof: string;
};

type TimeWeightedAverageResult = {
  rows: TimeWeightedAverageRow[];
};

export async function saveToCsv(timeWeightedAverageResult: TimeWeightedAverageResult) {


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

    const records = timeWeightedAverageResult.rows.map((row: TimeWeightedAverageRow) => ({
        account_address: row.account_address,
        time_weighted_average: Number.parseFloat(Number(row.time_weighted_average).toFixed(2)),
        selected_option: row.selected_option,
        rola_proof: row.rola_proof
      }));

    await csvWriterInstance.writeRecords(records);
    console.log(`Time-weighted averages successfully saved to ${csvFilePath}`);
  }

const timeWeightedAverageQuery = `
WITH intervals AS (
      SELECT 
        account_address,
        voting_power,
        selected_option,
        rola_proof,
        EXTRACT(EPOCH FROM (LEAD(timestamp, 1, NOW()) OVER (PARTITION BY account_address ORDER BY timestamp) - timestamp)) AS interval_seconds
      FROM 
        voting_power_results
    )
    SELECT 
      account_address, selected_option,rola_proof,
      SUM(voting_power * interval_seconds) / SUM(interval_seconds) AS time_weighted_average
    FROM 
      intervals
    GROUP BY 
      account_address,selected_option,rola_proof;
`;


export class CalculateTWAVotingPowerService extends Effect.Service<CalculateTWAVotingPowerService>()(
  "CalculateTWAVotingPowerService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* () {
          const result = yield* Effect.promise(() => db.execute(sql.raw(timeWeightedAverageQuery)));
          yield* Effect.promise(() => saveToCsv(result as unknown as TimeWeightedAverageResult));
        }),
      };
    }),
  }
) {}
