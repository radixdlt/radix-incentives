# Account Balances Table Partitioning Guide

## Overview

This guide explains how to implement and manage table partitioning for the `account_balances` table to handle the projected 4.2 billion rows per week (250,000 accounts × 168 hourly timestamps × 100 activities).

## Partitioning Strategy

- **Range Partitioning**: By timestamp (weekly partitions)
- **List Sub-partitioning**: By activity_id (grouped for optimal performance)
- **Retention Policy**: Automatic cleanup of old partitions

## Migration Example

```sql
-- 1. Drop the existing table (backup data first!)
DROP TABLE IF EXISTS account_balances;

-- 2. Create the main partitioned table
CREATE TABLE account_balances (
  timestamp TIMESTAMPTZ NOT NULL,
  account_address VARCHAR(255) NOT NULL,
  usd_value DECIMAL(18,2) NOT NULL,
  activity_id TEXT NOT NULL,
  data JSONB NOT NULL,
  PRIMARY KEY (account_address, timestamp, activity_id)
) PARTITION BY RANGE (timestamp);

-- 3. Create weekly partitions for the next 4 weeks
-- Week 1: 2024-01-01 to 2024-01-08
CREATE TABLE account_balances_2024_01_01 
PARTITION OF account_balances 
FOR VALUES FROM ('2024-01-01') TO ('2024-01-08')
PARTITION BY LIST (activity_id);

-- Create activity sub-partitions for Week 1
CREATE TABLE account_balances_2024_01_01_holding_passive
PARTITION OF account_balances_2024_01_01
FOR VALUES IN ('xrd_holding', 'lsu_holding', 'usdc_holding');

CREATE TABLE account_balances_2024_01_01_trading_active
PARTITION OF account_balances_2024_01_01
FOR VALUES IN ('dex_swap', 'liquidity_provision', 'lending');

-- 4. Create indexes on each partition
CREATE INDEX account_balances_2024_01_01_holding_passive_timestamp_idx 
ON account_balances_2024_01_01_holding_passive (timestamp);

CREATE INDEX account_balances_2024_01_01_holding_passive_account_idx 
ON account_balances_2024_01_01_holding_passive (account_address);
```

## Usage Examples

### 1. Initialize Partition Manager

```typescript
import { createPartitionManager, createActivityGroups, createBatchInserter } from './partition-manager';
import { db } from '../db';

const partitionManager = createPartitionManager(db);
const batchInserter = createBatchInserter(db, partitionManager);
```

### 2. Create Weekly Partitions

```typescript
// Get all activities and group them
const activities = await db.select({
  id: schema.activities.id,
  category: schema.activities.category,
  type: schema.activities.type,
}).from(schema.activities);

// Group activities for sub-partitioning
const activityGroups = createActivityGroups(activities, 10);

// Create partitions for current week
const weekStart = new Date('2024-01-01');
const weekEnd = new Date('2024-01-08');

await partitionManager.createWeeklyPartitions(weekStart, weekEnd, activityGroups);
```

### 3. Batch Insert with Automatic Partitioning

```typescript
const records = [
  {
    timestamp: new Date('2024-01-01T10:00:00Z'),
    accountAddress: 'rdx1q...abc',
    activityId: 'xrd_holding',
    usdValue: '1000.00',
    data: { balance: '1000', multiplier: '2.5' }
  },
  // ... more records
];

await batchInserter(records);
```

### 4. Query Optimization

```typescript
// Query specific partition for better performance
const weeklyBalances = await db.execute(sql`
  SELECT account_address, AVG(usd_value) as avg_balance
  FROM account_balances_2024_01_01_holding_passive
  WHERE timestamp >= '2024-01-01' AND timestamp < '2024-01-08'
  GROUP BY account_address
`);
```

### 5. Partition Maintenance

```typescript
// Clean up old partitions (keep last 12 weeks)
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - (12 * 7));

await partitionManager.dropOldPartitions(cutoffDate);

// Optimize partition performance
await partitionManager.optimizePartitions();

// Get partition information
const partitionInfo = await partitionManager.getPartitionInfo();
console.log('Partition sizes:', partitionInfo);
```

## Performance Benefits

### Before Partitioning
- **Insert Performance**: Degrades exponentially with table size
- **Index Maintenance**: Entire table indexes rebuilt on every insert
- **Query Performance**: Full table scans for time-range queries
- **Storage**: 4.2B rows × 52 weeks = 218B rows in single table

### After Partitioning
- **Insert Performance**: Constant time per partition
- **Index Maintenance**: Only partition-level indexes affected
- **Query Performance**: Partition pruning eliminates irrelevant data
- **Storage**: Automatic cleanup of old partitions

## Monitoring and Maintenance

### 1. Automated Partition Creation (Cron Job)

```typescript
// scheduled-partitions.ts
import { CronJob } from 'cron';

const createWeeklyPartitionsJob = new CronJob('0 0 * * 0', async () => {
  const nextWeekStart = new Date();
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  nextWeekStart.setUTCHours(0, 0, 0, 0);
  
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
  
  const activities = await getActivities();
  const activityGroups = createActivityGroups(activities);
  
  await partitionManager.createWeeklyPartitions(nextWeekStart, nextWeekEnd, activityGroups);
}, null, true, 'UTC');
```

### 2. Partition Health Monitoring

```typescript
// monitoring.ts
export const checkPartitionHealth = async () => {
  const partitions = await partitionManager.getPartitionInfo();
  
  for (const partition of partitions) {
    const sizeMB = parseFloat(partition.size.replace(/[^\d.]/g, ''));
    
    if (sizeMB > 1000) { // Alert if partition > 1GB
      console.warn(`Large partition detected: ${partition.tablename} (${partition.size})`);
    }
  }
};
```

## Best Practices

1. **Partition Size**: Keep partitions between 100MB - 1GB for optimal performance
2. **Index Strategy**: Create indexes on each partition, not the main table
3. **Query Patterns**: Include partition keys in WHERE clauses for partition pruning
4. **Maintenance Windows**: Schedule VACUUM and ANALYZE during low-traffic periods
5. **Monitoring**: Set up alerts for partition sizes and query performance
6. **Testing**: Test partition creation/deletion in staging environment first

## Troubleshooting

### Common Issues

1. **Partition Not Found**: Ensure `ensurePartitionExists` is called before inserts
2. **Slow Queries**: Check if partition pruning is working with `EXPLAIN`
3. **Large Partitions**: Consider more granular sub-partitioning
4. **Foreign Key Constraints**: May need to be disabled on partitioned tables

### Query Examples

```sql
-- Check partition pruning
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM account_balances 
WHERE timestamp >= '2024-01-01' AND timestamp < '2024-01-08'
AND activity_id = 'xrd_holding';

-- Monitor partition sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE tablename LIKE 'account_balances_%'
ORDER BY size_bytes DESC;
``` 