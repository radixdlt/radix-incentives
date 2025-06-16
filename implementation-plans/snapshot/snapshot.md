# Snapshot Service Flow

## Overview

The Snapshot Service is responsible for capturing point-in-time account balances and activity data for the Radix Incentives Campaign. This service processes blockchain data at specific timestamps to calculate user holdings, convert values to USD, and store the results for multiplier calculations and activity tracking.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant SnapshotService
    participant GetLedgerStateService
    participant GetAccountAddressesService
    participant CreateSnapshotService
    participant GetAllValidatorsService
    participant GetAccountBalancesAtStateVersionService
    participant AggregateAccountBalanceService
    participant UpsertAccountBalancesService
    participant UpdateSnapshotService
    participant Database

    Client->>SnapshotService: snapshot(addresses?, timestamp)
    
    Note over SnapshotService: Validate timestamp input
    alt timestamp missing
        SnapshotService-->>Client: SnapshotError("Timestamp is required")
    end
    
    SnapshotService->>GetLedgerStateService: getLedgerState({ at_ledger_state: { timestamp } })
    GetLedgerStateService-->>SnapshotService: ledgerState with state_version
    
    alt addresses not provided
        SnapshotService->>GetAccountAddressesService: getAccountAddresses({ createdAt: timestamp })
        GetAccountAddressesService->>Database: Query accounts created before timestamp
        Database-->>GetAccountAddressesService: Account addresses
        GetAccountAddressesService-->>SnapshotService: accountAddresses[]
    else addresses provided
        Note over SnapshotService: Use provided addresses
    end
    
    SnapshotService->>CreateSnapshotService: createSnapshot({ timestamp, status: "processing" })
    CreateSnapshotService->>Database: Insert snapshot record
    Database-->>CreateSnapshotService: Snapshot ID
    CreateSnapshotService-->>SnapshotService: { id: snapshotId }
    
    SnapshotService->>GetAllValidatorsService: getAllValidators()
    GetAllValidatorsService-->>SnapshotService: validators[]
    
    Note over SnapshotService: Log "getting account balances"
    
    SnapshotService->>GetAccountBalancesAtStateVersionService: getAccountBalancesAtStateVersion({<br/>addresses, at_ledger_state: { state_version }, validators })
    GetAccountBalancesAtStateVersionService-->>SnapshotService: accountBalances
    
    alt accountBalances failed
        SnapshotService->>UpdateSnapshotService: updateSnapshot({ id: snapshotId, status: "failed" })
        UpdateSnapshotService->>Database: Update snapshot status
        SnapshotService-->>Client: Error
    end
    
    Note over SnapshotService: Log "aggregating account balances and converting into USD"
    
    SnapshotService->>AggregateAccountBalanceService: aggregateAccountBalance({<br/>accountBalances: accountBalances.items, timestamp })
    AggregateAccountBalanceService-->>SnapshotService: aggregatedAccountBalance[]
    
    alt aggregation failed
        SnapshotService->>UpdateSnapshotService: updateSnapshot({ id: snapshotId, status: "failed" })
        UpdateSnapshotService->>Database: Update snapshot status
        SnapshotService-->>Client: SnapshotError("Failed to convert account balances")
    end
    
    Note over SnapshotService: Group by activityId and log counts
    
    SnapshotService->>UpsertAccountBalancesService: upsertAccountBalances(aggregatedAccountBalance)
    UpsertAccountBalancesService->>Database: Insert/Update account balances
    Database-->>UpsertAccountBalancesService: Success
    UpsertAccountBalancesService-->>SnapshotService: Success
    
    Note over SnapshotService: Log "updating snapshot"
    
    SnapshotService->>UpdateSnapshotService: updateSnapshot({ id: snapshotId, status: "completed" })
    UpdateSnapshotService->>Database: Update snapshot status to completed
    Database-->>UpdateSnapshotService: Success
    UpdateSnapshotService-->>SnapshotService: Success
    
    Note over SnapshotService: Log "snapshot completed"
    
    SnapshotService-->>Client: Success (void)
```

## Process Flow

### 1. Input Validation
- Validates that a timestamp is provided
- Optionally accepts specific account addresses to process

### 2. Ledger State Resolution
- Retrieves the blockchain state at the specified timestamp
- Gets the corresponding state_version for balance queries

### 3. Account Address Resolution
- If addresses are provided, uses those specific accounts
- If not provided, fetches all accounts created before the timestamp

### 4. Snapshot Lifecycle Management
- Creates a snapshot record with "processing" status
- Tracks the snapshot process in the database
- Updates status to "failed" or "completed" based on results

### 5. Validator Data Collection
- Fetches all validator information needed for LSU balance calculations
- Required for converting liquid staking tokens to XRD equivalents

### 6. Balance Retrieval
- Gets account balances at the specific state version
- Processes various asset types (XRD, LSUs, LP tokens, etc.)
- Handles complex DeFi positions from multiple protocols

### 7. Balance Aggregation and USD Conversion
- Converts all balances to USD values
- Aggregates balances by activity type
- Groups data for efficient storage and processing

### 8. Data Persistence
- Upserts processed account balance data to the database
- Maintains historical balance records for multiplier calculations

### 9. Completion
- Updates snapshot status to "completed"
- Logs completion for monitoring and debugging

## Error Handling

The service implements comprehensive error handling:

- **Input Validation Errors**: Invalid timestamp or parameters
- **Blockchain Errors**: Gateway connectivity, state lookup failures
- **Processing Errors**: Balance calculation or aggregation failures
- **Database Errors**: Snapshot creation, update, or balance storage failures

Failed snapshots are marked with "failed" status and appropriate error logging.

## Key Dependencies

- **GetLedgerStateService**: Blockchain state lookup
- **GetAccountBalancesAtStateVersionService**: Core balance retrieval
- **AggregateAccountBalanceService**: USD conversion and aggregation
- **Database Services**: Snapshot and balance persistence
- **Validator Services**: Required for LSU calculations

## Usage in Incentives Campaign

This snapshot service is crucial for:
- **Multiplier Calculations**: Capturing XRD/LSU holdings for S-curve multipliers
- **Activity Tracking**: Recording baseline balances for activity detection
- **Historical Analysis**: Maintaining time-series data for campaign analytics
- **Week Completion**: Providing point-in-time data for weekly processing
