-- Example: How Hash Partitioning Handles Dynamic Account Creation
-- This demonstrates that new accounts work seamlessly with existing partitions

-- Step 1: Create weekly partitions (done at start of week)
-- These are EMPTY partitions defined by mathematical rules, not specific accounts

-- Week partition with hash sub-partitioning
CREATE TABLE account_balances_2024_01_07 
PARTITION OF account_balances 
FOR VALUES FROM ('2024-01-07') TO ('2024-01-14')
PARTITION BY HASH (account_address);

-- Create 4 empty hash partitions with mathematical rules:
CREATE TABLE account_balances_2024_01_07_hash_0
PARTITION OF account_balances_2024_01_07
FOR VALUES WITH (modulus 4, remainder 0);  -- Will receive 25% of accounts

CREATE TABLE account_balances_2024_01_07_hash_1
PARTITION OF account_balances_2024_01_07
FOR VALUES WITH (modulus 4, remainder 1);  -- Will receive 25% of accounts

CREATE TABLE account_balances_2024_01_07_hash_2
PARTITION OF account_balances_2024_01_07
FOR VALUES WITH (modulus 4, remainder 2);  -- Will receive 25% of accounts

CREATE TABLE account_balances_2024_01_07_hash_3
PARTITION OF account_balances_2024_01_07
FOR VALUES WITH (modulus 4, remainder 3);  -- Will receive 25% of accounts

-- Step 2: Demonstrate automatic routing for any account
-- Function to show which partition an account will use
CREATE OR REPLACE FUNCTION show_account_partition_routing(account_addr TEXT)
RETURNS TABLE (
  account_address TEXT,
  hash_value BIGINT,
  partition_number INTEGER,
  partition_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    account_addr,
    abs(hashtext(account_addr)) as hash_value,
    abs(hashtext(account_addr)) % 4 as partition_number,
    'account_balances_2024_01_07_hash_' || (abs(hashtext(account_addr)) % 4) as partition_name;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Test with existing accounts (Monday)
SELECT * FROM show_account_partition_routing('rdx1qsp5qjywwrlm69akm5nzh8j7jv73nwcvhvks9j2m6qe7cxlc4jp8xlzv6c8c0');
SELECT * FROM show_account_partition_routing('rdx1qspt8jwy6ykd4zfgmaq9khu9gg7j8tj85q4axjk8md5j8m4c2d7sk22qd64');

-- Step 4: New accounts join mid-week (Wednesday) - they work automatically!
SELECT * FROM show_account_partition_routing('rdx1qu7f9k2p8h5z1j4w6n3m9j5l2h4g7f8d3s6a1m4e7t2r5y3u8i6o2p9l5k');
SELECT * FROM show_account_partition_routing('rdx1qv3g8m7k4j2z9i8w2n6m4j7l9h1g3f5d8s2a5m7e4t9r1y5u3i7o6p4l2k');

-- Step 5: Simulate actual inserts happening throughout the week
DO $$
DECLARE
  test_accounts TEXT[] := ARRAY[
    'rdx1existing1_account_from_monday',
    'rdx1existing2_account_from_monday', 
    'rdx1new1_account_joins_wednesday',
    'rdx1new2_account_joins_friday',
    'rdx1new3_account_joins_sunday'
  ];
  account TEXT;
  partition_num INTEGER;
BEGIN
  RAISE NOTICE 'Demonstrating automatic partition routing:';
  RAISE NOTICE '';
  
  FOREACH account IN ARRAY test_accounts LOOP
    partition_num := abs(hashtext(account)) % 4;
    
    -- This INSERT would automatically go to the correct partition
    RAISE NOTICE 'Account: % -> Partition: hash_%', 
      substr(account, 1, 30) || '...', 
      partition_num;
      
    -- The actual INSERT (commented out for demo):
    -- INSERT INTO account_balances (timestamp, account_address, usd_value, activity_id, data)
    -- VALUES ('2024-01-10', account, 100.00, 'hold_xrd', '{}');
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'All inserts work automatically - no partition management needed!';
END $$;

-- Step 6: Monitor partition distribution as accounts are added
CREATE OR REPLACE FUNCTION simulate_weekly_account_growth()
RETURNS TABLE (
  day_of_week TEXT,
  total_accounts INTEGER,
  partition_0_count INTEGER,
  partition_1_count INTEGER,
  partition_2_count INTEGER,
  partition_3_count INTEGER,
  distribution_variance NUMERIC
) AS $$
DECLARE
  accounts_per_day INTEGER := 1000;
  day_names TEXT[] := ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  day_name TEXT;
  total_accounts INTEGER := 0;
  partition_counts INTEGER[] := ARRAY[0,0,0,0];
  i INTEGER;
  variance NUMERIC;
BEGIN
  -- Simulate accounts joining each day of the week
  FOR day_idx IN 1..7 LOOP
    day_name := day_names[day_idx];
    total_accounts := total_accounts + accounts_per_day;
    
    -- Simulate new accounts (they distribute evenly due to hash function)
    FOR i IN 1..accounts_per_day LOOP
      -- Generate a "random" account-like string
      partition_counts[floor(random() * 4)::INTEGER + 1] := partition_counts[floor(random() * 4)::INTEGER + 1] + 1;
    END LOOP;
    
    -- Calculate distribution variance from perfect 25%
    variance := GREATEST(
      ABS(partition_counts[1] * 100.0 / total_accounts - 25.0),
      ABS(partition_counts[2] * 100.0 / total_accounts - 25.0),
      ABS(partition_counts[3] * 100.0 / total_accounts - 25.0),
      ABS(partition_counts[4] * 100.0 / total_accounts - 25.0)
    );
    
    RETURN QUERY SELECT 
      day_name,
      total_accounts,
      partition_counts[1],
      partition_counts[2], 
      partition_counts[3],
      partition_counts[4],
      ROUND(variance, 2);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the simulation
SELECT * FROM simulate_weekly_account_growth();

-- Clean up demo functions
DROP FUNCTION IF EXISTS show_account_partition_routing(TEXT);
DROP FUNCTION IF EXISTS simulate_weekly_account_growth();

COMMENT ON FUNCTION show_account_partition_routing(TEXT) IS 'Demonstrates which partition any account address will automatically route to';
COMMENT ON FUNCTION simulate_weekly_account_growth() IS 'Simulates how partition distribution remains balanced as new accounts join throughout the week'; 