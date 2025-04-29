# Implementation Plan Comparison: Transaction Stream vs. Gateway API

This document outlines two potential implementation plans for processing data in the Radix Incentives Campaign Platform: one based on monitoring the Transaction Stream and the other based on querying Gateway API endpoints.

---

## Plan 1: Transaction Stream-Based Approach

This approach involves continuously monitoring the Radix ledger's transaction stream, filtering relevant transactions, and processing them to update user activity and calculate intermediate balances needed for the final weekly calculation.

**1. Infrastructure Setup:**

- Deploy a dedicated service (or set of services) responsible for consuming the Radix Transaction Stream (e.g., using the Gateway SDK). This could run within the Kubernetes cluster.
- Set up necessary database tables (PostgreSQL with Drizzle) as defined in the PRD and `database` rule, including tables to track registered user accounts (`UserAccount`), raw transactions (`Transaction`), processed activities (`UserActivity`), and intermediate balance snapshots if needed.
- Configure a job queue system (Bull MQ) for handling computationally intensive processing tasks asynchronously (e.g., complex activity classification, periodic checks).
- Ensure access to a non-throttled Gateway node for the stream.

**2. Data Acquisition & Filtering:**

- The streamer service connects to the Gateway Transaction Stream endpoint.
- Maintain an in-memory set or use a fast database lookup (e.g., Redis cache or indexed PostgreSQL table) of registered `UserAccount` addresses.
- For each transaction batch received:
  - Iterate through transactions.
  - Check if any involved addresses (sender, receiver, affected entities) match the registered accounts list.
  - If a match occurs, persist the relevant raw transaction data (`Transaction` table).
  - Optionally, perform initial lightweight classification based on transaction manifests or events.

**3. Data Processing (Ongoing & Weekly):**

- **Activity Classification:**
  - A separate processor (potentially triggered by Bull MQ jobs or directly by the streamer) analyzes persisted raw transactions (`Transaction` table).
  - It identifies specific activities based on manifests, events, and predefined rules (e.g., DEX swap, LP add/remove, holding transfers).
  - This requires mapping component addresses and method calls to known activities. Maintain a configurable list/ruleset for this mapping.
  - Store classified activities in the `UserActivity` table, linking them to the user, week, transaction, and including relevant metadata (e.g., USD value at time of transaction, quantity).
- **Time-Weighted Balance Calculation (Stream Method):**
  - For accounts involved in balance-affecting transactions (XRD, LSU, Stablecoins, etc.), record the balance change and the state version (or timestamp).
  - Maintain a separate table or structure to store balance snapshots per user/account/asset with timestamps/state versions.
  - At the end of the week, use these snapshots to calculate the time-weighted average balance for the period. This calculation can be complex and might require a dedicated job. Consider using database functions (like TimescaleDB extensions if applicable) or application-level logic.
- **Price Fetching:** Integrate with a reliable price oracle service to get USD values for assets at the time of transactions or for balance snapshots, where needed for points calculation or valuation.

**4. Storage:**

- Store raw matched transactions (`Transaction`).
- Store classified user activities (`UserActivity`).
- Store intermediate balance snapshots (if using stream-based balance calculation).
- Store final weekly points and multipliers (`UserWeeklyPoints`, `UserWeeklyMultipliers`).
- Store aggregated season points (`UserSeasonPoints`).

**5. Weekly Finalization (Admin Triggered):**

- Admin triggers the "Complete Week" process via the Admin Dashboard.
- A Bull MQ job is initiated.
- **Final Balance Calculation:** Calculate the definitive time-weighted average balances for all registered users for passive multipliers (XRD, LSUs) using the collected data (e.g., balance snapshots).
- **Active Points Calculation:** Sum up points from `UserActivity` records for the completed week based on configured rules (e.g., points per swap, points per USD value LP'd). Apply percentile ranking if using that methodology.
- **Multiplier Application:** Calculate the holding multiplier based on the final time-weighted balances and the S-curve configuration.
- **Total Points Calculation:** Apply the calculated multiplier to the base points (from active or passive activities, depending on the chosen model) to get `totalPoints`.
- Store final results in `UserWeeklyPoints` and `UserWeeklyMultipliers`.
- Aggregate weekly points into `UserSeasonPoints`.
- Mark the week as processed (`Week.isProcessed = true`).
- Clear intermediate/weekly data if necessary.

**6. Pros:**

- Potentially more scalable for tracking _activities_ across a large number of users, as it avoids querying each user individually.
- Provides near real-time data flow, which could power a more dynamic user dashboard (though final calculations are weekly).
- Can capture all relevant transaction details as they happen.
- Better suited for handling complex activity classification logic based on transaction manifests/events.

**7. Cons:**

- Calculating time-weighted balances _solely_ from the stream can be complex, requiring meticulous state tracking for every relevant asset and account. Missing a single transaction could lead to incorrect calculations.
- Initial setup complexity for the streamer and processing pipeline.
- Handling stream interruptions or gaps requires robust error handling and potentially reconciliation mechanisms.
- High data volume from the stream, requiring efficient filtering and storage.
- Processing historical data (Season 0) requires replaying the entire stream for the period, which can be very time-consuming and resource-intensive. Handling historical dApp/schema changes during replay is challenging.

**8. Specific Considerations:**

- **Derivatives:** Requires specific logic to identify derivative tokens (e.g., LSU LPs) and potentially query underlying asset values or use external pricing.
- **Season 0:** Very challenging due to data volume and potential historical inconsistencies. Might require parallel processing or a hybrid approach for the historical data.
- **Resilience:** Need mechanisms to handle streamer downtime and ensure no transactions are missed (e.g., persisting the last processed state version).
- **Filtering Logic:** The efficiency of the initial filtering (identifying relevant transactions/accounts) is critical.

---

## Plan 2: Gateway API Endpoint Query Approach

This approach relies on periodically querying the Radix Gateway API to fetch account balances and potentially transaction history at specific intervals (e.g., end of the week) to perform calculations.

**1. Infrastructure Setup:**

- Set up necessary database tables (as per Plan 1). Focus might shift slightly more towards storing snapshots fetched from the Gateway.
- Configure Bull MQ for scheduling and executing the data fetching and calculation jobs.
- Ensure reliable access to a Gateway API endpoint capable of handling potentially large/frequent queries.

**2. Data Acquisition (Scheduled/Triggered):**

- **Balance Fetching:**
  - At the end of the week (or potentially more frequently for dashboard updates), schedule a Bull MQ job.
  - This job queries the Gateway API's state endpoints (e.g., `/state/entity/details`, `/state/non-fungible/data`) for all registered `UserAccount` addresses.
  - To calculate time-weighted averages:
    - Query the balance at the start state version of the week.
    - Query the balance at the end state version of the week.
    - _Crucially_, query for transaction history _within_ the week for each account to identify intermediate balance changes and their corresponding state versions/timestamps. Alternatively, query balances at multiple state versions throughout the week (e.g., daily snapshots). This is the most complex part of the gateway approach for _accurate_ time-weighting.
  - Handle pagination in Gateway responses.
  - Store the fetched balance snapshots with their state versions/timestamps.
- **Activity Fetching (Optional/Hybrid):**
  - Querying transaction history via Gateway endpoints (`/stream/transactions`) for _all_ registered users to classify _active_ activities can be very inefficient and lead to high API load.
  - A hybrid approach might be better: Use the Gateway primarily for _balance_ snapshots (passive multipliers) and potentially use a _limited_ transaction stream or dApp-specific integrations to capture _active_ point-earning events. For this plan, we assume primarily Gateway usage.

**3. Data Processing (Primarily Weekly):**

- **Time-Weighted Balance Calculation (Gateway Method):**
  - Using the fetched balance snapshots (start, end, and intermediate points identified via transaction history or periodic snapshots), calculate the time-weighted average balance for the week. This involves calculating the duration each balance was held, based on state version differences.
  - Requires mapping state versions to time durations.
- **Activity Classification (Gateway Method - Limited):**
  - If fetching transaction history via Gateway, parse the manifests/events from the relevant transactions to classify activities. This is less efficient than stream processing. Store in `UserActivity`.
- **Price Fetching:** Similar to Plan 1, integrate with price oracles to get USD values when needed, likely correlating with the state versions/timestamps of fetched balances/transactions.

**4. Storage:**

- Store fetched balance snapshots.
- Store classified user activities (`UserActivity`) - potentially less comprehensive if relying solely on Gateway for activities.
- Store final weekly points and multipliers (`UserWeeklyPoints`, `UserWeeklyMultipliers`).
- Store aggregated season points (`UserSeasonPoints`).

**5. Weekly Finalization (Admin Triggered):**

- Admin triggers the "Complete Week" process.
- A Bull MQ job initiates the main data fetching and calculation sequence described in steps 2 & 3.
  - Fetch necessary balance/transaction data from Gateway API for the completed week.
  - Calculate time-weighted balances.
  - Calculate active points (potentially limited if relying solely on Gateway).
  - Calculate and apply multipliers.
  - Calculate total points.
- Store final results (`UserWeeklyPoints`, `UserWeeklyMultipliers`, `UserSeasonPoints`).
- Mark the week as processed.

**6. Pros:**

- Simpler initial infrastructure setup compared to maintaining a persistent transaction streamer.
- Potentially easier to calculate historical data (Season 0) by querying historical state versions via the Gateway (though still requires handling large data volumes and historical dApp changes).
- Less prone to issues from temporary stream interruptions (as it relies on querying state).
- Might be more straightforward for calculating _balances_ at specific points in time.

**7. Cons:**

- Calculating accurate time-weighted averages requires multiple queries or fetching transaction history, which can be very high load on the Gateway API, especially for many users. Simple start/end balance queries are insufficient.
- Less efficient for capturing and classifying _active_ transactions compared to the stream. Relying on Gateway transaction history queries for activity classification across many users is likely infeasible due to API load and query complexity.
- Scalability concerns: Querying potentially hundreds of thousands of accounts via the Gateway API weekly (or more often) might hit rate limits or performance bottlenecks.
- Provides less real-time data for the user dashboard compared to the stream approach. Dashboard data would only update after the periodic Gateway query runs.
- Dependent on Gateway API availability and performance.

**8. Specific Considerations:**

- **API Load:** This is the biggest concern. Needs careful management of query frequency, batching, and potentially coordination with Gateway operators.
- **Time-Weighting Accuracy:** The accuracy depends heavily on how intermediate balance changes are captured (transaction history polling vs. periodic snapshots). Periodic snapshots might miss short-term fluctuations.
- **Hybrid Model:** Often, a hybrid approach is best: Use the Gateway for periodic balance snapshots (easier for passive multipliers) and use the Transaction Stream _specifically_ to capture _active_, point-earning events/transactions.
- **Season 0:** Fetching historical state might be feasible but still requires careful planning regarding data volume and interpreting historical transaction formats/dApp interactions.
