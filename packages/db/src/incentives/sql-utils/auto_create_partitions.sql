-- Function to automatically create missing weekly partitions for account_balances
-- This should be called before bulk inserts to ensure all necessary partitions exist

CREATE OR REPLACE FUNCTION ensure_account_balance_partitions(
  start_timestamp TIMESTAMPTZ,
  end_timestamp TIMESTAMPTZ
) RETURNS TABLE (
  week_key TEXT,
  week_start DATE,
  week_end DATE,
  action_taken TEXT
) AS $$
DECLARE
  week_record RECORD;
  week_key TEXT;
  partition_exists BOOLEAN;
  i INTEGER;
BEGIN
  -- Loop through all weeks in the timestamp range
  FOR week_record IN
    SELECT 
      date_trunc('week', generate_series(
        date_trunc('week', start_timestamp),
        date_trunc('week', end_timestamp),
        INTERVAL '1 week'
      )) as week_start
  LOOP
    week_key := to_char(week_record.week_start, 'YYYY_MM_DD');
    
    -- Check if partition already exists
    SELECT EXISTS(
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'account_balances_' || week_key
    ) INTO partition_exists;
    
    IF NOT partition_exists THEN
      -- Create weekly range partition
      EXECUTE format('
        CREATE TABLE account_balances_%s 
        PARTITION OF account_balances 
        FOR VALUES FROM (%L) TO (%L)
        PARTITION BY HASH (account_address)',
        week_key, 
        week_record.week_start, 
        week_record.week_start + INTERVAL '7 days'
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
          CREATE INDEX account_balances_%s_hash_%s_account_idx 
          ON account_balances_%s_hash_%s (account_address)',
          week_key, i, week_key, i
        );
        
        EXECUTE format('
          CREATE INDEX account_balances_%s_hash_%s_compound_idx 
          ON account_balances_%s_hash_%s (account_address, timestamp)',
          week_key, i, week_key, i
        );
      END LOOP;
      
      RETURN QUERY SELECT 
        week_key,
        week_record.week_start::date,
        (week_record.week_start + INTERVAL '7 days')::date,
        'CREATED'::TEXT;
    ELSE
      RETURN QUERY SELECT 
        week_key,
        week_record.week_start::date,
        (week_record.week_start + INTERVAL '7 days')::date,
        'EXISTS'::TEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create partitions for a specific week
CREATE OR REPLACE FUNCTION create_account_balance_partition_for_week(
  target_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
  week_start DATE;
  week_key TEXT;
  i INTEGER;
BEGIN
  -- Calculate week start (Sunday)
  week_start := date_trunc('week', target_date);
  week_key := to_char(week_start, 'YYYY_MM_DD');
  
  -- Check if partition already exists
  IF EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'account_balances_' || week_key) THEN
    RAISE NOTICE 'Partition for week % already exists', week_key;
    RETURN FALSE;
  END IF;
  
  -- Create weekly range partition
  EXECUTE format('
    CREATE TABLE account_balances_%s 
    PARTITION OF account_balances 
    FOR VALUES FROM (%L) TO (%L)
    PARTITION BY HASH (account_address)',
    week_key, week_start, week_start + INTERVAL '7 days'
  );
  
  -- Create 4 hash sub-partitions
  FOR i IN 0..3 LOOP
    EXECUTE format('
      CREATE TABLE account_balances_%s_hash_%s
      PARTITION OF account_balances_%s
      FOR VALUES WITH (modulus 4, remainder %s)',
      week_key, i, week_key, i
    );
    
    -- Create indexes
    EXECUTE format('
      CREATE INDEX account_balances_%s_hash_%s_timestamp_idx 
      ON account_balances_%s_hash_%s (timestamp)',
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
  END LOOP;
  
  RAISE NOTICE 'Created partition for week % with 4 hash sub-partitions', week_key;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create partitions for the next N weeks
CREATE OR REPLACE FUNCTION create_future_partitions(weeks_ahead INTEGER DEFAULT 4)
RETURNS VOID AS $$
DECLARE
  i INTEGER;
  target_date DATE;
BEGIN
  FOR i IN 0..weeks_ahead-1 LOOP
    target_date := CURRENT_DATE + (i * 7);
    PERFORM create_account_balance_partition_for_week(target_date);
  END LOOP;
  
  RAISE NOTICE 'Created partitions for the next % weeks', weeks_ahead;
END;
$$ LANGUAGE plpgsql;

-- Function to check missing partitions for existing data
CREATE OR REPLACE FUNCTION find_missing_partitions()
RETURNS TABLE (
  week_start DATE,
  week_key TEXT,
  row_count BIGINT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH data_weeks AS (
    SELECT DISTINCT
      date_trunc('week', timestamp)::date as week_start,
      to_char(date_trunc('week', timestamp), 'YYYY_MM_DD') as week_key,
      COUNT(*) as row_count
    FROM account_balances 
    GROUP BY 1, 2
  ),
  existing_partitions AS (
    SELECT 
      to_date(substring(tablename from 'account_balances_(\d{4}_\d{2}_\d{2})'), 'YYYY_MM_DD') as week_start,
      substring(tablename from 'account_balances_(\d{4}_\d{2}_\d{2})') as week_key
    FROM pg_tables 
    WHERE tablename ~ '^account_balances_\d{4}_\d{2}_\d{2}$'
  )
  SELECT 
    dw.week_start,
    dw.week_key,
    dw.row_count,
    CASE 
      WHEN ep.week_key IS NULL THEN 'MISSING_PARTITION'
      ELSE 'HAS_PARTITION'
    END as status
  FROM data_weeks dw
  LEFT JOIN existing_partitions ep ON dw.week_key = ep.week_key
  ORDER BY dw.week_start;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION ensure_account_balance_partitions(TIMESTAMPTZ, TIMESTAMPTZ) IS 'Creates missing weekly partitions for the specified timestamp range';
COMMENT ON FUNCTION create_account_balance_partition_for_week(DATE) IS 'Creates a partition for a specific week';
COMMENT ON FUNCTION create_future_partitions(INTEGER) IS 'Creates partitions for the next N weeks';
COMMENT ON FUNCTION find_missing_partitions() IS 'Identifies weeks that have data but no corresponding partition'; 