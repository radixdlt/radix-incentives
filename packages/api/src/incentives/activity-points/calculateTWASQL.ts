import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError, DbReadOnlyClientService } from "../db/dbClient";
import { sql } from "drizzle-orm";
import { z } from "zod";

export const calculateTWASQLInputSchema = z.object({
  weekId: z.string(),
  addresses: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date(),
  calculationType: z.enum(["USDValue", "USDValueDurationMultiplied"]).default("USDValueDurationMultiplied"),
  filterType: z.enum(["exclude_hold", "include_hold"]).default("exclude_hold"),
  filterZeroValues: z.boolean().default(true),
});

export type CalculateTWASQLInput = z.infer<
  typeof calculateTWASQLInputSchema
>;

export type CalculateTWASQLOutput = {
  accountAddress: string;
  activityId: string;
  activityPoints: number;
  weekId: string;
}[];

export class CalculateTWASQLService extends Context.Tag(
  "CalculateTWASQLService"
)<
  CalculateTWASQLService,
  (
    input: CalculateTWASQLInput
  ) => Effect.Effect<CalculateTWASQLOutput, DbError>
>() { }

const MAX_ADDRESSES_PER_BATCH = 1500; // Keep well below PostgreSQL's 1664 limit

export const CalculateTWASQLLive = Layer.effect(
  CalculateTWASQLService,
  Effect.gen(function* () {
    const readOnlyDb = yield* DbReadOnlyClientService;
    const db = yield* DbClientService;

    return (input) => {
      const executeQuery = (addressBatch: string[]) => {
        return Effect.tryPromise({
          try: async () => {
            // Debug log to ensure this code is being executed
            console.log('Executing SQL query with read-only database client');
            const effectiveDb = readOnlyDb || db;
            const result = await effectiveDb.execute(sql`
              WITH expanded_activities AS (
                -- Expand jsonb array into individual activity rows
                SELECT 
                  ab.timestamp,
                  ab.account_address,
                  activity_item->>'activityId' AS activity_id,
                  (activity_item->>'usdValue')::decimal AS usd_value
                FROM account_balances ab
                CROSS JOIN jsonb_array_elements(ab.data) AS activity_item
                WHERE ab.timestamp >= ${input.startDate.toISOString()}
                  AND ab.timestamp <= ${input.endDate.toISOString()}
                  AND ab.account_address = ANY(ARRAY[${sql.join(addressBatch.map(addr => sql`${addr}`), sql`, `)}])
                  AND ab.data IS NOT NULL
                  AND jsonb_typeof(ab.data) = 'array'
                  AND ${input.filterType === "exclude_hold" 
                    ? sql`(activity_item->>'activityId') NOT LIKE '%hold_%'`
                    : sql`(activity_item->>'activityId') LIKE '%hold_%'`}
              ),
              activities_with_duration AS (
                -- Calculate duration to next timestamp using LEAD window function
                SELECT 
                  account_address,
                  activity_id,
                  timestamp,
                  usd_value,
                  COALESCE(
                    LEAD(timestamp) OVER (
                      PARTITION BY account_address, activity_id 
                      ORDER BY timestamp
                    ),
                    ${input.endDate.toISOString()}::timestamp with time zone
                  ) AS next_timestamp
                FROM expanded_activities
              ),
              weighted_calculations AS (
                -- Calculate weighted values and durations
                SELECT 
                  account_address,
                  activity_id,
                  EXTRACT(EPOCH FROM (next_timestamp - timestamp)) * 1000 AS duration_ms,
                  usd_value * EXTRACT(EPOCH FROM (next_timestamp - timestamp)) * 1000 AS weighted_value
                FROM activities_with_duration
                WHERE next_timestamp > timestamp
              ),
              twa_results AS (
                -- Calculate time-weighted average per account/activity
                SELECT 
                  account_address,
                  activity_id,
                  SUM(weighted_value) / NULLIF(SUM(duration_ms), 0) AS twa_usd_value,
                  SUM(duration_ms) / (1000.0 * 60.0) AS total_duration_minutes
                FROM weighted_calculations
                GROUP BY account_address, activity_id
                HAVING SUM(duration_ms) > 0
              )
              -- Apply calculation type and format results
              SELECT 
                account_address,
                activity_id,
                ${input.weekId}::uuid AS week_id,
                CASE 
                  WHEN ${input.calculationType} = 'USDValue' THEN 
                    ROUND(twa_usd_value, 2)::bigint
                  ELSE 
                    ROUND(twa_usd_value * total_duration_minutes, 0)::bigint
                END AS activity_points
              FROM twa_results
              WHERE ${input.filterZeroValues 
                ? sql`twa_usd_value > 0
                  AND CASE 
                    WHEN ${input.calculationType} = 'USDValue' THEN 
                      ROUND(twa_usd_value, 2)
                    ELSE 
                      ROUND(twa_usd_value * total_duration_minutes, 0)
                  END > 0`
                : sql`1=1`}
              ORDER BY account_address, activity_id;
            `);

            type QueryResult = {
              account_address: string;
              activity_id: string;
              activity_points: string;
              week_id: string;
            };

            const rows = result as unknown as QueryResult[];

            return rows.map((row) => ({
              accountAddress: row.account_address,
              activityId: row.activity_id,
              activityPoints: Number(row.activity_points),
              weekId: row.week_id,
            }));
          },
          catch: (error) => new DbError(error),
        });
      };

      // If addresses array is small enough, process in single batch
      if (input.addresses.length <= MAX_ADDRESSES_PER_BATCH) {
        return executeQuery(input.addresses);
      }

      // For large arrays, process in batches in parallel and combine results
      return Effect.gen(function* () {
        // Split addresses into batches
        const batches: string[][] = [];
        for (let i = 0; i < input.addresses.length; i += MAX_ADDRESSES_PER_BATCH) {
          batches.push(input.addresses.slice(i, i + MAX_ADDRESSES_PER_BATCH));
        }

        yield* Effect.log(`Processing ${input.addresses.length} addresses in ${batches.length} parallel batches`);

        // Process batches in parallel with controlled concurrency
        const maxConcurrency = Number.parseInt(process.env.ACTIVITY_POINTS_SQL_CONCURRENCY || "5", 10);
        const concurrency = Math.min(batches.length, maxConcurrency);

        yield* Effect.log(`Using concurrency level: ${concurrency}`);

        const allBatchResults = yield* Effect.forEach(
          batches,
          (addressBatch, index) =>
            Effect.gen(function* () {
              yield* Effect.log(`Starting batch ${index + 1}/${batches.length} (${addressBatch.length} addresses)`);
              const batchResults = yield* executeQuery(addressBatch);
              yield* Effect.log(`Completed batch ${index + 1}/${batches.length} - found ${batchResults.length} results`);
              return batchResults;
            }),
          { concurrency }
        );

        // Flatten all results
        const allResults = allBatchResults.flat();

        yield* Effect.log(`Completed processing ${input.addresses.length} addresses in ${batches.length} parallel batches. Total results: ${allResults.length}`);

        return allResults;
      });
    };
  })
);