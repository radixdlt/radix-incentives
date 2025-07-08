-- ===================================================================
-- Index Management for Bulk Insertions
-- Use this script to temporarily drop/recreate indexes for better insert performance
-- ===================================================================

\echo '=== INDEX MANAGEMENT FOR BULK INSERTIONS ==='
\echo 'WARNING: Only run this during maintenance windows or when you can afford downtime'
\echo ''

-- Step 1: Identify potentially unused indexes
\echo '1. POTENTIALLY UNUSED INDEXES (candidates for temporary removal):'
SELECT 
    'DROP INDEX CONCURRENTLY ' || indexname || ';' as drop_command,
    'CREATE INDEX CONCURRENTLY ' || indexname || ' ON ' || tablename || ' USING ' || 
    CASE 
        WHEN indexdef LIKE '%USING btree%' THEN 'btree'
        WHEN indexdef LIKE '%USING hash%' THEN 'hash'
        WHEN indexdef LIKE '%USING gin%' THEN 'gin'
        WHEN indexdef LIKE '%USING gist%' THEN 'gist'
        ELSE 'btree'
    END || ' (' || 
    substring(indexdef from '\((.*)\)') || ');' as recreate_command,
    ui.indexname,
    ui.tablename,
    ui.idx_scan as times_used,
    pg_size_pretty(pg_relation_size(ui.indexrelid)) as index_size,
    pg_relation_size(ui.indexrelid) as size_bytes
FROM pg_stat_user_indexes ui
JOIN pg_indexes pi ON ui.indexname = pi.indexname AND ui.tablename = pi.tablename
WHERE ui.tablename LIKE 'account_balances%'
    AND ui.idx_scan < 100  -- Adjust threshold as needed
    AND ui.indexname NOT LIKE '%_pkey'  -- Don't drop primary keys
    AND ui.indexname NOT LIKE '%_pk'    -- Don't drop primary keys
ORDER BY pg_relation_size(ui.indexrelid) DESC;

\echo ''

-- Step 2: Show all indexes with their definitions for manual review
\echo '2. ALL INDEXES ON ACCOUNT_BALANCES TABLES:'
SELECT 
    pi.indexname,
    pi.tablename,
    pi.indexdef,
    ui.idx_scan as times_used,
    pg_size_pretty(pg_relation_size(ui.indexrelid)) as index_size
FROM pg_indexes pi
JOIN pg_stat_user_indexes ui ON pi.indexname = ui.indexname AND pi.tablename = ui.tablename
WHERE pi.tablename LIKE 'account_balances%'
    AND pi.schemaname = 'public'
ORDER BY pg_relation_size(ui.indexrelid) DESC;

\echo ''

-- Step 3: Check which indexes are actually being used during queries
\echo '3. MOST USED INDEXES (keep these):'
SELECT 
    ui.indexname,
    ui.tablename,
    ui.idx_scan as times_used,
    ui.idx_tup_read,
    ui.idx_tup_fetch,
    pg_size_pretty(pg_relation_size(ui.indexrelid)) as index_size
FROM pg_stat_user_indexes ui
WHERE ui.tablename LIKE 'account_balances%'
    AND ui.idx_scan > 1000  -- Frequently used indexes
ORDER BY ui.idx_scan DESC;

\echo ''

-- Step 4: Specific recommendations for account_balances table
\echo '4. SPECIFIC RECOMMENDATIONS:'

-- Check if there are composite indexes that might be redundant
WITH index_columns AS (
    SELECT 
        i.indexname,
        i.tablename,
        array_agg(a.attname ORDER BY a.attnum) as columns,
        array_length(array_agg(a.attname ORDER BY a.attnum), 1) as num_columns
    FROM pg_index ix
    JOIN pg_class c ON ix.indexrelid = c.oid
    JOIN pg_indexes i ON c.relname = i.indexname
    JOIN pg_attribute a ON ix.indexrelid = a.attrelid
    WHERE i.tablename LIKE 'account_balances%'
        AND a.attnum > 0
        AND NOT a.attisdropped
    GROUP BY i.indexname, i.tablename
)
SELECT 
    'Potential redundant indexes:' as analysis,
    ic1.indexname as index1,
    ic2.indexname as index2,
    ic1.columns as columns1,
    ic2.columns as columns2
FROM index_columns ic1
JOIN index_columns ic2 ON ic1.tablename = ic2.tablename 
    AND ic1.indexname < ic2.indexname
    AND ic1.columns[1:1] = ic2.columns[1:1]  -- Same first column
WHERE ic1.num_columns != ic2.num_columns;

\echo ''

-- Step 5: Generate scripts for safe index management
\echo '5. SAFE INDEX MANAGEMENT SCRIPTS:'

-- Generate backup commands
\echo 'A. BACKUP INDEX DEFINITIONS:'
SELECT 
    'COPY (SELECT ''' || indexdef || ''') TO ''/tmp/restore_' || indexname || '.sql'';' as backup_command
FROM pg_indexes 
WHERE tablename LIKE 'account_balances%'
    AND schemaname = 'public'
    AND indexname NOT LIKE '%_pkey';

\echo ''

-- Generate drop commands for unused indexes
\echo 'B. DROP UNUSED INDEXES (run during maintenance window):'
SELECT 
    'DROP INDEX CONCURRENTLY IF EXISTS ' || ui.indexname || ';' as drop_command
FROM pg_stat_user_indexes ui
WHERE ui.tablename LIKE 'account_balances%'
    AND ui.idx_scan < 10  -- Very rarely used
    AND ui.indexname NOT LIKE '%_pkey'
    AND ui.indexname NOT LIKE '%_pk'
ORDER BY pg_relation_size(ui.indexrelid) DESC;

\echo ''

-- Generate recreate commands
\echo 'C. RECREATE INDEXES (run after bulk insert):'
SELECT 
    'CREATE INDEX CONCURRENTLY ' || replace(indexname, '_old', '') || ' ON ' || tablename || ' USING btree (' || 
    substring(indexdef from '\((.*)\)') || ');' as recreate_command
FROM pg_indexes 
WHERE tablename LIKE 'account_balances%'
    AND schemaname = 'public'
    AND indexname NOT LIKE '%_pkey';

\echo ''
\echo '=== STEP-BY-STEP PROCESS FOR BULK INSERTION ==='
\echo '1. BEFORE bulk insertion:'
\echo '   - Run the backup commands above'
\echo '   - Drop unused indexes using DROP INDEX CONCURRENTLY'
\echo '   - Consider dropping frequently-used non-essential indexes if insertion is very slow'
\echo ''
\echo '2. DURING bulk insertion:'
\echo '   - Monitor using the diagnostic script'
\echo '   - Adjust batch sizes if needed'
\echo '   - Consider temporarily disabling synchronous_commit if acceptable'
\echo ''
\echo '3. AFTER bulk insertion:'
\echo '   - Recreate dropped indexes using CREATE INDEX CONCURRENTLY'
\echo '   - Run ANALYZE on the table'
\echo '   - Monitor query performance to ensure indexes are working'
\echo ''
\echo '=== EMERGENCY PERFORMANCE BOOST ==='
\echo 'If insertions are extremely slow, consider this aggressive approach:'
\echo '1. SET synchronous_commit = off; (for current session only)'
\echo '2. Increase work_mem for the session: SET work_mem = ''256MB'';'
\echo '3. Drop ALL non-essential indexes temporarily'
\echo '4. Perform bulk insert with larger batch sizes'
\echo '5. Recreate indexes after insertion'
\echo '6. Reset synchronous_commit = on;'
\echo ''
\echo 'WARNING: synchronous_commit = off means potential data loss on crash!'
\echo '' 