-- Migration to implement composite partitioning on account_balances table
-- Range partitioning by timestamp + Hash partitioning by account_address

-- Step 1: Backup existing data (if any)
CREATE TABLE IF NOT EXISTS account_balances_backup AS 
SELECT * FROM account_balances;

-- Step 2: Drop existing table and recreate with proper partitioning
DROP TABLE IF EXISTS account_balances CASCADE;

-- Step 3: Create new partitioned table with range partitioning by timestamp
CREATE TABLE account_balances (
  timestamp TIMESTAMPTZ NOT NULL,
  account_address VARCHAR(255) NOT NULL,
  usd_value DECIMAL(18,2) NOT NULL,
  activity_id TEXT NOT NULL,
  data JSONB NOT NULL,
  PRIMARY KEY (account_address, timestamp, activity_id)
) PARTITION BY RANGE (timestamp);

-- Step 4: Create foreign key constraints (these will be inherited by partitions)
-- Note: Foreign keys on partitioned tables require the partitioning key to be included
-- We'll add these constraints to individual partitions instead

-- Step 5: Example of creating partitions for the current week
-- This would normally be done by the partition manager automatically

-- Get current week start (Sunday)
DO $$
DECLARE
  week_start DATE;
  week_end DATE;
  week_key TEXT;
  i INTEGER;
BEGIN
  -- Calculate current week start (Sunday)
  week_start := date_trunc('week', CURRENT_DATE);
  week_end := week_start + INTERVAL '7 days';
  week_key := to_char(week_start, 'YYYY_MM_DD');
  
  -- Create weekly range partition
  EXECUTE format('
    CREATE TABLE account_balances_%s 
    PARTITION OF account_balances 
    FOR VALUES FROM (%L) TO (%L)
    PARTITION BY HASH (account_address)',
    week_key, week_start, week_end
  );
  
  -- Create 4 hash sub-partitions for account addresses
  FOR i IN 0..3 LOOP
    EXECUTE format('
      CREATE TABLE account_balances_%s_hash_%s
      PARTITION OF account_balances_%s
      FOR VALUES WITH (modulus 4, remainder %s)',
      week_key, i, week_key, i
    );
    
    -- Create indexes on each hash partition
    EXECUTE format('
      CREATE INDEX account_balances_%s_hash_%s_timestamp_idx 
      ON account_balances_%s_hash_%s (timestamp)',
      week_key, i, week_key, i
    );
    
    EXECUTE format('
      CREATE INDEX account_balances_%s_hash_%s_activity_idx 
      ON account_balances_%s_hash_%s (activity_id)',
      week_key, i, week_key, i
    );
    
    EXECUTE format('
      CREATE INDEX account_balances_%s_hash_%s_account_idx 
      ON account_balances_%s_hash_%s (account_address)',
      week_key, i, week_key, i
    );
    
    EXECUTE format('
      CREATE INDEX account_balances_%s_hash_%s_compound_idx 
      ON account_balances_%s_hash_%s (account_address, timestamp)',
      week_key, i, week_key, i
    );
    
    EXECUTE format('
      CREATE INDEX account_balances_%s_hash_%s_activity_account_idx 
      ON account_balances_%s_hash_%s (activity_id, account_address)',
      week_key, i, week_key, i
    );
  END LOOP;
  
  RAISE NOTICE 'Created partitioned table with week % and 4 hash partitions', week_key;
END $$;

-- Step 6: Restore data from backup (if any exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_balances_backup') THEN
    INSERT INTO account_balances 
    SELECT * FROM account_balances_backup;
    
    -- Drop backup table after successful restoration
    DROP TABLE account_balances_backup;
    
    RAISE NOTICE 'Data restored from backup and backup table dropped';
  ELSE
    RAISE NOTICE 'No backup data found to restore';
  END IF;
END $$;

-- Step 7: Create function to help with partition management
CREATE OR REPLACE FUNCTION get_account_balance_partition_info()
RETURNS TABLE (
  partition_name TEXT,
  partition_size TEXT,
  row_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename))::TEXT,
    COALESCE(s.n_tup_ins - s.n_tup_del, 0)::BIGINT
  FROM pg_tables t
  LEFT JOIN pg_stat_user_tables s ON s.relname = t.tablename
  WHERE t.tablename LIKE 'account_balances_%'
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create function to show partition pruning in action
CREATE OR REPLACE FUNCTION explain_account_balance_query(
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  target_account VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE (query_plan TEXT) AS $$
DECLARE
  query_text TEXT;
BEGIN
  IF target_account IS NOT NULL THEN
    query_text := format('
      EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
      SELECT * FROM account_balances 
      WHERE timestamp >= %L AND timestamp < %L 
      AND account_address = %L',
      start_time, end_time, target_account
    );
  ELSE
    query_text := format('
      EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
      SELECT * FROM account_balances 
      WHERE timestamp >= %L AND timestamp < %L',
      start_time, end_time
    );
  END IF;
  
  RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE account_balances IS 'Account balances with composite partitioning: Range by timestamp (weekly) + Hash by account_address (4 partitions per week)';
COMMENT ON FUNCTION get_account_balance_partition_info() IS 'Returns information about all account_balances partitions including size and row count';
COMMENT ON FUNCTION explain_account_balance_query(TIMESTAMPTZ, TIMESTAMPTZ, VARCHAR) IS 'Shows query execution plan to verify partition pruning is working correctly'; 