-- Buffer Cache Monitoring Queries
-- Use these to diagnose buffer cache hit ratio issues during bulk insertions

-- =======================
-- BUFFER CACHE HIT RATIO
-- =======================

-- Overall buffer cache hit ratio (should be > 95% for good performance)
SELECT 
  round(
    (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2
  ) AS buffer_hit_ratio_percent
FROM pg_statio_user_tables;

-- Buffer cache hit ratio by table (focus on account_balances partitions)
SELECT 
  schemaname,
  relname,
  heap_blks_read,
  heap_blks_hit,
  round(
    (heap_blks_hit::float / NULLIF(heap_blks_hit + heap_blks_read, 0)) * 100, 2
  ) AS hit_ratio_percent
FROM pg_statio_user_tables
WHERE relname LIKE 'account_balances%'
ORDER BY heap_blks_read DESC;

-- =======================
-- CURRENT BUFFER USAGE
-- =======================

-- Show what's currently in shared buffers
SELECT 
  c.relname,
  count(*) AS buffer_count,
  round(count(*) * 8192 / 1024.0 / 1024.0, 2) AS buffer_mb
FROM pg_buffercache b
  INNER JOIN pg_class c ON b.relfilenode = pg_relation_filenode(c.oid)
  AND b.reldatabase IN (0, (SELECT oid FROM pg_database WHERE datname = current_database()))
WHERE c.relname LIKE 'account_balances%'
GROUP BY c.relname
ORDER BY buffer_count DESC;

-- Buffer cache summary
SELECT 
  round(
    (SELECT count(*) FROM pg_buffercache WHERE relfilenode IS NOT NULL) * 8192 / 1024.0 / 1024.0, 2
  ) AS used_buffers_mb,
  round(
    (SELECT count(*) FROM pg_buffercache WHERE relfilenode IS NULL) * 8192 / 1024.0 / 1024.0, 2
  ) AS free_buffers_mb,
  round(
    (SELECT count(*) FROM pg_buffercache) * 8192 / 1024.0 / 1024.0, 2
  ) AS total_buffers_mb;

-- =======================
-- INSERTION PERFORMANCE
-- =======================

-- Monitor current insertion activity
SELECT 
  pid,
  usename,
  application_name,
  state,
  query_start,
  query,
  wait_event_type,
  wait_event
FROM pg_stat_activity
WHERE query ILIKE '%INSERT INTO account_balances%'
   OR query ILIKE '%COPY account_balances%';

-- Recent insertion statistics
SELECT 
  schemaname,
  relname,
  n_tup_ins AS rows_inserted,
  n_tup_upd AS rows_updated,
  n_tup_del AS rows_deleted,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  last_autovacuum,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE relname LIKE 'account_balances%'
ORDER BY n_tup_ins DESC;

-- =======================
-- INDEX USAGE
-- =======================

-- Index usage during insertions
SELECT 
  schemaname,
  relname,
  indexrelname,
  idx_tup_read,
  idx_tup_fetch,
  idx_blks_read,
  idx_blks_hit,
  round(
    (idx_blks_hit::float / NULLIF(idx_blks_hit + idx_blks_read, 0)) * 100, 2
  ) AS index_hit_ratio_percent
FROM pg_stat_user_indexes 
WHERE relname LIKE 'account_balances%'
ORDER BY idx_blks_read DESC;

-- =======================
-- CHECKPOINT AND WAL
-- =======================

-- WAL and checkpoint activity (high insertion workloads)
SELECT 
  checkpoints_timed,
  checkpoints_req,
  checkpoint_write_time,
  checkpoint_sync_time,
  buffers_checkpoint,
  buffers_clean,
  buffers_backend,
  buffers_backend_fsync,
  buffers_alloc
FROM pg_stat_bgwriter;

-- Current WAL activity
SELECT 
  pg_current_wal_lsn(),
  pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') / 1024 / 1024 AS wal_mb,
  pg_walfile_name(pg_current_wal_lsn()) AS current_wal_file;

-- =======================
-- TABLE SIZES
-- =======================

-- Partition sizes (to understand memory pressure)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables 
WHERE tablename LIKE 'account_balances%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =======================
-- RECOMMENDATIONS
-- =======================

-- Current PostgreSQL memory settings
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
  'wal_buffers',
  'checkpoint_completion_target',
  'max_wal_size'
)
ORDER BY name; 