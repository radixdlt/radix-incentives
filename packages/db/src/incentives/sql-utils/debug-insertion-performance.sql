-- ===================================================================
-- PostgreSQL Insertion Performance Diagnostic Script
-- Run this script to identify what's causing slow insertions
-- ===================================================================

\echo '=== INSERTION PERFORMANCE DIAGNOSTIC ==='
\echo 'Run this script during or immediately after slow insertions'
\echo ''

-- 1. Check currently running queries and their duration
\echo '1. CURRENTLY RUNNING QUERIES:'
SELECT 
    pid,
    usename,
    application_name,
    now() - pg_stat_activity.query_start AS duration,
    state,
    wait_event_type,
    wait_event,
    LEFT(query, 80) as query_preview
FROM pg_stat_activity 
WHERE state IN ('active', 'idle in transaction')
    AND query NOT LIKE '%pg_stat_activity%'
    AND (query ILIKE '%INSERT%' OR query ILIKE '%upsert%' OR query ILIKE '%account_balances%')
ORDER BY duration DESC;

\echo ''

-- 2. Check table and index sizes for account_balances
\echo '2. ACCOUNT_BALANCES TABLE AND INDEX SIZES:'
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
    round(100.0 * (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) / pg_total_relation_size(schemaname||'.'||tablename), 1) as index_ratio_pct
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename LIKE 'account_balances_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo ''

-- 3. Check specific indexes on account_balances tables
\echo '3. INDEX DETAILS AND USAGE:'
SELECT 
    ui.schemaname,
    ui.relname as table_name,
    ui.indexrelname,
    ui.idx_scan as times_used,
    ui.idx_tup_read,
    ui.idx_tup_fetch,
    pg_size_pretty(pg_relation_size(ui.indexrelid)) as index_size,
    pg_relation_size(ui.indexrelid) as size_bytes
FROM pg_stat_user_indexes ui
WHERE ui.relname LIKE 'account_balances%'
ORDER BY pg_relation_size(ui.indexrelid) DESC;

select * from pg_stat_user_indexes

\echo ''

-- 4. Check for lock contention
\echo '4. LOCK CONTENTION CHECK:'
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    LEFT(blocked_activity.query, 50) AS blocked_query,
    LEFT(blocking_activity.query, 50) AS blocking_query,
    blocked_activity.application_name AS blocked_app,
    blocking_activity.application_name AS blocking_app
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

\echo ''

-- 5. Check insert statistics by table
\echo '5. INSERT STATISTICS BY TABLE:'
SELECT 
    schemaname,
    relname as table_name,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates,
    n_tup_del as total_deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    round(100.0 * n_dead_tup / GREATEST(n_live_tup + n_dead_tup, 1), 1) as dead_tuple_pct,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public' 
    AND relname LIKE 'account_balances%'
ORDER BY n_tup_ins DESC;

\echo ''

-- 6. Check for autovacuum processes
\echo '6. AUTOVACUUM ACTIVITY:'
SELECT 
    pid,
    usename,
    application_name,
    query_start,
    now() - query_start as duration,
    state,
    LEFT(query, 80) as query_preview
FROM pg_stat_activity 
WHERE query LIKE '%autovacuum%'
   OR query LIKE '%VACUUM%'
   OR query LIKE '%ANALYZE%'
   OR application_name LIKE '%autovacuum%';

\echo ''

-- 7. Check partition constraint exclusion (if using partitioned tables)
\echo '7. PARTITION CONSTRAINT CHECK:'
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename LIKE 'account_balances_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

\echo ''

-- 8. Check WAL activity
\echo '8. WAL (Write-Ahead Log) ACTIVITY:'
SELECT 
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) as total_wal_generated,
    wal_records,
    wal_fpi,
    wal_bytes,
    wal_buffers_full,
    wal_write,
    wal_sync,
    wal_write_time,
    wal_sync_time
FROM pg_stat_wal;

\echo ''

-- 9. Check for long-running transactions
\echo '9. LONG-RUNNING TRANSACTIONS:'
SELECT 
    pid,
    usename,
    application_name,
    xact_start,
    now() - xact_start as transaction_duration,
    query_start,
    now() - query_start as query_duration,
    state,
    LEFT(query, 60) as query_preview
FROM pg_stat_activity 
WHERE state IN ('idle in transaction', 'active')
    AND now() - xact_start > interval '1 minute'
ORDER BY xact_start;

\echo ''

-- 10. Check PostgreSQL configuration relevant to insertions
\echo '10. RELEVANT POSTGRESQL CONFIGURATION:'
SELECT 
    name,
    setting,
    unit,
    context,
    short_desc
FROM pg_settings 
WHERE name IN (
    'shared_buffers',
    'work_mem',
    'maintenance_work_mem',
    'effective_cache_size',
    'checkpoint_timeout',
    'checkpoint_completion_target',
    'wal_buffers',
    'commit_delay',
    'synchronous_commit',
    'max_wal_size',
    'min_wal_size'
)
ORDER BY name;

\echo ''

-- 11. Check buffer cache hit ratios
\echo '11. BUFFER CACHE HIT RATIOS:'
SELECT 
    schemaname,
    relname,
    heap_blks_read,
    heap_blks_hit,
    round(100.0 * heap_blks_hit / GREATEST(heap_blks_hit + heap_blks_read, 1), 1) as cache_hit_ratio,
    idx_blks_read,
    idx_blks_hit,
    round(100.0 * idx_blks_hit / GREATEST(idx_blks_hit + idx_blks_read, 1), 1) as idx_cache_hit_ratio
FROM pg_statio_user_tables
WHERE schemaname = 'public' 
    AND relname LIKE 'account_balances%'
ORDER BY heap_blks_read + idx_blks_read DESC;

\echo ''

-- 12. Identify specific slow queries if any are running
\echo '12. SLOW QUERIES ANALYSIS:'
SELECT 
    pid,
    usename,
    application_name,
    query_start,
    now() - query_start as duration,
    state,
    wait_event_type,
    wait_event,
    query
FROM pg_stat_activity 
WHERE state = 'active' 
    AND now() - query_start > interval '10 seconds'
    AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;

\echo ''
\echo '=== SUMMARY AND RECOMMENDATIONS ==='

-- Summary query to identify the most likely culprits
WITH table_stats AS (
    SELECT 
        'account_balances' as table_type,
        sum(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        sum(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
        sum(n_tup_ins) as total_inserts,
        sum(n_dead_tup) as total_dead_tuples,
        sum(n_live_tup) as total_live_tuples
    FROM pg_tables t
    JOIN pg_stat_user_tables s ON t.tablename = s.relname AND t.schemaname = s.schemaname
    WHERE t.schemaname = 'public' 
        AND t.tablename LIKE 'account_balances%'
),
active_queries AS (
    SELECT count(*) as active_insert_queries
    FROM pg_stat_activity 
    WHERE state = 'active' 
        AND (query ILIKE '%INSERT%account_balances%' OR query ILIKE '%upsert%')
),
locks AS (
    SELECT count(*) as blocked_queries
    FROM pg_catalog.pg_locks 
    WHERE NOT granted
)
SELECT 
    'TABLE_SIZE' as metric,
    pg_size_pretty(total_size) as value,
    CASE 
        WHEN total_size > 10737418240 THEN 'LARGE TABLE - Consider partitioning if not already done'
        WHEN total_size > 1073741824 THEN 'MEDIUM TABLE - Monitor partition performance'
        ELSE 'NORMAL SIZE'
    END as recommendation
FROM table_stats
UNION ALL
SELECT 
    'INDEX_OVERHEAD' as metric,
    round(100.0 * index_size / total_size, 1)::text || '%' as value,
    CASE 
        WHEN index_size > total_size * 0.5 THEN 'HIGH INDEX OVERHEAD - Consider dropping unused indexes'
        WHEN index_size > total_size * 0.3 THEN 'MODERATE INDEX OVERHEAD - Review index usage'
        ELSE 'NORMAL INDEX OVERHEAD'
    END as recommendation
FROM table_stats
UNION ALL
SELECT 
    'DEAD_TUPLES' as metric,
    round(100.0 * total_dead_tuples / GREATEST(total_live_tuples + total_dead_tuples, 1), 1)::text || '%' as value,
    CASE 
        WHEN total_dead_tuples > total_live_tuples * 0.1 THEN 'HIGH DEAD TUPLE RATIO - Run VACUUM'
        WHEN total_dead_tuples > total_live_tuples * 0.05 THEN 'MODERATE DEAD TUPLE RATIO - Monitor vacuum'
        ELSE 'NORMAL DEAD TUPLE RATIO'
    END as recommendation
FROM table_stats
UNION ALL
SELECT 
    'ACTIVE_QUERIES' as metric,
    active_insert_queries::text as value,
    CASE 
        WHEN active_insert_queries > 5 THEN 'MANY CONCURRENT INSERTS - Consider reducing concurrency'
        WHEN active_insert_queries > 2 THEN 'MODERATE CONCURRENT INSERTS - Normal'
        ELSE 'LOW CONCURRENT INSERTS'
    END as recommendation
FROM active_queries
UNION ALL
SELECT 
    'BLOCKED_QUERIES' as metric,
    blocked_queries::text as value,
    CASE 
        WHEN blocked_queries > 0 THEN 'LOCK CONTENTION DETECTED - Investigate blocking queries'
        ELSE 'NO LOCK CONTENTION'
    END as recommendation
FROM locks;

\echo ''
\echo '=== NEXT STEPS ==='
\echo '1. Check the INDEX_OVERHEAD and DEAD_TUPLES metrics above'
\echo '2. If index overhead is high, consider dropping unused indexes temporarily'
\echo '3. If dead tuple ratio is high, run VACUUM on affected tables'
\echo '4. If you see lock contention, identify and resolve blocking queries'
\echo '5. Monitor partition performance if using partitioned tables'
\echo '6. Consider adjusting batch sizes or insertion concurrency'
\echo '' 

SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  (SELECT reltuples::bigint FROM pg_class WHERE relname = tablename) as estimated_rows
FROM pg_tables 
WHERE tablename LIKE 'account_balances%'
ORDER BY tablename;


select count(*), timestamp from account_balances 
group by timestamp order by timestamp


select * from  week


SELECT name, setting FROM pg_settings 
   WHERE name LIKE 'autovacuum%';


VACUUM account_balances;

select * from snapshot where status = 'failed'


