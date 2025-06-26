-- Test script to verify hash distribution for Radix account addresses
-- This demonstrates that UUID-like addresses distribute evenly across hash partitions

-- Function to generate sample Radix-like addresses for testing
CREATE OR REPLACE FUNCTION generate_sample_radix_addresses(count INTEGER)
RETURNS TABLE (address TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 'rdx1' || encode(gen_random_bytes(32), 'hex') AS address
  FROM generate_series(1, count);
END;
$$ LANGUAGE plpgsql;

-- Test hash distribution with sample addresses
WITH sample_addresses AS (
  SELECT generate_sample_radix_addresses.address
  FROM generate_sample_radix_addresses(10000)
),
hash_distribution AS (
  SELECT 
    address,
    -- This is the same hash function PostgreSQL uses for partitioning
    abs(hashtext(address)) % 4 as partition_id
  FROM sample_addresses
)
SELECT 
  partition_id,
  COUNT(*) as record_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage,
  -- Calculate variance from perfect 25%
  ROUND(ABS(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() - 25.0), 2) as variance_from_ideal
FROM hash_distribution
GROUP BY partition_id
ORDER BY partition_id;

-- Test with real account address patterns (if you have them)
-- Replace with actual account addresses from your system
DO $$
DECLARE
  test_addresses TEXT[] := ARRAY[
    'rdx1qsp5qjywwrlm69akm5nzh8j7jv73nwcvhvks9j2m6qe7cxlc4jp8xlzv6c8c0',
    'rdx1qspt8jwy6ykd4zfgmaq9khu9gg7j8tj85q4axjk8md5j8m4c2d7sk22qd64',
    'rdx1qs8c8p6cg0z2h4wn2kn2k4j8h6g4f2d0s8a6m4e2t8r6y4u2i8o0p6l4k2',
    'rdx1qt9d7p5j3g1z6i5w8k4n7j9l5h3g6f8d2s4a7m9e5t3r7y6u9i2o4p8l6k',
    'rdx1qu2f5k8p4h7z3j6w9n5m2j8l4h7g5f3d6s9a4m2e8t5r3y7u6i4o9p2l8k'
  ];
  addr TEXT;
  partition_counts INTEGER[] := ARRAY[0,0,0,0];
BEGIN
  RAISE NOTICE 'Testing hash distribution for sample Radix addresses:';
  
  FOREACH addr IN ARRAY test_addresses LOOP
    partition_counts[abs(hashtext(addr)) % 4 + 1] := partition_counts[abs(hashtext(addr)) % 4 + 1] + 1;
    RAISE NOTICE 'Address: % -> Partition: %', 
      substr(addr, 1, 20) || '...', 
      abs(hashtext(addr)) % 4;
  END LOOP;
  
  FOR i IN 1..4 LOOP
    RAISE NOTICE 'Partition %: % addresses', i-1, partition_counts[i];
  END LOOP;
END $$;

-- Function to monitor actual partition distribution in production
CREATE OR REPLACE FUNCTION check_partition_distribution()
RETURNS TABLE (
  partition_name TEXT,
  record_count BIGINT,
  percentage NUMERIC,
  size_pretty TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH partition_stats AS (
    SELECT 
      t.tablename,
      COALESCE(s.n_tup_ins - s.n_tup_del, 0) as row_count,
      pg_total_relation_size(t.schemaname||'.'||t.tablename) as size_bytes
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.relname = t.tablename
    WHERE t.tablename LIKE 'account_balances_%_hash_%'
  )
  SELECT 
    ps.tablename::TEXT,
    ps.row_count,
    ROUND(ps.row_count * 100.0 / NULLIF(SUM(ps.row_count) OVER(), 0), 2),
    pg_size_pretty(ps.size_bytes)::TEXT
  FROM partition_stats ps
  WHERE ps.row_count > 0
  ORDER BY ps.tablename;
END;
$$ LANGUAGE plpgsql;

-- Example usage for monitoring:
-- SELECT * FROM check_partition_distribution();

COMMENT ON FUNCTION generate_sample_radix_addresses(INTEGER) IS 'Generates sample Radix-like addresses for hash distribution testing';
COMMENT ON FUNCTION check_partition_distribution() IS 'Monitors actual partition distribution in production account_balances table'; 