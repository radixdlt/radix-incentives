import { Effect } from "effect";
import { activitiesData } from "../../../../db/src/incentives/seed/data/100ActivitiesData";
import type { AggregateAccountBalanceOutput } from "../account-balance/aggregateAccountBalance";
import type { SnapshotInput } from "./snapshot";


type GenerateDummyDataInput = {
  batchAggregatedAccountBalance: AggregateAccountBalanceOutput[];
  batch: string[];
  jobInput: SnapshotInput;
  batchIndex: number;
};

export const generateDummySnapshotData = (input: GenerateDummyDataInput) =>
  Effect.gen(function* () {
    const {
      batchAggregatedAccountBalance,
      batch,
      jobInput,
      batchIndex,
    } = input;
    const { timestamp, jobId } = jobInput;
    const allActivityIds = activitiesData.map((activity: { id: string }) => activity.id);

    // Get existing activity IDs from this batch's aggregated results
    const existingActivityIds = new Set(
      batchAggregatedAccountBalance.flatMap((item) =>
        Array.isArray(item.data) 
          ? item.data.map((d: { activityId: string }) => d.activityId) 
          : []
      )
    );

    // Find missing activity IDs for this batch
    const missingActivityIds = allActivityIds.filter(
      (activityId: string) => !existingActivityIds.has(activityId)
    );

    if (missingActivityIds.length === 0) {
      return batchAggregatedAccountBalance;
    }

    yield* Effect.log(`Adding dummy data for missing activities in batch ${batchIndex + 1} 
      for job ${jobId} with ${batch.length} accounts processed 
      and ${batchAggregatedAccountBalance.length} entries processed
      missingActivityIds: ${missingActivityIds.length}
      existingActivityIds: ${existingActivityIds.size}
      batchAccounts: ${batch.length}
      timestamp: ${timestamp}
    `);

    // Create a map of existing entries by account address for fast lookup
    const existingEntriesMap = new Map<string, AggregateAccountBalanceOutput>();
    for (const entry of batchAggregatedAccountBalance) {
      existingEntriesMap.set(entry.accountAddress, entry);
    }

    // Create dummy activities for missing activity IDs
    const dummyActivities = missingActivityIds.map((activityId: string) => ({
      activityId,
      usdValue: "0",
    }));

    const updatedEntries: AggregateAccountBalanceOutput[] = [];
    const accountsWithEntries = new Set<string>();

    // Update existing entries with dummy data
    for (const entry of batchAggregatedAccountBalance) {
      const existingData = Array.isArray(entry.data) ? entry.data : [];
      const updatedEntry: AggregateAccountBalanceOutput = {
        ...entry,
        data: [
          ...existingData,
          ...dummyActivities,
        ],
      };
      updatedEntries.push(updatedEntry);
      accountsWithEntries.add(entry.accountAddress);
    }

    yield* Effect.log(JSON.stringify({
        message: "Updated entries with dummy data",
        batchIndex: batchIndex + 1,
        jobId: jobId,
        batchAccountsCount: batch.length,
        missingActivitiesCount: missingActivityIds.length,
        updatedEntriesCount: updatedEntries.length,
        timestamp: timestamp,
    }));
    return updatedEntries;
  });