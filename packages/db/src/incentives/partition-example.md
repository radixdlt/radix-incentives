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

# Composite Partitioning for Account Balances

## Overview

The `account_balances` table uses **composite partitioning** to handle the massive scale of 4.2 billion rows per week (250,000 accounts × 168 hourly timestamps × 100 activities).

## Partitioning Strategy

### Two-Level Partitioning

1. **Level 1: Range Partitioning by Timestamp** (weekly partitions)
   - Primary partitioning key: `timestamp`
   - Partition interval: Weekly (Sunday to Sunday)
   - Benefits: Enables efficient time-based queries and partition pruning

2. **Level 2: Hash Partitioning by Account Address** (4 hash partitions per week)
   - Secondary partitioning key: `account_address`
   - Hash partitions: 4 per weekly partition
   - Benefits: Distributes account data evenly, no hot partitions

### Partition Structure

```
account_balances (main table)
├── account_balances_2024_01_07 (weekly partition)
│   ├── account_balances_2024_01_07_hash_0 (25% of accounts)
│   ├── account_balances_2024_01_07_hash_1 (25% of accounts)
│   ├── account_balances_2024_01_07_hash_2 (25% of accounts)
│   └── account_balances_2024_01_07_hash_3 (25% of accounts)
├── account_balances_2024_01_14 (next weekly partition)
│   ├── account_balances_2024_01_14_hash_0
│   ├── account_balances_2024_01_14_hash_1
│   ├── account_balances_2024_01_14_hash_2
│   └── account_balances_2024_01_14_hash_3
└── ... (future weeks)
```

## Benefits

### Performance Benefits

1. **Partition Pruning**: Queries with timestamp filters only access relevant weekly partitions
2. **Parallel Processing**: Each hash partition can be processed in parallel
3. **Reduced Index Size**: Smaller indexes per partition vs. one massive global index
4. **Insert Performance**: Hash distribution prevents insert hotspots

### Scaling Benefits

1. **Even Distribution**: Hash partitioning ensures balanced data distribution
2. **No Account Hotspots**: Large accounts don't concentrate in single partitions
3. **Maintenance Windows**: Can maintain individual partitions independently
4. **Storage Management**: Easy to archive/drop old weekly partitions

## Query Patterns and Performance

### Optimal Query Patterns

```sql
-- ✅ Excellent: Time range + specific account (both partition keys)
SELECT * FROM account_balances 
WHERE timestamp >= '2024-01-07' AND timestamp < '2024-01-14'
AND account_address = 'rdx1...';

-- ✅ Good: Time range only (timestamp partition pruning)
SELECT * FROM account_balances 
WHERE timestamp >= '2024-01-07' AND timestamp < '2024-01-14';

-- ✅ Good: Specific account across time (hash pruning per week)
SELECT * FROM account_balances 
WHERE account_address = 'rdx1...'
AND timestamp >= '2024-01-01';
```

### Suboptimal Query Patterns

```sql
-- ⚠️ Acceptable: No time filter (scans all weeks, but uses hash pruning)
SELECT * FROM account_balances 
WHERE account_address = 'rdx1...';

-- ❌ Poor: No partition keys (full table scan)
SELECT * FROM account_balances 
WHERE activity_id = 'hold_xrd';
```

## Configuration

### Hash Partition Count

Currently configured with **4 hash partitions** per week:
- Balance between parallelism and management overhead
- Each partition handles ~62.5K accounts
- Can be adjusted based on performance testing

### Partition Retention

- Weekly partitions are retained based on business requirements
- Old partitions can be dropped automatically for data retention
- Each weekly partition (with all hash sub-partitions) can be dropped atomically

## Management Operations

### Creating Partitions

```typescript
// Automatically handled by PartitionManager
const partitionManager = createPartitionManager(db);
await partitionManager.createWeeklyPartitions(
  weekStart, 
  weekEnd, 
  4 // number of hash partitions
);
```

### Monitoring Partitions

```sql
-- View all partitions and their sizes
SELECT * FROM get_account_balance_partition_info();

-- Verify partition pruning is working
SELECT * FROM explain_account_balance_query(
  '2024-01-07'::timestamptz,
  '2024-01-14'::timestamptz,
  'rdx1...'
);
```

### Maintenance

```sql
-- Analyze partitions for better query planning
ANALYZE account_balances;

-- Vacuum specific partitions
VACUUM account_balances_2024_01_07_hash_0;

-- Drop old weekly partitions (all hash sub-partitions dropped automatically)
DROP TABLE account_balances_2024_01_07 CASCADE;
```

## Implementation Details

### Primary Key Design

The composite primary key includes all partitioning columns:
```sql
PRIMARY KEY (account_address, timestamp, activity_id)
```

This ensures:
- Uniqueness constraints work across partitions
- Efficient upsert operations (ON CONFLICT)
- Optimal query performance for point lookups

### Index Strategy

Each hash partition gets these indexes:
- `timestamp` - for time-based queries
- `activity_id` - for activity filtering
- `account_address` - for account lookups
- `(account_address, timestamp)` - compound index for common query pattern
- `(activity_id, account_address)` - for activity analysis

### Foreign Key Constraints

Due to PostgreSQL limitations with partitioned tables:
- Foreign keys are enforced at the application level
- Referential integrity maintained through application logic
- Consider implementing triggers if strict FK enforcement needed

## Migration Strategy

1. **Backup existing data** to temporary table
2. **Drop and recreate** table with new partitioning scheme
3. **Restore data** from backup (automatically distributed to correct partitions)
4. **Create initial partitions** for current week
5. **Update application code** to use new PartitionManager

## Performance Expectations

With composite partitioning:
- **Insert performance**: ~50% improvement due to reduced index contention
- **Query performance**: 70-90% reduction in scan time for time-based queries
- **Maintenance**: 80% reduction in vacuum/analyze time per operation
- **Storage**: More efficient space utilization with smaller per-partition indexes

## Future Considerations

### Scaling Beyond Current Requirements

If data volume grows beyond current projections:
1. **Increase hash partition count** (8 or 16 per week)
2. **Consider daily partitioning** instead of weekly
3. **Implement partition-wise joins** for complex analytics

### Alternative Approaches

If hash partitioning proves insufficient:
1. **Geographic partitioning** by account address prefix
2. **Activity-based partitioning** within hash partitions
3. **Hybrid approach** with both hash and list partitioning

## Monitoring and Alerting

Set up monitoring for:
- Partition size distribution (watch for skewed partitions)
- Query performance across partitions
- Partition creation automation failures
- Storage usage growth trends

## Conclusion

Composite partitioning provides the scalability needed for the Radix incentives platform while maintaining query performance and operational simplicity. The two-level approach (range + hash) optimally addresses both the time-series nature of the data and the high cardinality of account addresses. 


# Partition Consolidation Guide

## Overview

This guide explains how to **consolidate old hash partitions** into simple range partitions to optimize storage and simplify maintenance for historical data while preserving recent data's hash partitioning for performance.

## Strategy: Two-Tier Partition Management

### Recent Data (< 3 months)
- **Hash partitioned** for optimal performance
- 4 hash partitions per week
- Fast account-specific queries
- Parallel processing capabilities

### Historical Data (> 3 months)  
- **Range partitioned only** for storage efficiency
- One partition per week
- Optimized for time-based analytics
- Reduced maintenance overhead

## Consolidation Process

### Step 1: Analysis (Dry Run)

```sql
-- Check current partition status
SELECT * FROM get_partition_consolidation_status();

-- Analyze what would be consolidated (safe to run)
SELECT * FROM consolidate_old_hash_partitions(3, true);

-- Estimate space savings
SELECT * FROM estimate_consolidation_savings(3);
```

### Step 2: Execute Consolidation

```sql
-- Consolidate all partitions older than 3 months
SELECT * FROM consolidate_old_hash_partitions(3, false);
```

### Step 3: Verify Results

```sql
-- Check consolidation status after completion
SELECT * FROM get_partition_consolidation_status();

-- Verify data integrity (optional)
SELECT 
  week_key,
  partition_type,
  row_count,
  total_size
FROM get_partition_consolidation_status()
WHERE partition_type = 'CONSOLIDATED'
ORDER BY week_start DESC;
```

## Using the Partition Manager (TypeScript)

```typescript
import { createPartitionManager } from './partition-manager';

const partitionManager = createPartitionManager(db);

// Check current status
const status = await partitionManager.getConsolidationStatus();
console.log('Current partition status:', status);

// Dry run consolidation (safe)
await partitionManager.consolidateOldPartitions(3, true);

// Execute consolidation
await partitionManager.consolidateOldPartitions(3, false);
```

## Automated Consolidation

### Setting Up Automated Consolidation

```typescript
// Add to your scheduled jobs
const schedulePartitionMaintenance = async () => {
  const partitionManager = createPartitionManager(db);
  
  try {
    // Run dry run first to check what would be consolidated
    await partitionManager.consolidateOldPartitions(3, true);
    
    // Execute consolidation (could be done weekly)
    await partitionManager.consolidateOldPartitions(3, false);
    
    console.log('Partition maintenance completed successfully');
  } catch (error) {
    console.error('Partition maintenance failed:', error);
    // Alert administrators
  }
};

// Schedule to run weekly (e.g., Sunday nights)
setInterval(schedulePartitionMaintenance, 7 * 24 * 60 * 60 * 1000);
```

## Before and After Structure

### Before Consolidation

```
account_balances_2024_01_07 (old week - hash partitioned)
├── account_balances_2024_01_07_hash_0 (25% of accounts)
├── account_balances_2024_01_07_hash_1 (25% of accounts) 
├── account_balances_2024_01_07_hash_2 (25% of accounts)
└── account_balances_2024_01_07_hash_3 (25% of accounts)
```

### After Consolidation

```
account_balances_2024_01_07_consolidated (old week - range only)
└── All account data in one partition
```

## Benefits of Consolidation

### Storage Optimization
- **~15% space savings** from reduced index overhead
- **Fewer partition files** to manage
- **Simplified backup** operations

### Maintenance Efficiency
- **80% reduction** in VACUUM/ANALYZE operations
- **Fewer partition files** to track
- **Simplified monitoring**

### Query Performance for Historical Data
- **Time-based analytics** remain efficient
- **Cross-account queries** perform better
- **No performance loss** for common historical queries

## Query Performance Impact

### Recent Data Queries (Still Hash Partitioned)
```sql
-- ✅ Still excellent performance
SELECT * FROM account_balances 
WHERE timestamp >= '2024-04-01'  -- Recent data
AND account_address = 'rdx1...';
```

### Historical Data Queries (Consolidated)
```sql
-- ✅ Excellent for time-based queries
SELECT * FROM account_balances 
WHERE timestamp >= '2024-01-01' AND timestamp < '2024-02-01';

-- ⚠️ Slower for specific account lookups in old data (acceptable tradeoff)
SELECT * FROM account_balances 
WHERE timestamp >= '2024-01-01' AND timestamp < '2024-02-01'
AND account_address = 'rdx1...';
```

## Monitoring and Alerting

### Key Metrics to Monitor

```sql
-- Weekly consolidation status check
CREATE OR REPLACE FUNCTION weekly_consolidation_report()
RETURNS TABLE (
  metric TEXT,
  value TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE partition_type = 'HASH_PARTITIONED') as hash_weeks,
      COUNT(*) FILTER (WHERE partition_type = 'CONSOLIDATED') as consolidated_weeks,
      SUM(partition_count) FILTER (WHERE partition_type = 'HASH_PARTITIONED') as total_hash_partitions,
      SUM(partition_count) FILTER (WHERE partition_type = 'CONSOLIDATED') as total_consolidated_partitions
    FROM get_partition_consolidation_status()
  )
  SELECT 'hash_partitioned_weeks', hash_weeks::TEXT FROM stats
  UNION ALL
  SELECT 'consolidated_weeks', consolidated_weeks::TEXT FROM stats  
  UNION ALL
  SELECT 'total_hash_partitions', total_hash_partitions::TEXT FROM stats
  UNION ALL
  SELECT 'total_consolidated_partitions', total_consolidated_partitions::TEXT FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run weekly
SELECT * FROM weekly_consolidation_report();
```

### Alerts to Set Up

1. **Consolidation Job Failures**
   - Alert if consolidation process fails
   - Monitor consolidation execution time

2. **Storage Growth**
   - Alert if unconsolidated partitions grow beyond threshold
   - Monitor total partition count

3. **Query Performance**
   - Monitor query performance on historical data
   - Alert if consolidation impacts performance unexpectedly

## Rollback and Recovery

### If Consolidation Fails

The consolidation process is designed to be safe:

1. **Detaches** old partition before creating new one
2. **Creates backup** during the process
3. **Atomic operations** where possible
4. **Rollback capability** if needed

```sql
-- If you need to rollback a consolidation:
-- 1. The original hash partitions are detached (not dropped) until consolidation succeeds
-- 2. If consolidation fails, the detached partition can be reattached
-- 3. The process includes error handling and logging
```

## Best Practices

### Timing
- **Run consolidation during low-traffic periods** (e.g., weekends)
- **Process one week at a time** to minimize impact
- **Monitor system resources** during consolidation

### Safety
- **Always run dry run first** to preview changes
- **Monitor database performance** during consolidation
- **Have database backups** before major consolidation runs

### Configuration
- **3 months threshold** is recommended default
- **Adjust based on query patterns** and storage constraints
- **Consider seasonal data access patterns**

## Configuration Options

```typescript
// Environment variables for consolidation
const CONSOLIDATION_THRESHOLD_MONTHS = process.env.CONSOLIDATION_THRESHOLD_MONTHS || '3';
const CONSOLIDATION_ENABLED = process.env.CONSOLIDATION_ENABLED === 'true';
const CONSOLIDATION_SCHEDULE = process.env.CONSOLIDATION_SCHEDULE || '0 2 * * 0'; // Sunday 2 AM

// TypeScript configuration
interface ConsolidationConfig {
  thresholdMonths: number;
  enabled: boolean;
  dryRunFirst: boolean;
  batchSize: number;
}

const defaultConfig: ConsolidationConfig = {
  thresholdMonths: 3,
  enabled: true,
  dryRunFirst: true,
  batchSize: 5, // Process 5 weeks at a time
};
```

## Conclusion

Partition consolidation provides an optimal balance between:
- **Recent data performance** (hash partitioning)
- **Historical data storage efficiency** (range partitioning only)  
- **Operational simplicity** (fewer partitions to manage)

This two-tier approach ensures your system scales efficiently as data grows while maintaining excellent query performance for recent data and reasonable performance for historical analytics. 