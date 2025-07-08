# PostgreSQL Performance Monitoring for Bulk Insertions

## Quick Diagnostic Queries

### 1. Check Current Active Queries and Their Duration

```sql
-- Show currently running queries with their duration
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state,
    wait_event_type,
    wait_event
FROM pg_stat_activity 
WHERE state = 'active' 
    AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;
```

### 2. Monitor Table and Index Sizes

```sql
-- Check table sizes and their indexes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Identify Expensive Index Operations

```sql
-- Show index usage and maintenance overhead
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
JOIN pg_statio_user_indexes USING (schemaname, tablename, indexname)
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 4. Monitor Lock Contention

```sql
-- Check for blocking queries and locks
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process,
    blocked_activity.application_name AS blocked_application,
    blocking_activity.application_name AS blocking_application
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

### 5. Check WAL (Write-Ahead Log) Activity

```sql
-- Monitor WAL generation rate
SELECT 
    pg_current_wal_lsn(),
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) as total_wal,
    pg_stat_wal.*
FROM pg_stat_wal;
```

### 6. Analyze Insert Performance by Table

```sql
-- Check insert statistics per table
SELECT 
    schemaname,
    relname as table_name,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_tup_hot_upd as hot_updates,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_tup_ins DESC;
```

## Real-Time Monitoring During Insertion

### 1. Monitor Progress with Query ID

```sql
-- Enable query tracking (run once)
-- ALTER SYSTEM SET track_activities = on;
-- ALTER SYSTEM SET track_counts = on;
-- SELECT pg_reload_conf();

-- Monitor specific insertion queries
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    query_start,
    now() - query_start as duration,
    state,
    wait_event_type,
    wait_event,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity 
WHERE query ILIKE '%INSERT%account_balances%'
   OR query ILIKE '%upsert%'
ORDER BY query_start;
```

### 2. Monitor Index Maintenance in Real-Time

```sql
-- Check if autovacuum is running on your tables
SELECT 
    pid,
    usename,
    application_name,
    query_start,
    state,
    query
FROM pg_stat_activity 
WHERE query LIKE '%autovacuum%'
   OR query LIKE '%VACUUM%'
   OR query LIKE '%ANALYZE%';
```

## Identifying Slow Indexes

### 1. Find Unused Indexes (Candidates for Removal)

```sql
-- Identify potentially unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan < 10  -- Adjust threshold as needed
    AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 2. Check Index Bloat

```sql
-- Estimate index bloat (requires pgstattuple extension)
-- CREATE EXTENSION IF NOT EXISTS pgstattuple;

SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    round(100 * (1 - (s.avg_leaf_density/100)), 2) as bloat_pct
FROM pg_stat_user_indexes ui
JOIN pg_statio_user_indexes io USING (schemaname, tablename, indexname)
LEFT JOIN LATERAL pgstatindex(indexrelid) s ON true
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

## Account Balances Table Specific Monitoring

### 1. Check Partition Performance

```sql
-- Monitor partition-specific statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables 
WHERE tablename LIKE 'account_balances%'
ORDER BY n_tup_ins DESC;
```

### 2. Check Constraint Exclusion

```sql
-- Verify partition pruning is working
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM account_balances 
WHERE timestamp >= '2025-01-01' 
  AND timestamp < '2025-01-08';
```

## Performance Tuning Recommendations

### 1. Temporary Index Disabling for Bulk Inserts

```sql
-- For very large bulk operations, consider temporarily dropping non-essential indexes
-- CAUTION: Only do this during maintenance windows

-- List all indexes on account_balances
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename LIKE 'account_balances%'
  AND schemaname = 'public';

-- Example: Drop and recreate specific indexes
-- DROP INDEX CONCURRENTLY IF EXISTS idx_account_balances_activity_timestamp;
-- -- Perform bulk insert
-- CREATE INDEX CONCURRENTLY idx_account_balances_activity_timestamp 
--   ON account_balances (activity_id, timestamp);
```

### 2. Optimize Insertion Batch Sizes

```sql
-- Monitor optimal batch size by tracking insertion rates
SELECT 
    date_trunc('minute', query_start) as minute,
    count(*) as queries,
    avg(now() - query_start) as avg_duration,
    max(now() - query_start) as max_duration
FROM pg_stat_activity 
WHERE query LIKE '%INSERT%account_balances%'
  AND state = 'active'
GROUP BY date_trunc('minute', query_start)
ORDER BY minute DESC;
```

### 3. Memory and Configuration Checks

```sql
-- Check relevant PostgreSQL configuration
SELECT 
    name,
    setting,
    unit,
    context
FROM pg_settings 
WHERE name IN (
    'shared_buffers',
    'work_mem',
    'maintenance_work_mem',
    'effective_cache_size',
    'checkpoint_segments',
    'checkpoint_completion_target',
    'wal_buffers',
    'commit_delay',
    'synchronous_commit'
);
```

## Emergency Performance Actions

### 1. If Insertions Are Extremely Slow

```sql
-- Check for long-running transactions that might be blocking
SELECT 
    pid,
    usename,
    application_name,
    xact_start,
    now() - xact_start as xact_duration,
    query_start,
    now() - query_start as query_duration,
    state,
    query
FROM pg_stat_activity 
WHERE state IN ('idle in transaction', 'active')
  AND now() - xact_start > interval '5 minutes'
ORDER BY xact_start;
```

### 2. Force Statistics Update

```sql
-- Update table statistics if they're stale
ANALYZE account_balances;

-- For partitioned tables, analyze each partition
DO $$
DECLARE
    partition_name text;
BEGIN
    FOR partition_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE tablename LIKE 'account_balances_%'
    LOOP
        EXECUTE 'ANALYZE ' || partition_name;
    END LOOP;
END $$;
```

## Automated Monitoring Script

```sql
-- Create a monitoring function to run periodically
CREATE OR REPLACE FUNCTION monitor_insertion_performance()
RETURNS TABLE (
    metric text,
    value text,
    recommendation text
) AS $$
BEGIN
    -- Check for slow queries
    RETURN QUERY
    SELECT 
        'slow_queries' as metric,
        count(*)::text as value,
        CASE 
            WHEN count(*) > 5 THEN 'Consider optimizing queries or adding indexes'
            ELSE 'Normal'
        END as recommendation
    FROM pg_stat_activity 
    WHERE state = 'active' 
      AND now() - query_start > interval '30 seconds';
      
    -- Check table bloat
    RETURN QUERY
    SELECT 
        'largest_table' as metric,
        pg_size_pretty(pg_total_relation_size('account_balances')) as value,
        CASE 
            WHEN pg_total_relation_size('account_balances') > 1073741824 THEN 'Consider partitioning or archiving'
            ELSE 'Normal'
        END as recommendation;
        
END $$ LANGUAGE plpgsql;

-- Run the monitoring function
SELECT * FROM monitor_insertion_performance();
```

## Usage Instructions

1. **Start with the quick diagnostic queries** to get an overview
2. **Run real-time monitoring** during your insertion process
3. **Check partition-specific performance** if using partitioned tables
4. **Look for blocking queries and lock contention**
5. **Monitor index maintenance overhead**
6. **Consider temporary index management** for very large bulk operations

Remember to run `EXPLAIN ANALYZE` on your specific insertion queries to see the actual execution plan and identify bottlenecks. 