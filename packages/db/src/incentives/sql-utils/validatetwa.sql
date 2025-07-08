
WITH expanded_activities AS (
                -- Expand jsonb array into individual activity rows
                SELECT 
                  ab.timestamp,
                  ab.account_address,
                  activity_item->>'activityId' AS activity_id,
                  (activity_item->>'usdValue')::decimal AS usd_value
                FROM account_balances ab
                CROSS JOIN jsonb_array_elements(ab.data) AS activity_item
                WHERE ab.timestamp >= '2025-06-23 00:00:00+00'
                  AND ab.timestamp <= '2025-06-29 23:59:59+00'
                  AND ab.account_address = ANY(ARRAY['account_rdx16yym9xxyk8uu2gwvdrlrv56ff76az0u6kh5uv7es7m7y55an25yxfk'])
                  AND ab.data IS NOT NULL
                  AND jsonb_typeof(ab.data) = 'array'
                  -- AND ${input.filterType === "exclude_hold" 
                  --   ? sql`(activity_item->>'activityId') NOT LIKE '%hold_%'`
                  --   : sql`(activity_item->>'activityId') LIKE '%hold_%'`}
                  -- AND (activity_item->>'usdValue')::decimal > 0
              ),
              activities_with_duration AS (
                -- Calculate duration to next timestamp using LEAD window function
                SELECT 
                  account_address,
                  activity_id,
                  timestamp,
                  usd_value,
                  COALESCE(
                    LEAD(timestamp) OVER (
                      PARTITION BY account_address, activity_id 
                      ORDER BY timestamp
                    ),
                    '2025-06-29 23:59:59+00'::timestamp with time zone
                  ) AS next_timestamp
                FROM expanded_activities
              ),
              weighted_calculations AS (
                -- Calculate weighted values and durations
                SELECT 
                  account_address,
                  activity_id,
					EXTRACT(EPOCH FROM (next_timestamp - timestamp)) * 1000 AS duration_ms,
					usd_value * EXTRACT(EPOCH FROM (next_timestamp - timestamp)) * 1000 AS weighted_value
                FROM activities_with_duration
                WHERE next_timestamp > timestamp
              ),
              twa_results AS (
                -- Calculate time-weighted average per account/activity
                SELECT 
                  account_address,
                  activity_id,
                  SUM(weighted_value) / NULLIF(SUM(duration_ms), 0) AS twa_usd_value,
                  SUM(duration_ms) / (1000.0 * 60.0) AS total_duration_minutes
                FROM weighted_calculations
                GROUP BY account_address, activity_id
                HAVING SUM(duration_ms) > 0
              )
              -- Apply calculation type and format results
              SELECT 
                account_address,
                activity_id,
                '6b209cf9-5932-487e-bf75-9d6f7d2330dd'::uuid AS week_id,
				twa_usd_value,
				total_duration_minutes,
                CASE 
                  WHEN 'USDValueD' = 'USDValue' THEN 
                    ROUND(twa_usd_value, 2)::bigint
                  ELSE 
                    ROUND(twa_usd_value * total_duration_minutes, 0)::bigint
                END AS activity_points
              FROM twa_results
			  Where twa_usd_value > 0
			  AND CASE 
                    WHEN 'USDValueD' = 'USDValue' THEN 
                      ROUND(twa_usd_value, 2)
                    ELSE 
                      ROUND(twa_usd_value * total_duration_minutes, 0)
                  END > 0
              ORDER BY account_address, activity_id;


                SELECT 
                  ab.timestamp,
                  ab.account_address,
                  activity_item->>'activityId' AS activity_id,
                  (activity_item->>'usdValue')::decimal AS usd_value
                FROM account_balances ab
                CROSS JOIN jsonb_array_elements(ab.data) AS activity_item
                WHERE ab.timestamp >= '2025-06-23 00:00:00+00'
                  AND ab.timestamp <= '2025-06-29 23:59:59+00'
                  AND ab.account_address = ANY(ARRAY['account_rdx16yym9xxyk8uu2gwvdrlrv56ff76az0u6kh5uv7es7m7y55an25yxfk '])
                  AND ab.data IS NOT NULL
                  AND jsonb_typeof(ab.data) = 'array'
				  AND activity_item->>'activityId' = 'weft_lend_xusdc'
                  -- AND ${input.filterType === "exclude_hold" 
                  --   ? sql`(activity_item->>'activityId') NOT LIKE '%hold_%'`
                  --   : sql`(activity_item->>'activityId') LIKE '%hold_%'`}
                  -- AND (activity_item->>'usdValue')::decimal > 0


SELECT 
    ab.account_address,
    ab.timestamp,
    (activity_item->>'usdValue')::decimal as weft_lend_xusdc_usd_value,
    activity_item->>'activityId' as activity_id,
    activity_item->'metadata' as metadata
FROM account_balances ab,
     jsonb_array_elements(ab.data) as activity_item
WHERE activity_item->>'activityId' = 'weft_lend_xusdc'
  AND ab.account_address = 'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew'
ORDER BY ab.timestamp;


SELECT 
    schemaname,
    relname as table_name,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates, 
    n_tup_del as total_deletes,
    n_live_tup as estimated_live_rows,
    n_dead_tup as estimated_dead_rows,
    (n_live_tup + n_dead_tup) as estimated_total_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY relname;

select * from week


CREATE OR REPLACE FUNCTION get_table_counts()
RETURNS TABLE(table_name TEXT, record_count BIGINT) AS $$
DECLARE
    table_record RECORD;
    count_result BIGINT;
BEGIN
    FOR table_record IN 
        SELECT t.table_name::TEXT as tname
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name
    LOOP
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_record.tname) 
        INTO count_result;
        
        table_name := table_record.tname;
        record_count := count_result;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Call the function
SELECT * FROM get_table_counts() ORDER BY record_count;

select * from account_activity_points

select * from season_points_multiplier

select * from user_season_points

select * from activity_week

select count(*),timestamp from account_balances group by timestamp

select * from week

CREATE TABLE IF NOT EXISTS account_activity_points_Code_opt_value AS 
SELECT * FROM account_activity_points;

CREATE TABLE IF NOT EXISTS season_points_multiplier_Code_opt_value AS 
SELECT * FROM season_points_multiplier;

CREATE TABLE IF NOT EXISTS user_season_points_Code_opt_value AS 
SELECT * FROM user_season_points;



select * from account_activity_points_sql_opt_value where account_address = 'account_rdx1296grxcyz2a2hjn9c7jepp950ahahfpt6mlq3zjwljfnpynen4gyc0'
select * from account_activity_points where account_address = 'account_rdx1296grxcyz2a2hjn9c7jepp950ahahfpt6mlq3zjwljfnpynen4gyc0'


SELECT 
    COALESCE(o.activity_id, b.activity_id) as activity_id,
    COALESCE(SUM(o.activity_points), 0) as original_total_points,
    COALESCE(SUM(b.activity_points), 0) as backup_total_points,
    COALESCE(SUM(o.activity_points), 0) - COALESCE(SUM(b.activity_points), 0) as points_difference,
    COUNT(o.activity_id) as original_records,
    COUNT(b.activity_id) as backup_records
FROM account_activity_points o
FULL OUTER JOIN account_activity_points_SQL_opt_value b ON o.activity_id = b.activity_id
GROUP BY COALESCE(o.activity_id, b.activity_id)
-- HAVING COALESCE(SUM(o.activity_points), 0) != COALESCE(SUM(b.activity_points), 0)
--    OR COUNT(o.activity_id) != COUNT(b.activity_id)
ORDER BY activity_id;


SELECT 
    COALESCE(o.account_address, b.account_address) as account_address,
    COALESCE(SUM(o.activity_points), 0) as original_total_points,
    COALESCE(SUM(b.activity_points), 0) as backup_total_points,
    COALESCE(SUM(o.activity_points), 0) - COALESCE(SUM(b.activity_points), 0) as points_difference,
    COUNT(o.account_address) as original_records,
    COUNT(b.account_address) as backup_records
FROM account_activity_points o
FULL OUTER JOIN account_activity_points_SQL_opt_value b ON o.account_address = b.account_address
GROUP BY COALESCE(o.account_address, b.account_address)
-- HAVING COALESCE(SUM(o.activity_points), 0) != COALESCE(SUM(b.activity_points), 0)
--    OR COUNT(o.account_address) != COUNT(b.account_address)
ORDER BY ABS(COALESCE(SUM(o.activity_points), 0) - COALESCE(SUM(b.activity_points), 0)) DESC;



-- Compare points per account and activity combination
SELECT 
    COALESCE(o.account_address, b.account_address) as account_address,
    COALESCE(o.activity_id, b.activity_id) as activity_id,
    COALESCE(SUM(o.activity_points), 0) as original_total_points,
    COALESCE(SUM(b.activity_points), 0) as backup_total_points,
    COALESCE(SUM(o.activity_points), 0) - COALESCE(SUM(b.activity_points), 0) as points_difference,
    COUNT(o.account_address) as original_records,
    COUNT(b.account_address) as backup_records
FROM account_activity_points o
FULL OUTER JOIN account_activity_points_code_opt_value b ON 
    o.account_address = b.account_address 
    AND o.activity_id = b.activity_id
GROUP BY COALESCE(o.account_address, b.account_address), COALESCE(o.activity_id, b.activity_id)
-- HAVING COALESCE(SUM(o.activity_points), 0) != COALESCE(SUM(b.activity_points), 0)
--    OR COUNT(o.account_address) != COUNT(b.account_address)
ORDER BY account_address, activity_id;



SELECT 
    COALESCE(o.user_id, b.user_id) as user_id,
    COUNT(o.user_id) as original_week_records,
    COUNT(b.user_id) as backup_week_records,
    ROUND(AVG(o.multiplier), 4) as original_avg_multiplier,
    ROUND(AVG(b.multiplier), 4) as backup_avg_multiplier,
    ROUND(AVG(o.multiplier) - AVG(b.multiplier), 4) as avg_multiplier_difference,
    ROUND(SUM(o.cumulative_twa_balance), 2) as original_total_cumulative_twa,
    ROUND(SUM(b.cumulative_twa_balance), 2) as backup_total_cumulative_twa,
    ROUND(SUM(o.total_twa_balance), 2) as original_total_twa,
    ROUND(SUM(b.total_twa_balance), 2) as backup_total_twa
FROM season_points_multiplier_Code_opt_value o
FULL OUTER JOIN season_points_multiplier b ON o.user_id = b.user_id
where b.cumulative_twa_balance  > '10000'

GROUP BY COALESCE(o.user_id, b.user_id)
HAVING COUNT(o.user_id) != COUNT(b.user_id)
   OR ROUND(AVG(o.multiplier), 4) != ROUND(AVG(b.multiplier), 4)
   OR ROUND(SUM(o.cumulative_twa_balance), 2) != ROUND(SUM(b.cumulative_twa_balance), 2)
   OR ROUND(SUM(o.total_twa_balance), 2) != ROUND(SUM(b.total_twa_balance), 2)
ORDER BY user_id;


SELECT 
  ab.timestamp,
  ab.account_address,
  activity_item->>'activityId' AS activity_id,
  ROUND((activity_item->>'usdValue')::decimal,3) AS usd_value,
  -- Add any other fields that exist in your JSONB objects
  ab.data AS raw_activity_data
FROM account_balances ab
CROSS JOIN jsonb_array_elements(ab.data) AS activity_item
WHERE (activity_item->>'usdValue')::decimal > 0
AND (activity_item->>'activityId') NOT LIKE '%hold_%'
and (activity_item->>'activityId') = 'weft_lend_xusdc'
and account_address = 'account_rdx16xqpkw4lujmuuyt6hdqgjutdlu0d7kqlqc8sxsxyhtveq84stmh28g'

--   AND jsonb_typeof(ab.data) = 'array'
ORDER BY ab.timestamp, ab.account_address, activity_item->>'activityId';

select * from account_activity_points where account_address = 'account_rdx16xqpkw4lujmuuyt6hdqgjutdlu0d7kqlqc8sxsxyhtveq84stmh28g'

select * from account_balances where account_address = 'account_rdx168g4hev82tpz7vg0u4swde3cqne8j4q5qrl24wu0ja0ustd7gkwcnr'


select * from account where address = 'account_rdx16974xpkq2mrfr5zmj5rhymzeyttv7t53x8us4q66kkj4s3vgrk2c06'


SELECT 
  spm.user_id,
  spm.week_id,
  spm.multiplier,
  spm.cumulative_twa_balance,
  spm.total_twa_balance,
  STRING_AGG(acc.address, ', ' ORDER BY acc.address) AS account_addresses
FROM season_points_multiplier spm
LEFT JOIN account acc ON spm.user_id = acc.user_id
GROUP BY 
  spm.user_id,
  spm.week_id,
  spm.multiplier,
  spm.cumulative_twa_balance,
  spm.total_twa_balance
ORDER BY multiplier desc,spm.user_id, spm.week_id;


SELECT 
  usp.user_id,
  usp.season_id,
  usp.week_id,
  usp.points,
  STRING_AGG(acc.address, ', ' ORDER BY acc.address) AS account_addresses
FROM user_season_points usp
LEFT JOIN account acc ON usp.user_id = acc.user_id
GROUP BY 
  usp.user_id,
  usp.season_id,
  usp.week_id,
  usp.points
ORDER BY usp.user_id, usp.season_id, usp.week_id;

select * from "public".user

select * from account

select * from week