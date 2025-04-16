# Implementation Plan for Activities Management

## 1. Overview and Architecture

The activities management system will provide admins with tools to configure and maintain on-chain activities that earn points in the Radix Incentives Campaign. The system follows a hierarchical structure where seasons contain multiple weeks, and weeks are associated with multiple activities. Each activity has configurable rules stored as JSON and is classified as either passive or active. Notably, passive activities can either directly award points or provide multiplier bonuses that enhance the value of points earned through other activities. The system includes a manual week completion process to convert weekly points into season points.

## 2. Activity Type Definitions and Reward Mechanisms

### Passive Activities

Passive activities require minimal ongoing user action and generally - involve holding assets over time:

- Holding XRD: Maintaining a balance of XRD tokens
- Holding LSUs: Owning liquid staking units from staking XRD
- Holding Stablecoins: Maintaining balances of tokens like xUSDC, xUSDT
- Holding NFTs: Owning NFTs from specified collections

**Key characteristics:**

- Measured through periodic snapshots
- Primarily time-based (Time Weighted Average)
- Rewards consistency and commitment
- Can provide either direct points or multiplier bonuses

### Active Activities

Active activities require specific user transactions and direct engagement with the network:

- DEX Swaps: Trading tokens on decentralized exchanges
- Trade Volume: Dollar value of trading activity
- Adding Liquidity: Creating new liquidity positions
- Providing Liquidity: Maintaining liquidity positions in pools
- Lending/Borrowing: Interactions with lending protocols
- Minting: Creating new tokens or NFTs
  **Key characteristics:**
- Transaction-based
- Measured by frequency and magnitude
- Rewards network utilization and engagement
- Typically award direct points

### Reward Mechanisms

- Direct Points: Awarded for completing activities, form the base of a user's score
- Multiplier Bonuses: Enhance the value of direct points by applying a multiplier based on passive activities (e.g., holding XRD might provide a 1.5x multiplier to all points earned)

## 3. Data Structure

### Core Entities and Relationships

- Season: Top-level container for campaign periods
- Week: Belongs to a season, contains activities for a specific time period
- Activity: Has a type (passive/active), reward type (points/multiplier), and rules stored as JSON
- Activity-Week: Junction entity connecting activities to weeks with a points allocation
- Transaction: Records of on-chain transactions that generate activity entries
- UserActivity: Records user participation in activities
- UserWeeklyPoints: Tracks user points earned each week before conversion
- UserWeeklyMultipliers: Tracks multipliers earned from passive activities
- UserSeasonPoints: Aggregated points that contribute to season rankings and rewards

```
Season
  ├── id
  ├── name
  ├── startDate
  ├── endDate
  └── status

Week
  ├── id
  ├── seasonId (foreign key)
  ├── startDate
  ├── endDate
  ├── status (active, completed, upcoming)
  └── isProcessed (boolean for week completion)

Activity
  ├── id
  ├── name
  ├── description
  ├── type (passive/active)
  ├── rewardType (points/multiplier) - indicates if this activity gives points or a multiplier
  ├── category (holding, trading, liquidity, etc.)
  └── rules (JSON)

ActivityWeek
  ├── id
  ├── activityId (foreign key)
  ├── weekId (foreign key)
  ├── pointsPool (total points allocated for points-based activity)
  └── status (active, inactive)

Transaction
  ├── id
  ├── transactionId (blockchain transaction identifier)
  ├── userId
  ├── timestamp
  ├── stateVersion
  ├── rawData (JSON)
  └── processedAt

UserActivity
  ├── id
  ├── userId (foreign key)
  ├── activityId (foreign key)
  ├── weekId (foreign key)
  ├── transactionId (foreign key, may be null for passive activities)
  ├── timestamp
  ├── value (monetary equivalent/USD value of the activity)
  └── metadata (JSON with additional context)

UserWeeklyPoints
  ├── id
  ├── userId
  ├── weekId
  ├── activityPoints (JSON mapping activity IDs to points)
  ├── basePoints (sum of direct points before multipliers)
  ├── appliedMultiplier (the calculated multiplier to apply)
  ├── totalPoints (basePoints * appliedMultiplier)
  └── isConverted (boolean)

UserWeeklyMultipliers
  ├── id
  ├── userId
  ├── weekId
  ├── activityMultipliers (JSON mapping activity IDs to multipliers)
  └── totalMultiplier (combined multiplier from all sources)

UserSeasonPoints
  ├── id
  ├── userId
  ├── seasonId
  └── totalPoints
```

## 4. Activity-Specific Processing

### Passive Activity Processing

- Measurement Method: Initial snapshot at week start, then balance updates detected via transaction event stream
- Calculation Approach: Time-weighted average of holdings
- Reward Options:
  - Points: Direct allocation from points pool
  - Multipliers: Calculation of bonus multiplier based on holdings
- Special Considerations:
  - Minimum holding periods to qualify
  - Verification of continuous ownership
  - Value fluctuations of held assets
  - S-curve or tiered multiplier calculations

### Active Activity Processing

- Measurement Method: Transaction tracking and event monitoring
- Calculation Approach: Frequency and volume of specific actions
- Value Calculation:
  - Monetary equivalent (USD value) of the transaction
  - Used for proportional distribution of points pool
  - Basis for minimum threshold filtering
- Special Considerations:
  - Minimum transaction value thresholds
  - Prevention of wash trading or artificial activity
  - Value normalization across different types of actions
  - For Providing Liquidity: tracking duration and value of liquidity provided
  - Transaction verification through blockchain records

### Transaction to Activity Mapping

- A single transaction can generate multiple activity records
- System analyzes transaction content to identify all qualifying activities
- Each activity from a transaction is recorded with reference to the original transaction ID
- Monetary value of activity is extracted from transaction data where applicable
- Complex transactions (e.g., multi-step DeFi operations) are decomposed into individual activities

### Multiplier Application

- User-Level Multipliers (Global): Primarily based on XRD/LSU holdings (tracked via UserAccount data). Applied during the week completion process to the user's total _weekly_ base points before conversion to _season_ points.
- Activity-Level Multipliers (Passive Activities): Some passive activities might grant a multiplier instead of direct points. These are tracked in `UserWeeklyMultipliers` and contribute to the `totalMultiplier` used in the `UserWeeklyPoints` calculation ( `totalPoints = basePoints * appliedMultiplier`).
- Pool-Size Multipliers (Active/Passive Activities): An activity's configuration might include a multiplier that adjusts its contribution to the weekly points pool, affecting distribution but not applied per-user directly.
- Stacking Rules: Define how user-level and activity-level multipliers combine (e.g., multiplicative).

## 5. Multiplier System Design

### Multiplier Types

- XRD Holding Multipliers: Based on balance of XRD tokens
- LSU Holding Multipliers: Based on staked XRD represented by LSUs
- Liquidity Provision Multipliers: Based on LP tokens held (treated as an active activity)
- NFT Ownership Multipliers: Based on specific NFT collections
- Composite Multipliers: Combinations of multiple factors

### Multiplier Calculation Methods

- Tiered Multipliers: Fixed multiplier levels based on thresholds
- S-Curve Multipliers: Gradual scaling that tapers at upper and lower bounds
- Linear Multipliers: Direct proportional scaling
- Capped Multipliers: Maximum limit regardless of activity level

### Multiplier Application

- Global Multipliers: Apply to all points earned across activities
- Category Multipliers: Apply only to specific categories of activities
- Specific Activity Multipliers: Apply only to designated activities
- Stacking Rules: How multiple multipliers combine (additive, multiplicative, maximum, etc.)

## 6. Implementation Phases

### Phase 1: Core Data Structure (3 days)

- Implement Season, Week, Activity, and ActivityWeek models
- Create Transaction model with blockchain transaction tracking
- Add support for both points and multiplier reward types
- Create associations between entities
- Build data access layer and basic CRUD operations
- Set up database migrations and seeding
- Implement activity type classification (active/passive)

### Phase 2: Transaction Processing System (3 days)

- Develop blockchain transaction monitoring and storage
- Implement transaction parsing and categorization
- Create activity extraction logic from transactions
- Build transaction verification system
- Implement transaction-to-activity mapping service

### Phase 3: Activities Management UI (4 days)

- Create activities list view with filtering by type, reward mechanism, and week
- Implement activity detail view for configuration
- Build JSON rule editor with validation and form-based controls
- Design UI for assigning activities to weeks with points or multiplier configuration
- Add specialized controls for passive vs. active activity configuration
- Create multiplier visualization tools

### Phase 4: Season and Week Management (2 days)

- Create season management interface
- Implement week creation and configuration
- Build timeline visualization for season/week structure
- Add controls for activating/deactivating weeks

### Phase 5: Activity Rules Configuration (4 days)

- Implement JSON rule schema and validation with type-specific options
- Create specialized rule editors for passive activities with points vs. multiplier options
- Build rule editors for active activities (transaction counts, volume thresholds)
- Create specialized configuration for liquidity provision as an active activity
- Implement multiplier calculation configuration (S-curve, tiered, etc.)
- Add rule validation against system constraints
- Implement rule cloning between weeks

### Phase 6: Activity Tracking System (4 days)

- Develop passive activity snapshot system for balance monitoring
- Implement active activity transaction monitoring
- Create specialized processing for each activity category
- Build tracking for liquidity provision activities
- Implement calculation system for activity values
- Implement time-weighted calculations for passive activities
- Create multiplier calculation engine

### Phase 7: Multiplier System Implementation (3 days)

- Develop multiplier calculation services
- Create user multiplier tracking system
- Implement multiplier application rules
- Build visualization tools for multiplier effects
- Create multiplier simulation capabilities

### Phase 8: Points Allocation System (3 days)

- Create interface for assigning points to activities per week
- Implement points pool allocation tools
- Build distribution formula configuration
- Add simulation tools for testing distribution scenarios
- Implement type-specific allocation methods
- Create integrated points and multiplier preview tools

### Phase 9: User Activity Processing (4 days)

- Design and implement UserActivity tracking system
- Build differentiated processing for passive vs. active activities
- Create multiplier tracking and application logic
- Implement monitoring for unusual activity patterns
- Add value-based points calculation

### Phase 10: Week Completion Process (3 days)

- Develop week completion workflow
- Create points conversion pipeline that properly applies multipliers
- Implement user weekly points reset
- Build audit logging for week transitions
- Add data validation and verification steps

### Phase 11: Analytics and Reporting (3 days)

- Create dashboards for activity participation by type
- Implement points and multiplier distribution visualization
- Build comparative analytics across weeks
- Design admin reports for activity effectiveness
- Add specialized reports for passive vs. active engagement
- Implement transaction-based analytics

### Phase 12: Testing and Validation (3 days)

- Test data integrity across entity relationships
- Validate points calculations and multiplier applications
- Verify week completion process with multipliers
- Test rule configurations and JSON validation
- Ensure UI handles all edge cases
- Test specific scenarios for each activity category and reward type
- Verify transaction processing and activity extraction

## 7. UI Components

### Transaction Explorer UI Component

- Transaction list view with filtering options
- Direct links to Radix Dashboard for transaction details using transaction IDs
- Integration with Radix Explorer API for basic transaction preview data
- Quick-view summary of transaction-generated activities
- Activity verification interface within admin system
- Transaction ID hyperlinks that open the official Radix Dashboard in a new tab

### Activities Management

- Activity list with status, type, reward mechanism, and current configuration
- Type-specific activity detail pages with specialized configuration
- Reward-specific configuration panels (points vs. multipliers)
- JSON rule editor with form-based controls tailored to activity type
- Activity-Week assignment interface
- Category-specific configuration panels

### Passive Activity Configuration

- Asset holding requirement settings
- Toggle between points and multiplier reward types
- Multiplier calculation configuration (S-curve, tiered, etc.)
- Time-weighted average calculation parameters
- Minimum holding period configuration
- Asset value fluctuation handling
- NFT collection whitelisting tools

### Active Activity Configuration

- Transaction volume thresholds
- Value calculation settings
- Anti-gaming protection settings
- Value normalization controls
- Liquidity provision tracking parameters (duration, value)
- Transaction pattern recognition settings

### Multiplier Configuration Tools

- Multiplier formula editor (S-curve, tiered, linear)
- Visual curve editor with interactive parameters
- Stacking rules configuration
- Multiplier caps and floors
- Multiplier application scope selection
- Simulation tools with real-world examples

### Season and Week Management

- Season creation and configuration
- Week timeline visualization
- Week status management
- Week completion workflow

### Points Configuration

- Week points allocation dashboard
- Activity points pool configuration
- Distribution formula editor with type-specific options
- Points simulation calculator
- Multiplier effect previewer

### Week Completion Console

- Week status dashboard
- Week completion workflow with verification
- Points conversion preview showing multiplier effects
- User weekly points reset confirmation
- Audit history view

### Analytics Dashboards

- Activity participation metrics by type and category
- Points distribution visualization
- Multiplier distribution analysis
- User engagement reports
- Week-over-week comparisons
- Passive vs. active engagement analysis
- Transaction volume and pattern analysis

## 8. Interactions and Workflows

### Transaction Processing Workflow

- System detects and records blockchain transaction
- Transaction is parsed and analyzed for qualifying activities
- Each identified activity generates a UserActivity record with:
  - Reference to the original transaction ID
  - USD value of the activity
  - Activity-specific metadata
- For complex transactions, multiple activities may be created
- System applies activity rules to determine points allocation
- Transaction and resulting activities are recorded for audit purposes

### Activity Configuration Workflow

- Admin creates or selects an activity
- Specifies activity type (passive/active) and category
- Selects reward mechanism (points or multiplier) for passive activities
- Configures basic details and category-specific parameters
- For multiplier activities, configures multiplier calculation method
- Defines rules using the type-specific editor
- Assigns activity to specific weeks
- Allocates points pool for each activity-week pairing
- Sets activity status (active/inactive) for each week

### Multiplier-based Activity Configuration

- Admin selects passive activity to configure as a multiplier
- Specifies the asset or condition that triggers the multiplier
- Configures multiplier calculation method (S-curve, tiered, etc.)
- Sets parameters (thresholds, caps, curve shape)
- Defines which activity categories or specific activities are affected
- Configures stacking behavior with other multipliers
- Sets minimum requirements to qualify for any multiplier

### Passive Activity Processing - Measurement Method

- Initial snapshot taken at week startDate to establish baseline balances
- Balance updates triggered by any transaction that changes relevant balances
- System maintains current balance state rather than relying solely on periodic snapshots
- Eliminates the need for time-weighted average calculations in many cases
- Provides real-time accuracy for passive activity tracking
- Reduces system load from unnecessary periodic snapshots

### Active Activity Tracking

- System monitors on-chain transactions for specific activities
- Records each qualifying transaction with blockchain transaction ID
- For liquidity provision: tracks both the action of adding liquidity and the ongoing position
- Extracts monetary value (USD equivalent) for each activity
- Applies points distribution based on activity value
- Records activities with their value for later points calculation

### Week Completion Process

- Admin initiates week completion when the week ends
- System finalizes calculations:
  - Passive activities (points): completes time-weighted calculations
  - Passive activities (multipliers): finalizes multiplier calculations
  - Active activities: finalizes value-based points calculations
- System applies calculated multipliers to base points
- Preview of results is presented for verification, showing:
  - Base points from activities
  - Multipliers from passive activities
  - Final points after multiplier application
- Admin confirms completion
- System converts weekly points to season points
- Weekly activity points and multipliers are reset
- System activates the next week
- Comprehensive audit log is generated

## 9. API Integration Points

### Core Endpoints

- CRUD operations for Season, Week, Activity models with reward type support
- Transaction recording and activity extraction API
- Activity rule configuration with type-specific endpoints for points/multipliers
- Activity-Week assignments and points allocation
- User activity tracking with specialized endpoints for passive/active
- Multiplier calculation and application services
- Week completion process and points conversion
- Analytics and reporting data with type segmentation

### Data Processing Services

- Blockchain transaction monitoring service
- Transaction parsing and activity extraction service
- Passive activity snapshot service
- Active activity transaction monitoring service
- Liquidity provision tracking service
- Time-weighted average calculation service
- Multiplier calculation service
- Value-based points calculation service
- Points distribution services by activity type
- Multiplier application service
- Season points conversion service
- Data archiving service for completed weeks

## 10. Future Enhancements

### Planned for Later Phases

- Dynamic multiplier adjustments based on ecosystem health
- Personalized multiplier paths based on user behavior
- Advanced multiplier stacking rules and combinations
- Cross-activity multipliers (e.g., holding one asset boosts rewards for trading another)
- AI-powered rule recommendations based on participation data
- Automated anomaly detection for activity gaming
- Scheduled week completion with approval workflow
- Activity effectiveness scoring based on engagement and multiplier impact
- Advanced transaction pattern recognition

## 11. Success Criteria

- System correctly differentiates between points-based and multiplier-based activities (passive).
- Admins can effectively create, configure, and manage activities with type-specific rules using the admin UI.
- Transaction processing correctly extracts, categorizes activities, and links them to the originating transaction ID.
- Transaction IDs are properly tracked for verification and audit, including links to external explorers.
- Monetary value (USD equivalent) of activities is accurately calculated and used for value-based distributions.
- Passive activities properly track holdings (e.g., time-weighted averages or based on balance updates) for both points and multipliers.
- Liquidity provision is correctly tracked as an active activity, considering duration and value.
- User-level multipliers (e.g., XRD holdings) and activity-level multipliers are correctly calculated based on configuration (S-curve, tiers, etc.).
- Multipliers are correctly applied according to defined stacking rules during the appropriate calculation phase (e.g., user-level applied during week completion).
- Points distribution for active activities is calculated fairly based on participation and configured activity values/rules.
- Week completion process successfully applies multipliers, converts weekly points to season points, and provides a verification preview and audit trail.
- Admins can effectively use the UI to manage the week completion process.
- Historical data is preserved for reporting and auditing.
- UI provides clear visualization of complex data relationships including multiplier types and their effects.
- System maintains data integrity across all operations.

## 12. Risks and Mitigation

- Risk: Complexity in handling both direct points and multiplier calculations
  - Mitigation: Clear separation of concerns, modular services, comprehensive testing
- Risk: Transaction parsing errors leading to missed activities
  - Mitigation: Robust parsing engines, fallback detection mechanisms, manual verification tools
- Risk: Inaccurate monetary value calculation for activities
  - Mitigation: Multiple price oracles, time-weighted value calculations, anomaly detection
- Risk: User confusion about multiplier effects on final points
  - Mitigation: Transparent UI showing both base points and multiplier effects, simulation tools
- Risk: Imbalance between points-based and multiplier-based strategies
  - Mitigation: Frequent analysis of reward patterns, adjustable parameters, caps on multipliers
- Risk: Multiplier stacking creating excessive point inflation
  - Mitigation: Clear stacking rules, global caps, diminishing returns on stacked multipliers
- Risk: Performance issues with complex multiplier calculations
  - Mitigation: Optimized algorithms, pre-calculation of common scenarios, caching strategies
- Risk: Data gaps in passive activity snapshots affecting multiplier calculations
  - Mitigation: Redundant snapshot services, interpolation capabilities, fallback mechanisms
- Risk: Gaming opportunities in active activities through artificial transactions
  - Mitigation: Minimum value thresholds, pattern detection, diminishing returns
- Risk: Points calculation errors affecting user rewards
  - Mitigation: Type-specific verification steps, comparison reports, and audit trails
- Risk: Multi-wallet strategies circumventing multiplier limits
  - Mitigation: Account linking detection, global user limits, anti-Sybil measures
