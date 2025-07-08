-- Consolidate Old Hash Partitions Script
-- Removes hash partitioning for weeks older than 3 months while preserving data
-- This optimizes storage and simplifies maintenance for historical data

-- Function to consolidate a single week's hash partitions into one range partition
CREATE OR REPLACE FUNCTION consolidate_week_hash_partitions(
  week_key TEXT,
  week_start DATE,
  week_end DATE
) RETURNS BOOLEAN AS $$
DECLARE
  main_partition_name TEXT;
  consolidated_table_name TEXT;
  hash_partition_count INTEGER;
  total_rows_migrated BIGINT := 0;
  hash_partition TEXT;
  row_count BIGINT;
BEGIN
  main_partition_name := 'account_balances_' || week_key;
  consolidated_table_name := main_partition_name || '_consolidated';
  
  RAISE NOTICE 'Starting consolidation for week % (% to %)', week_key, week_start, week_end;
  
  -- Check if this week has hash partitions
  SELECT COUNT(*) INTO hash_partition_count
  FROM pg_tables 
  WHERE tablename LIKE main_partition_name || '_hash_%';
  
  IF hash_partition_count = 0 THEN
    RAISE NOTICE 'Week % has no hash partitions to consolidate', week_key;
    RETURN FALSE;
  END IF;
  
  RAISE NOTICE 'Found % hash partitions for week %', hash_partition_count, week_key;
  
  -- Step 1: Detach the main weekly partition (with all its hash sub-partitions)
  BEGIN
    EXECUTE format('ALTER TABLE account_balances DETACH PARTITION %I', main_partition_name);
    RAISE NOTICE 'Detached partition %', main_partition_name;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to detach partition %: %', main_partition_name, SQLERRM;
    RETURN FALSE;
  END;
  
  -- Step 2: Create consolidated table with same structure
  EXECUTE format('
    CREATE TABLE %I (
      timestamp TIMESTAMPTZ NOT NULL,
      account_address VARCHAR(255) NOT NULL,
      data JSONB NOT NULL,
      PRIMARY KEY (account_address, timestamp)
    )', consolidated_table_name);
  
  RAISE NOTICE 'Created consolidated table %', consolidated_table_name;
  
  -- Step 3: Copy data from all hash partitions to consolidated table
  FOR hash_partition IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE tablename LIKE main_partition_name || '_hash_%'
    ORDER BY tablename
  LOOP
    -- Get row count for progress tracking
    EXECUTE format('SELECT COUNT(*) FROM %I', hash_partition) INTO row_count;
    
    -- Copy data
    EXECUTE format('
      INSERT INTO %I 
      SELECT * FROM %I
    ', consolidated_table_name, hash_partition);
    
    total_rows_migrated := total_rows_migrated + row_count;
    RAISE NOTICE 'Migrated % rows from % (total: %)', row_count, hash_partition, total_rows_migrated;
  END LOOP;
  
  -- Step 4: Create indexes on consolidated table
  EXECUTE format('CREATE INDEX %I_timestamp_idx ON %I (timestamp)', 
    consolidated_table_name, consolidated_table_name);
  EXECUTE format('CREATE INDEX %I_account_idx ON %I (account_address)', 
    consolidated_table_name, consolidated_table_name);
  EXECUTE format('CREATE INDEX %I_compound_idx ON %I (account_address, timestamp)', 
    consolidated_table_name, consolidated_table_name);
  
  RAISE NOTICE 'Created indexes on consolidated table';
  
  -- Step 5: Attach consolidated table as range partition
  EXECUTE format('
    ALTER TABLE account_balances 
    ATTACH PARTITION %I 
    FOR VALUES FROM (%L) TO (%L)',
    consolidated_table_name, week_start, week_end);
  
  RAISE NOTICE 'Attached consolidated partition for week %', week_key;
  
  -- Step 6: Drop old hash-partitioned structure
  EXECUTE format('DROP TABLE %I CASCADE', main_partition_name);
  RAISE NOTICE 'Dropped old hash-partitioned table %', main_partition_name;
  
  -- Step 7: Analyze new partition
  EXECUTE format('ANALYZE %I', consolidated_table_name);
  
  RAISE NOTICE 'Successfully consolidated week % - migrated % total rows', week_key, total_rows_migrated;
  RETURN TRUE;
  
EXCEPTION WHEN OTHERS THEN
  RAISE ERROR 'Consolidation failed for week %: %', week_key, SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to identify and consolidate all weeks older than specified months
CREATE OR REPLACE FUNCTION consolidate_old_hash_partitions(
  months_threshold INTEGER DEFAULT 3,
  dry_run BOOLEAN DEFAULT TRUE
) RETURNS TABLE (
  week_key TEXT,
  week_start DATE,
  week_end DATE,
  action_taken TEXT,
  rows_migrated BIGINT
) AS $$
DECLARE
  cutoff_date DATE;
  week_record RECORD;
  consolidation_result BOOLEAN;
  total_weeks_processed INTEGER := 0;
  total_weeks_consolidated INTEGER := 0;
BEGIN
  -- Calculate cutoff date (3 months ago)
  cutoff_date := CURRENT_DATE - (months_threshold || ' months')::INTERVAL;
  
  RAISE NOTICE 'Looking for hash-partitioned weeks older than % (cutoff: %)', 
    months_threshold || ' months', cutoff_date;
  
  IF dry_run THEN
    RAISE NOTICE 'DRY RUN MODE - No actual changes will be made';
  END IF;
  
  -- Find all hash-partitioned weeks older than cutoff
  FOR week_record IN
    WITH weekly_partitions AS (
      SELECT 
        tablename,
        -- Extract date from partition name (account_balances_YYYY_MM_DD)
        to_date(substring(tablename from 'account_balances_(\d{4}_\d{2}_\d{2})'), 'YYYY_MM_DD') as partition_date,
        substring(tablename from 'account_balances_(\d{4}_\d{2}_\d{2})') as week_key
      FROM pg_tables 
      WHERE tablename ~ '^account_balances_\d{4}_\d{2}_\d{2}$'
      AND EXISTS (
        SELECT 1 FROM pg_tables t2 
        WHERE t2.tablename LIKE tablename || '_hash_%'
      )
    )
    SELECT 
      week_key,
      partition_date,
      partition_date + INTERVAL '7 days' as week_end_date
    FROM weekly_partitions
    WHERE partition_date < cutoff_date
    ORDER BY partition_date
  LOOP
    total_weeks_processed := total_weeks_processed + 1;
    
    IF dry_run THEN
      RETURN QUERY SELECT 
        week_record.week_key,
        week_record.partition_date,
        week_record.week_end_date,
        'WOULD_CONSOLIDATE'::TEXT,
        0::BIGINT;
    ELSE
      -- Perform actual consolidation
      SELECT consolidate_week_hash_partitions(
        week_record.week_key,
        week_record.partition_date,
        week_record.week_end_date
      ) INTO consolidation_result;
      
      IF consolidation_result THEN
        total_weeks_consolidated := total_weeks_consolidated + 1;
        
        -- Get row count from consolidated partition
        DECLARE
          consolidated_table TEXT := 'account_balances_' || week_record.week_key || '_consolidated';
          row_count BIGINT;
        BEGIN
          EXECUTE format('SELECT COUNT(*) FROM %I', consolidated_table) INTO row_count;
          
          RETURN QUERY SELECT 
            week_record.week_key,
            week_record.partition_date,
            week_record.week_end_date,
            'CONSOLIDATED'::TEXT,
            row_count;
        END;
      ELSE
        RETURN QUERY SELECT 
          week_record.week_key,
          week_record.partition_date,
          week_record.week_end_date,
          'FAILED'::TEXT,
          0::BIGINT;
      END IF;
    END IF;
  END LOOP;
  
  IF dry_run THEN
    RAISE NOTICE 'DRY RUN COMPLETE: Found % weeks that would be consolidated', total_weeks_processed;
  ELSE
    RAISE NOTICE 'CONSOLIDATION COMPLETE: Processed % weeks, consolidated % successfully', 
      total_weeks_processed, total_weeks_consolidated;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check current partition status
CREATE OR REPLACE FUNCTION get_partition_consolidation_status()
RETURNS TABLE (
  week_key TEXT,
  week_start DATE,
  partition_type TEXT,
  partition_count INTEGER,
  total_size TEXT,
  row_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH partition_analysis AS (
    SELECT 
      -- Extract week key from partition name
      CASE 
        WHEN tablename ~ '_hash_\d+$' THEN 
          substring(tablename from '^account_balances_(\d{4}_\d{2}_\d{2})_hash_')
        WHEN tablename ~ '_consolidated$' THEN
          substring(tablename from '^account_balances_(\d{4}_\d{2}_\d{2})_consolidated')
        WHEN tablename ~ '^account_balances_\d{4}_\d{2}_\d{2}$' THEN
          substring(tablename from '^account_balances_(\d{4}_\d{2}_\d{2})')
        ELSE NULL
      END as week_key,
      
      CASE 
        WHEN tablename ~ '_hash_\d+$' THEN 'HASH_PARTITIONED'
        WHEN tablename ~ '_consolidated$' THEN 'CONSOLIDATED'
        WHEN tablename ~ '^account_balances_\d{4}_\d{2}_\d{2}$' THEN 'SIMPLE_RANGE'
        ELSE 'UNKNOWN'
      END as partition_type,
      
      tablename,
      pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
      COALESCE(s.n_tup_ins - s.n_tup_del, 0) as estimated_rows
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.relname = t.tablename
    WHERE tablename LIKE 'account_balances_%'
    AND tablename NOT LIKE 'account_balances_backup%'
  )
  SELECT 
    pa.week_key,
    to_date(pa.week_key, 'YYYY_MM_DD'),
    pa.partition_type,
    COUNT(*)::INTEGER,
    pg_size_pretty(SUM(pa.size_bytes)),
    SUM(pa.estimated_rows)
  FROM partition_analysis pa
  WHERE pa.week_key IS NOT NULL
  GROUP BY pa.week_key, pa.partition_type
  ORDER BY to_date(pa.week_key, 'YYYY_MM_DD') DESC;
END;
$$ LANGUAGE plpgsql;

-- Utility function to estimate space savings from consolidation
CREATE OR REPLACE FUNCTION estimate_consolidation_savings(months_threshold INTEGER DEFAULT 3)
RETURNS TABLE (
  weeks_to_consolidate INTEGER,
  current_partitions INTEGER,
  future_partitions INTEGER,
  current_total_size TEXT,
  estimated_space_savings TEXT
) AS $$
DECLARE
  cutoff_date DATE;
  current_partition_count INTEGER;
  future_partition_count INTEGER;
  total_size_bytes BIGINT;
  weeks_count INTEGER;
BEGIN
  cutoff_date := CURRENT_DATE - (months_threshold || ' months')::INTERVAL;
  
  -- Count current hash partitions for old weeks
  SELECT COUNT(*) INTO current_partition_count
  FROM pg_tables 
  WHERE tablename ~ '^account_balances_\d{4}_\d{2}_\d{2}_hash_\d+$'
  AND to_date(substring(tablename from 'account_balances_(\d{4}_\d{2}_\d{2})'), 'YYYY_MM_DD') < cutoff_date;
  
  -- Count weeks to consolidate
  SELECT COUNT(DISTINCT substring(tablename from 'account_balances_(\d{4}_\d{2}_\d{2})')) INTO weeks_count
  FROM pg_tables 
  WHERE tablename ~ '^account_balances_\d{4}_\d{2}_\d{2}_hash_\d+$'
  AND to_date(substring(tablename from 'account_balances_(\d{4}_\d{2}_\d{2})'), 'YYYY_MM_DD') < cutoff_date;
  
  future_partition_count := weeks_count; -- One consolidated partition per week
  
  -- Calculate total size of partitions to be consolidated
  SELECT COALESCE(SUM(pg_total_relation_size(schemaname||'.'||tablename)), 0) INTO total_size_bytes
  FROM pg_tables 
  WHERE tablename ~ '^account_balances_\d{4}_\d{2}_\d{2}_hash_\d+$'
  AND to_date(substring(tablename from 'account_balances_(\d{4}_\d{2}_\d{2})'), 'YYYY_MM_DD') < cutoff_date;
  
  RETURN QUERY SELECT 
    weeks_count,
    current_partition_count,
    future_partition_count,
    pg_size_pretty(total_size_bytes),
    pg_size_pretty(total_size_bytes * 0.15); -- Estimated 15% space savings from consolidation
END;
$$ LANGUAGE plpgsql;

-- Example usage and testing
DO $$
BEGIN
  RAISE NOTICE '=== PARTITION CONSOLIDATION ANALYSIS ===';
  RAISE NOTICE '';
  
  -- Show current status
  RAISE NOTICE 'Current partition status:';
  PERFORM * FROM get_partition_consolidation_status();
  
  RAISE NOTICE '';
  
  -- Show what would be consolidated (dry run)
  RAISE NOTICE 'Dry run - weeks that would be consolidated:';
  PERFORM * FROM consolidate_old_hash_partitions(3, true);
  
  RAISE NOTICE '';
  
  -- Show estimated savings
  RAISE NOTICE 'Estimated consolidation savings:';
  PERFORM * FROM estimate_consolidation_savings(3);
END $$;

COMMENT ON FUNCTION consolidate_week_hash_partitions(TEXT, DATE, DATE) IS 'Consolidates hash partitions for a single week into one range partition';
COMMENT ON FUNCTION consolidate_old_hash_partitions(INTEGER, BOOLEAN) IS 'Identifies and consolidates all hash partitions older than specified months';
COMMENT ON FUNCTION get_partition_consolidation_status() IS 'Shows current status of all partitions (hash vs consolidated)';
COMMENT ON FUNCTION estimate_consolidation_savings(INTEGER) IS 'Estimates space and management savings from consolidating old partitions'; 


-- PostgreSQL Configuration Tuning for High-Volume Insertions
-- Optimize for buffer cache hit ratio during bulk insertions

-- =======================
-- MEMORY CONFIGURATION
-- =======================

-- Increase shared_buffers (recommended: 25-40% of RAM for dedicated DB server)
-- For your high-volume workload, consider:
-- shared_buffers = '8GB'  # For 32GB RAM system
-- shared_buffers = '16GB' # For 64GB RAM system

-- Increase work_mem for large sorts/joins during insertion
-- work_mem = '256MB'

-- Increase maintenance_work_mem for index operations
-- maintenance_work_mem = '2GB'

-- Increase effective_cache_size (should be ~75% of total RAM)
-- effective_cache_size = '24GB'  # For 32GB system
-- effective_cache_size = '48GB'  # For 64GB system

-- =======================
-- WAL CONFIGURATION
-- =======================

-- Increase WAL buffers for heavy write workloads
-- wal_buffers = '64MB'

-- Increase checkpoint segments to reduce checkpoint frequency
-- max_wal_size = '4GB'
-- min_wal_size = '1GB'

-- Reduce checkpoint completion target for smoother I/O
-- checkpoint_completion_target = 0.9

-- =======================
-- BULK INSERT OPTIMIZATION
-- =======================

-- Increase synchronous_commit for better performance (if durability allows)
-- synchronous_commit = off  # Only if you can afford some data loss

-- Increase max_locks_per_transaction for large bulk operations
-- max_locks_per_transaction = 256

-- =======================
-- BACKGROUND PROCESSES
-- =======================

-- Reduce autovacuum impact during heavy insertions
-- autovacuum_max_workers = 2
-- autovacuum_naptime = '10min'

-- Increase background writer efficiency
-- bgwriter_delay = '10ms'
-- bgwriter_lru_maxpages = 1000 