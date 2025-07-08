select count(*),timestamp from snapshot where status = 'failed' 
and timestamp = '2025-06-24 04:00:00+00'
group by timestamp 


WITH snapshot_with_next_success AS (
    SELECT 
        id,
        timestamp,
        status,
        updated_at,
        LEAD(CASE WHEN status = 'completed' THEN timestamp END) 
            OVER (ORDER BY timestamp) AS next_successful_timestamp
    FROM snapshot
)
SELECT 
    id,
    timestamp,
    status,
    updated_at,
    NOW() - updated_at AS time_since_failure
FROM snapshot_with_next_success
WHERE status = 'failed'
AND next_successful_timestamp IS NULL
ORDER BY timestamp DESC;

