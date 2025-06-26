import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

export type PartitionManager = {
  createWeeklyPartitions: (weekStart: Date, weekEnd: Date, hashPartitions?: number) => Promise<void>;
  dropOldPartitions: (cutoffDate: Date) => Promise<void>;
  getPartitionInfo: () => Promise<Array<{ tablename: string; size: string }>>;
  ensurePartitionExists: (timestamp: Date) => Promise<string[]>;
  optimizePartitions: () => Promise<void>;
  consolidateOldPartitions: (monthsThreshold?: number, dryRun?: boolean) => Promise<void>;
  getConsolidationStatus: () => Promise<Array<{ week_key: string; partition_type: string; partition_count: number }>>;
};

// Partition management utilities - these will be used in migrations
export const accountBalancesPartitionSQL = {
  // Create the main partitioned table with range partitioning by timestamp
  createPartitionedTable: `
    CREATE TABLE IF NOT EXISTS account_balances (
      timestamp TIMESTAMPTZ NOT NULL,
      account_address VARCHAR(255) NOT NULL,
      data JSONB NOT NULL,
      PRIMARY KEY (account_address, timestamp)
    ) PARTITION BY RANGE (timestamp);
  `,

  // Create a weekly partition with hash sub-partitioning by account_address
  createWeeklyPartition: (weekStart: string, weekEnd: string) => `
    CREATE TABLE IF NOT EXISTS account_balances_${weekStart.replace(/-/g, '_')} 
    PARTITION OF account_balances 
    FOR VALUES FROM ('${weekStart}') TO ('${weekEnd}')
    PARTITION BY HASH (account_address);
  `,

  // Create hash sub-partitions within a week (distributed by account_address)
  createHashPartition: (weekStart: string, hashNumber: number, modulus: number) => `
    CREATE TABLE IF NOT EXISTS account_balances_${weekStart.replace(/-/g, '_')}_hash_${hashNumber}
    PARTITION OF account_balances_${weekStart.replace(/-/g, '_')}
    FOR VALUES WITH (modulus ${modulus}, remainder ${hashNumber});
  `,

  // Create indexes on partition
  createPartitionIndexes: (tableName: string) => `
    CREATE INDEX IF NOT EXISTS ${tableName}_timestamp_idx ON ${tableName} (timestamp);
    CREATE INDEX IF NOT EXISTS ${tableName}_account_idx ON ${tableName} (account_address);
    CREATE INDEX IF NOT EXISTS ${tableName}_compound_idx ON ${tableName} (account_address, timestamp);
  `,

  // Drop old partitions (for data retention)
  dropPartition: (weekStart: string) => `
    DROP TABLE IF EXISTS account_balances_${weekStart.replace(/-/g, '_')} CASCADE;
  `,

  // Get partition information
  getPartitionInfo: `
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    FROM pg_tables 
    WHERE tablename LIKE 'account_balances_%'
    ORDER BY tablename;
  `,
};

/**
 * Creates a partition manager for the account_balances table
 * Handles range partitioning by timestamp and list partitioning by activity_id
 */
export const createPartitionManager = (
  db: NodePgDatabase<Record<string, never>>
): PartitionManager => {
  
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getWeekKey = (date: Date): string => {
    return formatDate(date).replace(/-/g, '_');
  };

  const createWeeklyPartitions = async (
    weekStart: Date,
    weekEnd: Date,
    hashPartitions = 4  // Default to 4 hash partitions
  ): Promise<void> => {
    const weekKey = getWeekKey(weekStart);
    const weekStartStr = formatDate(weekStart);
    const weekEndStr = formatDate(weekEnd);

    try {
      // Create the weekly range partition
      await db.execute(sql.raw(
        accountBalancesPartitionSQL.createWeeklyPartition(weekStartStr, weekEndStr)
      ));

      // Create hash sub-partitions within the week (distributed by account_address)
      for (let i = 0; i < hashPartitions; i++) {
        await db.execute(sql.raw(
          accountBalancesPartitionSQL.createHashPartition(weekStartStr, i, hashPartitions)
        ));
        
        // Create indexes on each hash partition
        const tableName = `account_balances_${weekKey}_hash_${i}`;
        await db.execute(sql.raw(
          accountBalancesPartitionSQL.createPartitionIndexes(tableName)
        ));
      }

      console.log(`Created partitions for week ${weekStartStr} with ${hashPartitions} hash partitions`);
    } catch (error) {
      console.error(`Failed to create partitions for week ${weekStartStr}:`, error);
      throw error;
    }
  };

  const dropOldPartitions = async (cutoffDate: Date): Promise<void> => {
    const cutoffKey = getWeekKey(cutoffDate);
    
    try {
      // Get list of partitions older than cutoff
      const cutoffTableName = `account_balances_${cutoffKey}`;
      const result = await db.execute(sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE tablename LIKE 'account_balances_%' 
        AND tablename < ${cutoffTableName}
      `);

      for (const row of result.rows) {
        const tableName = (row as Record<string, unknown>).tablename as string;
        await db.execute(sql.raw(`DROP TABLE IF EXISTS ${tableName} CASCADE`));
        console.log(`Dropped old partition: ${tableName}`);
      }
    } catch (error) {
      console.error('Failed to drop old partitions:', error);
      throw error;
    }
  };

  const getPartitionInfo = async (): Promise<Array<{ tablename: string; size: string }>> => {
    const result = await db.execute(sql.raw(accountBalancesPartitionSQL.getPartitionInfo));
    return result.rows as Array<{ tablename: string; size: string }>;
  };

  const ensurePartitionExists = async (timestamp: Date): Promise<string[]> => {
    const weekStart = new Date(timestamp);
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay()); // Start of week (Sunday)
    
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
    
    const weekKey = getWeekKey(weekStart);
    const hashPartitions = 4; // Default number of hash partitions
    
    // Check if weekly partition exists
    const weeklyPartitionName = `account_balances_${weekKey}`;
    const weeklyPartitionExists = await db.execute(sql`
      SELECT 1 FROM pg_tables WHERE tablename = ${weeklyPartitionName}
    `);

    if (weeklyPartitionExists.rows.length === 0) {
      // Create weekly partition with hash sub-partitions
      await createWeeklyPartitions(weekStart, weekEnd, hashPartitions);
    }

    // Return all hash partition names for this week
    const partitionNames: string[] = [];
    for (let i = 0; i < hashPartitions; i++) {
      partitionNames.push(`account_balances_${weekKey}_hash_${i}`);
    }

    return partitionNames;
  };

  const optimizePartitions = async (): Promise<void> => {
    try {
      // Analyze all partitions for better query planning
      const partitions = await getPartitionInfo();
      
      for (const partition of partitions) {
        await db.execute(sql.raw(`ANALYZE ${partition.tablename}`));
      }

      // Vacuum partitions periodically
      for (const partition of partitions) {
        await db.execute(sql.raw(`VACUUM ANALYZE ${partition.tablename}`));
      }

      console.log(`Optimized ${partitions.length} partitions`);
    } catch (error) {
      console.error('Failed to optimize partitions:', error);
      throw error;
    }
  };

  const consolidateOldPartitions = async (monthsThreshold = 3, dryRun = false): Promise<void> => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM consolidate_old_hash_partitions(${monthsThreshold}, ${dryRun})
      `);
      
      console.log(`Consolidation ${dryRun ? 'analysis' : 'execution'} completed for partitions older than ${monthsThreshold} months`);
      
      if (dryRun) {
        console.log(`Found ${result.rows.length} weeks that would be consolidated`);
      } else {
        const consolidated = result.rows.filter((row: Record<string, unknown>) => row.action_taken === 'CONSOLIDATED');
        console.log(`Successfully consolidated ${consolidated.length} weeks`);
      }
    } catch (error) {
      console.error('Failed to consolidate old partitions:', error);
      throw error;
    }
  };

  const getConsolidationStatus = async (): Promise<Array<{ week_key: string; partition_type: string; partition_count: number }>> => {
    try {
      const result = await db.execute(sql`
        SELECT week_key, partition_type, partition_count 
        FROM get_partition_consolidation_status()
        ORDER BY week_start DESC
      `);
      
      return result.rows as Array<{ week_key: string; partition_type: string; partition_count: number }>;
    } catch (error) {
      console.error('Failed to get consolidation status:', error);
      throw error;
    }
  };

  return {
    createWeeklyPartitions,
    dropOldPartitions,
    getPartitionInfo,
    ensurePartitionExists,
    optimizePartitions,
    consolidateOldPartitions,
    getConsolidationStatus,
  };
};

/**
 * Utility to group activities for sub-partitioning
 * Groups activities to balance partition sizes and query patterns
 */
export const createActivityGroups = (
  activities: Array<{ id: string; category: string; type: string }>,
  maxGroupSize = 10
): string[][] => {
  // Group by category and type for better query locality
  const categoryGroups = new Map<string, string[]>();
  
  for (const activity of activities) {
    const key = `${activity.category}_${activity.type}`;
    if (!categoryGroups.has(key)) {
      categoryGroups.set(key, []);
    }
    const existingGroup = categoryGroups.get(key);
    if (existingGroup) {
      existingGroup.push(activity.id);
    }
  }

  const groups: string[][] = [];
  
  for (const [, activityIds] of categoryGroups) {
    // Split large groups
    for (let i = 0; i < activityIds.length; i += maxGroupSize) {
      groups.push(activityIds.slice(i, i + maxGroupSize));
    }
  }

  return groups;
};

type BatchRecord = {
  timestamp: Date;
  accountAddress: string;
  activityId: string;
  usdValue: string;
  data: Record<string, unknown>;
};

/**
 * Batch insert utility for partitioned tables
 * Automatically routes data to correct partitions
 */
export const createBatchInserter = (db: NodePgDatabase<Record<string, never>>, partitionManager: PartitionManager) => {
  return async (records: BatchRecord[]): Promise<void> => {
    if (records.length === 0) return;

    // Group records by week to ensure partitions exist
    const weekGroups = new Map<string, BatchRecord[]>();
    
    for (const record of records) {
      const weekStart = new Date(record.timestamp);
      weekStart.setUTCHours(0, 0, 0, 0);
      weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
      const weekKey = weekStart.toISOString().split('T')[0].replace(/-/g, '_');
      
      if (!weekGroups.has(weekKey)) {
        weekGroups.set(weekKey, []);
      }
      weekGroups.get(weekKey)?.push(record);
    }

    // Ensure all required partitions exist and insert data
    for (const [weekKey, weekRecords] of weekGroups) {
      const timestamp = weekRecords[0]?.timestamp;
      if (!timestamp) continue;

      // Ensure partitions exist for this week
      const partitionNames = await partitionManager.ensurePartitionExists(timestamp);
      
      // Insert all records for this week (PostgreSQL will automatically route to correct hash partition)
      const values = weekRecords.map(record => 
        `('${record.timestamp.toISOString()}', '${record.accountAddress}', ${record.usdValue}, '${record.activityId}', '${JSON.stringify(record.data)}')`
      ).join(', ');

      const insertSQL = `
        INSERT INTO account_balances (timestamp, account_address, usd_value, activity_id, data)
        VALUES ${values}
        ON CONFLICT (account_address, timestamp, activity_id) DO UPDATE SET
          usd_value = EXCLUDED.usd_value,
          data = EXCLUDED.data;
      `;

      await db.execute(sql.raw(insertSQL));
    }
  };
}; 