/**
 * Optimized insertion strategies for high-volume data
 * Designed to minimize buffer cache misses and improve performance
 */

import { sql } from 'drizzle-orm';
import { db } from '../client';
import { accountBalances } from '../schema';
import type { AccountBalance } from '../schema';

/**
 * Optimized bulk insertion with batch processing
 * Reduces memory pressure by processing data in smaller chunks
 */
export const optimizedBulkInsert = async (
  data: AccountBalance[],
  options: {
    batchSize?: number;
    disableIndexes?: boolean;
    useTransaction?: boolean;
  } = {}
) => {
  const {
    batchSize = 10000, // Smaller batches reduce memory pressure
    disableIndexes = false,
    useTransaction = true
  } = options;

  // Pre-sort data by partition key to improve locality
  const sortedData = data.sort((a, b) => {
    // Sort by timestamp first (partition key), then by account
    const timeCompare = a.timestamp.getTime() - b.timestamp.getTime();
    if (timeCompare !== 0) return timeCompare;
    return a.accountAddress.localeCompare(b.accountAddress);
  });

  const totalBatches = Math.ceil(sortedData.length / batchSize);
  
  // Disable indexes temporarily for massive insertions
  if (disableIndexes) {
    await db.execute(sql.raw(`
      -- Disable non-essential indexes during bulk insert
      DROP INDEX CONCURRENTLY IF EXISTS idx_account_balances_account_timestamp;
      DROP INDEX CONCURRENTLY IF EXISTS idx_account_balances_timestamp;
    `));
  }

  try {
    for (let i = 0; i < totalBatches; i++) {
      const batch = sortedData.slice(i * batchSize, (i + 1) * batchSize);
      
      if (useTransaction) {
        await db.transaction(async (tx) => {
          await tx.insert(accountBalances).values(batch);
        });
      } else {
        await db.insert(accountBalances).values(batch);
      }

      // Log progress for monitoring
      if (i % 10 === 0) {
        console.log(`Processed batch ${i + 1}/${totalBatches} (${((i + 1) / totalBatches * 100).toFixed(1)}%)`);
      }

      // Optional: yield control to prevent blocking
      if (i % 100 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
  } finally {
    // Recreate indexes after bulk insert
    if (disableIndexes) {
      await db.execute(sql.raw(`
        -- Recreate indexes after bulk insert
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_balances_account_timestamp 
        ON account_balances (account_address, timestamp);
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_balances_timestamp 
        ON account_balances (timestamp);
      `));
    }
  }
};

/**
 * Memory-efficient insertion for partitioned tables
 * Inserts data partition by partition to improve cache locality
 */
export const partitionAwareInsert = async (
  data: AccountBalance[],
  batchSize = 5000
) => {
  // Group data by week (partition key)
  const partitionGroups = new Map<string, AccountBalance[]>();
  
  for (const record of data) {
    const weekStart = getWeekStart(record.timestamp);
    const partitionKey = weekStart.toISOString().slice(0, 10);
    
    if (!partitionGroups.has(partitionKey)) {
      partitionGroups.set(partitionKey, []);
    }
    const group = partitionGroups.get(partitionKey);
    if (group) {
      group.push(record);
    }
  }

  // Insert partition by partition
  for (const [partitionKey, partitionData] of partitionGroups) {
    console.log(`Inserting ${partitionData.length} records for partition ${partitionKey}`);
    
    // Sort within partition by account for better cache locality
    partitionData.sort((a, b) => a.accountAddress.localeCompare(b.accountAddress));
    
    await optimizedBulkInsert(partitionData, { 
      batchSize,
      useTransaction: false // Let each batch be its own transaction
    });
  }
};

/**
 * Get the start of the week for a given timestamp
 */
const getWeekStart = (timestamp: Date): Date => {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
};

/**
 * Pre-warm buffer cache with partition data
 * Load recently accessed partitions into memory before bulk operations
 */
export const prewarmBufferCache = async (weekStart: Date) => {
  const partitionName = `account_balances_${weekStart.toISOString().slice(0, 10).replace(/-/g, '_')}`;
  
  await db.execute(sql.raw(`
    -- Pre-warm buffer cache by reading partition metadata
    SELECT 
      schemaname, 
      tablename, 
      attname, 
      n_distinct, 
      most_common_vals
    FROM pg_stats 
    WHERE tablename = '${partitionName}';
    
    -- Warm up indexes
    SELECT count(*) FROM ${partitionName};
  `));
}; 