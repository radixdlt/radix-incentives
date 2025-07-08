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