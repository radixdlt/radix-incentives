# Radix Incentives Preview Tool

## Overview

The Preview Tool is an experimental utility designed to test and preview the Radix Incentives Campaign's season points calculation system using real or simulated data. It provides a safe, isolated environment to validate the points calculation algorithms, test configuration changes, and preview results before applying them to production systems.

## Purpose

This tool is primarily used for:

- **Algorithm Testing**: Validate season points calculation logic with real data
- **Configuration Preview**: Test how changes to activity categories, point pools, or multipliers affect user rankings
- **Data Analysis**: Generate detailed breakdowns of user activity points and season points for analysis
- **Development & QA**: Verify that new features or bug fixes work correctly with production-like data

## Architecture

The tool uses:

- **PostgreSQL Test Container**: Isolated database instance using Docker
- **Database Dump Management**: Organized storage and selection of multiple database snapshots
- **Interactive CLI**: User-friendly interface that requires explicit user choices (no automatic fallbacks)
- **Effect Framework**: Functional programming approach for reliable execution
- **API Services**: Same calculation services used in production

## Prerequisites

- Node.js 18+ with pnpm
- Docker (for PostgreSQL test container)
- PostgreSQL client tools (`pg_dump` must be available in PATH)
- Access to a database dump file or connection string

## Directory Structure

```
experiments/preview/
├── README.md              # This documentation
├── package.json           # Dependencies and scripts
├── tsup.config.ts         # Build configuration
├── .gitignore             # Git ignore rules
├── dump.sh               # Legacy dump script (optional)
├── src/
│   ├── index.ts          # Core preview functionality
│   ├── cli.ts            # CLI interface
│   ├── dump.ts           # Database dump utilities
│   └── dumps.ts          # Dump management utilities
├── dumps/                # SQL dump storage directory
│   ├── dump_2025-01-15T10-30-00.sql
│   ├── production_snapshot.sql
│   └── test_data.sql
├── dist/                 # Built CLI files
└── output/               # Generated results
    └── results.json      # Preview calculation results
```

## Usage

### Quick Start

```bash
# Install dependencies
pnpm install

# Set database connection (optional - can use -d flag instead)
export DATABASE_URL="postgresql://user:password@host:port/database"

# Interactive mode (default behavior) - select from existing dumps or create new
pnpm cli run

# Create named dump and run calculation
pnpm cli dump -n "production-snapshot"
pnpm cli run --dump production-snapshot
```

### CLI Commands

#### `preview run` - Full preview process

Run season points calculation with flexible dump selection:

```bash
# Interactive selection from existing dumps (default behavior)
pnpm cli run

# Use specific dump by name
pnpm cli run --dump "my-dump"

# Create new dump with specific database URL (via CLI)
pnpm cli run -d "postgresql://user:pass@host:port/db"

# Use legacy dump.sql file
pnpm cli run --skip-dump

# Only create dump, don't run calculation
pnpm cli run --dump-only

# Specify custom output directory
pnpm cli run -o ./custom-results
```

**Options:**
- `-d, --database-url <url>` - Database connection string (optional, defaults to DATABASE_URL env var)
- `-o, --output <path>` - Output directory (default: `./output`)
- `--dump <name>` - Use specific dump by name (searches in dumps/ folder)
- `--skip-dump` - Use existing dump.sql file (legacy mode)
- `--dump-only` - Only create dump, skip calculation

#### `preview dump` - Create database dump

Create and store new database dumps:

```bash
# Create dump with auto-generated name
pnpm cli dump

# Create dump with custom name
pnpm cli dump -n "my-snapshot"

# Create dump from specific database
pnpm cli dump -d "postgresql://user:pass@host:port/db" -n "prod-backup"
```

**Options:**
- `-d, --database-url <url>` - Database connection string (optional, defaults to DATABASE_URL env var)
- `-n, --name <name>` - Custom name for dump file (without .sql extension)

#### `preview list` - List available dumps

View all stored SQL dumps:

```bash
pnpm cli list
```

Example output:
```
📂 Available SQL dumps:
🆕 production_snapshot.sql (25.3 MB, modified 1/15/2025 2:30:45 PM)
   test_data.sql (12.1 MB, modified 1/14/2025 10:15:32 AM)
   dump_2025-01-13T14-22-15.sql (28.7 MB, modified 1/13/2025 2:22:18 PM)
```

### Dump Management Workflow

#### 1. Create Organized Dumps

```bash
# Create production snapshot
export DATABASE_URL="postgresql://prod-connection"
pnpm cli dump -n "production-jan-15"

# Create development snapshot  
export DATABASE_URL="postgresql://dev-connection"
pnpm cli dump -n "dev-latest"

# Create test data snapshot
export DATABASE_URL="postgresql://test-connection"
pnpm cli dump -n "test-scenario-1"
```

#### 2. Use Interactive Selection

```bash
# Interactive mode presents menu (default behavior):
pnpm cli run

# Example interaction with existing dumps:
? Select a SQL dump to use:
❯ production-jan-15.sql (25.3 MB, modified 1/15/2025 2:30:45 PM)
  dev-latest.sql (18.2 MB, modified 1/15/2025 1:15:22 PM)  
  test-scenario-1.sql (5.4 MB, modified 1/14/2025 3:45:12 PM)
  📥 Create new dump from database
  🔗 Create new dump from custom database

# Example interaction when no dumps exist:
📂 No SQL dumps found in the dumps/ directory.
? No dumps available. What would you like to do?
❯ 📥 Create new dump from database
  🔗 Create new dump from custom database
  ❌ Exit

# If you select "Create new dump from custom database":
? Enter database connection string: postgresql://user:password@custom-host:5432/database
```

#### 3. Quick Dump Selection by Name

```bash
# Use partial or full names
pnpm cli run --dump production
pnpm cli run --dump prod-jan
pnpm cli run --dump production-jan-15.sql

# All of these will find "production-jan-15.sql"
```

#### 4. Custom Database URL Selection

When using interactive mode (which is now the default), you can create dumps from custom database URLs on the fly:

```bash
# Start interactive mode (default behavior)
pnpm cli run

# Select "🔗 Create new dump from custom database"
# Then enter any database URL when prompted:
# - Development: postgresql://user:pass@dev-server:5432/incentives_dev
# - Staging: postgresql://user:pass@staging-server:5432/incentives_staging  
# - Local test: postgresql://user:pass@localhost:5432/test_db
# - Remote backup: postgresql://user:pass@backup-server:5432/incentives_backup

# The tool will:
# 1. Connect to your specified database
# 2. Create a new timestamped dump file
# 3. Store it in dumps/ directory for future reuse
# 4. Run the calculation using that data
```

**Benefits:**
- Test with different environments without manual dump creation
- Quickly compare data from multiple database sources
- Avoid storing sensitive connection strings in scripts or environment variables
- One-time access to databases you don't regularly connect to

### Advanced Usage Examples

#### Testing Configuration Changes

```bash
# Create baseline dump
pnpm cli dump -n "baseline-config"

# Run with current configuration
pnpm cli run --dump baseline-config -o ./results-v1

# Modify point pool configuration in src/index.ts
# Run again with same data
pnpm cli run --dump baseline-config -o ./results-v2

# Compare results-v1/results.json vs results-v2/results.json
```

#### Performance Testing

```bash
# Create large dataset dump
pnpm cli dump -n "large-dataset" 

# Run multiple tests
pnpm cli run --dump large-dataset -o ./perf-test-1
pnpm cli run --dump large-dataset -o ./perf-test-2
pnpm cli run --dump large-dataset -o ./perf-test-3
```

#### Regression Testing

```bash
# Store known-good state
pnpm cli dump -n "known-good-state"
pnpm cli run --dump known-good-state -o ./baseline

# After code changes
pnpm cli run --dump known-good-state -o ./after-changes

# Compare outputs
diff ./baseline/results.json ./after-changes/results.json
```

## How It Works

The preview tool follows this process:

### 1. **Dump Selection**
- Scans `dumps/` directory for available SQL files
- Provides interactive selection or direct naming
- Automatically generates timestamped dump names
- Supports both new dumps and existing dump reuse

### 2. **Database Setup**
- Starts a fresh PostgreSQL container
- Loads the selected database dump
- Runs latest migrations
- Seeds additional test data

### 3. **Data Preparation**
- Creates activity category week assignments
- Sets up point pools for active activities
- Ensures all necessary relationships exist

### 4. **Calculation Execution**
- Runs the same season points calculation used in production
- Applies activity point calculations
- Computes multipliers and final season points
- Handles all business logic identically to production

### 5. **Results Export**
- Extracts calculated season points per user
- Includes detailed activity point breakdowns
- Outputs structured JSON for analysis

## Output Format

The `results.json` file contains an array of user results:

```json
[
  {
    "userId": "USER_ID",
    "seasonPoints": "319084.285714",
    "activityPoints": [
      {
        "activityId": "txFees",
        "activityPoints": 1632,
        "accountAddress": "account_rdx128..."
      },
      {
        "activityId": "componentCalls", 
        "activityPoints": 95,
        "accountAddress": "account_rdx128..."
      }
    ]
  }
]
```

### Fields Explanation

- **`userId`**: Unique identifier for the user
- **`seasonPoints`**: Total calculated season points (decimal string)
- **`activityPoints`**: Array of activity-specific point breakdowns
  - **`activityId`**: Identifier for the specific activity type
  - **`activityPoints`**: Points earned for this activity
  - **`accountAddress`**: Radix account address that earned these points

## Configuration & Customization

### Modifying Point Pools

Edit the `seedData()` function in `src/index.ts` to adjust point pool allocations:

```typescript
await db
  .insert(activityCategoryWeeks)
  .values(
    activitiesResults.map((item) => ({
      activityId: item.id,
      weekId: weeksResults[0].id,
      pointsPool: 100_000, // Adjust this value
      activityCategoryId: item.category,
    }))
  );
```

### Testing Specific Scenarios

- Create dumps with specific test data
- Adjust activity configurations before running calculations
- Use the `force: true` flag to recalculate existing data
- Compare outputs between different configurations

### Organizing Test Data

Create a structured approach to test data management:

```bash
# Environment-specific dumps
pnpm cli dump -n "prod-week-1"
pnpm cli dump -n "staging-latest"  
pnpm cli dump -n "dev-test-data"

# Scenario-specific dumps
pnpm cli dump -n "high-volume-users"
pnpm cli dump -n "edge-case-data"
pnpm cli dump -n "minimal-test-set"

# Version-specific dumps
pnpm cli dump -n "v1.0-baseline"
pnpm cli dump -n "v1.1-migration-test"
```

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
- Ensure Docker is running
- Check that PostgreSQL container starts successfully
- Verify database connection string format

**2. Dump Selection Issues**
- Check dumps exist: `pnpm cli list`
- Use exact or partial names: `--dump production` or `--dump prod`
- Verify file permissions on dumps/ directory

**3. Migration Failures**
- Ensure database schema is compatible
- Check that all required migrations are present
- Verify dump file contains necessary base tables

**4. Calculation Errors**
- Review activity category week assignments
- Ensure all required services are properly configured
- Check that active season and week exist in the data

**5. CLI Issues**
- Install dependencies: `pnpm install`
- Build CLI tool: `pnpm build:cli`
- Ensure `pg_dump` is available in your PATH
- Set DATABASE_URL environment variable or use -d option

### Debugging

Enable verbose logging by modifying the Effect logger:

```typescript
await Effect.runPromise(
  runnable.pipe(
    Effect.provide(Logger.pretty),
    Effect.tapError(Effect.logError)
  )
);
```

### File Management

Clean up old dumps periodically:

```bash
# List dumps to see what's available
pnpm cli list

# Manually remove old dumps
rm dumps/old-dump.sql

# Keep only recent dumps (manual cleanup)
ls -la dumps/
```

## Development Notes

### Adding New Features

When adding new calculation features:

1. Create a baseline dump: `pnpm cli dump -n "pre-feature"`
2. Update the main API services
3. Test changes: `pnpm cli run --dump pre-feature`
4. Validate results match expected outcomes
5. Compare with existing production data where possible

### Performance Testing

The tool can be used to test performance with large datasets:

- Create dumps of varying sizes
- Monitor execution time for different data volumes
- Test memory usage during calculations
- Validate container resource requirements

## Security Considerations

- The dump script excludes `account_balances` for privacy
- Never commit actual dump files to version control (they're gitignored)
- Use test data when sharing results publicly
- Ensure Docker containers are properly cleaned up
- Store sensitive dumps in secure locations outside the repository

## Related Documentation

- [Season Points Calculation](../../implementation-plans/calculateActivityPoints.md)
- [Activity Management](../../implementation-plans/activities.md)
- [User Facing Dashboard](../user-facing-dashboard/)
- [Database Schema](../../packages/db/src/incentives/)

## Support

For issues or questions about the preview tool:

1. Check the troubleshooting section above
2. Review related implementation plans
3. Examine the source code in `src/`
4. Consult the main project documentation
