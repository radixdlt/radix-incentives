import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

export type PartitionManager = {
  createWeeklyPartitions: (weekStart: Date, weekEnd: Date, activityGroups: string[][]) => Promise<void>;
  dropOldPartitions: (cutoffDate: Date) => Promise<void>;
  getPartitionInfo: () => Promise<Array<{ tablename: string; size: string }>>;
  ensurePartitionExists: (timestamp: Date, activityId: string) => Promise<string>;
  optimizePartitions: () => Promise<void>;
};

export const accountBalancesTimeseriesPartitionSQL = {

  // Create the main partitioned table
  createPartitionedTable: `
    CREATE TABLE IF NOT EXISTS account_balances_timeseries (
      timestamp TIMESTAMPTZ NOT NULL,
      account_address VARCHAR(255) NOT NULL,
      usd_value DECIMAL(18,2) NOT NULL,
      activity_id TEXT NOT NULL,
      data JSONB NOT NULL,
      PRIMARY KEY (account_address, timestamp, activity_id)
    ) PARTITION BY RANGE (timestamp);
  `,
};

// Partition management utilities - these will be used in migrations
export const accountBalancesPartitionSQL = {
  // Create the main partitioned table
  createPartitionedTable: `
    CREATE TABLE IF NOT EXISTS account_balances (
      timestamp TIMESTAMPTZ NOT NULL,
      account_address VARCHAR(255) NOT NULL,
      usd_value DECIMAL(18,2) NOT NULL,
      activity_id TEXT NOT NULL,
      data JSONB NOT NULL,
      PRIMARY KEY (account_address, timestamp, activity_id)
    ) PARTITION BY RANGE (timestamp);
  `,

  // Create a weekly partition with sub-partitioning by activity_id
  createWeeklyPartition: (weekStart: string, weekEnd: string) => `
    CREATE TABLE IF NOT EXISTS account_balances_${weekStart.replace(/-/g, '_')} 
    PARTITION OF account_balances 
    FOR VALUES FROM ('${weekStart}') TO ('${weekEnd}')
    PARTITION BY LIST (activity_id);
  `,

  // Create activity sub-partitions within a week
  createActivityPartition: (weekStart: string, activityIds: string[]) => {
    if (!activityIds || activityIds.length === 0) {
      throw new Error('activityIds array cannot be empty when creating activity partition');
    }
    
    const firstActivityId = activityIds[0];
    if (!firstActivityId) {
      throw new Error('First activity ID cannot be undefined');
    }
    
    return `
      CREATE TABLE IF NOT EXISTS account_balances_${weekStart.replace(/-/g, '_')}_${firstActivityId.replace(/[^a-zA-Z0-9]/g, '_')}
      PARTITION OF account_balances_${weekStart.replace(/-/g, '_')}
      FOR VALUES IN (${activityIds.map(id => `'${id}'`).join(', ')});
    `;
  },

  // Create indexes on partition
  createPartitionIndexes: (tableName: string) => `
    CREATE INDEX IF NOT EXISTS ${tableName}_timestamp_idx ON ${tableName} (timestamp);
    CREATE INDEX IF NOT EXISTS ${tableName}_activity_idx ON ${tableName} (activity_id);
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
    activityGroups: string[][]
  ): Promise<void> => {
    const weekKey = getWeekKey(weekStart);
    const weekStartStr = formatDate(weekStart);
    const weekEndStr = formatDate(weekEnd);

    try {
      // Create the weekly range partition
      await db.execute(sql.raw(
        accountBalancesPartitionSQL.createWeeklyPartition(weekStartStr, weekEndStr)
      ));

      // Create activity sub-partitions within the week
      for (const activityGroup of activityGroups) {
        await db.execute(sql.raw(
          accountBalancesPartitionSQL.createActivityPartition(weekStartStr, activityGroup)
        ));
        
        // Create indexes on each activity partition
        const tableName = `account_balances_${weekKey}_${activityGroup[0].replace(/[^a-zA-Z0-9]/g, '_')}`;
        await db.execute(sql.raw(
          accountBalancesPartitionSQL.createPartitionIndexes(tableName)
        ));
      }

      console.log(`Created partitions for week ${weekStartStr} with ${activityGroups.length} activity groups`);
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

  const ensurePartitionExists = async (timestamp: Date, activityId: string): Promise<string> => {
    const weekStart = new Date(timestamp);
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay()); // Start of week (Sunday)
    
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
    
    const weekKey = getWeekKey(weekStart);
    const activityKey = activityId.replace(/[^a-zA-Z0-9]/g, '_');
    const tableName = `account_balances_${weekKey}_${activityKey}`;

    // Check if partition exists
    const exists = await db.execute(sql`
      SELECT 1 FROM pg_tables WHERE tablename = ${tableName}
    `);

    if (exists.rows.length === 0) {
      // Create partition on-demand
      await createWeeklyPartitions(weekStart, weekEnd, [[activityId]]);
    }

    return tableName;
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

  return {
    createWeeklyPartitions,
    dropOldPartitions,
    getPartitionInfo,
    ensurePartitionExists,
    optimizePartitions,
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
    // Group records by partition
    const partitionGroups = new Map<string, BatchRecord[]>();

    for (const record of records) {
      const partitionName = await partitionManager.ensurePartitionExists(
        record.timestamp,
        record.activityId
      );
      
      if (!partitionGroups.has(partitionName)) {
        partitionGroups.set(partitionName, []);
      }
      const existingGroup = partitionGroups.get(partitionName);
      if (existingGroup) {
        existingGroup.push(record);
      }
    }

    // Insert to each partition separately for better performance
    for (const [partitionName, partitionRecords] of partitionGroups) {
      await db.execute(sql`
        INSERT INTO ${sql.identifier(partitionName)} 
        (timestamp, account_address, activity_id, usd_value, data)
        VALUES ${sql.join(
          partitionRecords.map(r => sql`(${r.timestamp}, ${r.accountAddress}, ${r.activityId}, ${r.usdValue}, ${r.data})`),
          sql`, `
        )}
        ON CONFLICT (account_address, timestamp, activity_id) 
        DO UPDATE SET 
          usd_value = EXCLUDED.usd_value,
          data = EXCLUDED.data
      `);
    }
  };
}; 