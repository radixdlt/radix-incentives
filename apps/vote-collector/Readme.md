Vote collector is run locally against the all the votes from consulation environment. Below are the steps to follow 


To run the vote collector, follow these steps:

1. **Download Data**: 
   - Download data from the consultation table where `consultation_id` is equal to the consultation for which you want to generate voting results.
   - Store this file in the `apps/vote-collector/src/data` directory. This directory is git-ignored and should not be committed.

2. **Set Up Database**:
   - Bring up a local PostgreSQL or a PostgreSQL instance where you want to store the snapshot results.

3. **Export Environment Variables**:
   - Navigate to the `apps/vote-collector` directory and export the following environment variables:
     ```bash
     # Change the below uri appropriately for your setup
     export DATABASE_URL="postgresql://postgres:password@localhost:5432/hyperlane-consultation"
     ```
     - Replace the database and URI details appropriately.
     ```bash
     export START_DATE="2025-07-16T00:00:00.000Z"
     export END_DATE="2025-07-21T14:22:00.000Z"
     export GATEWAY_URL="http://localhost:8080"
     ```
     - This port-forwarded gateway endpoint should be one that isn't throttled.
     ```bash
     export ACCOUNTS_FILE_PATH="./data/hyperlane-consultation-accounts"
     ```

4. **Generate Snapshots**:
   - Run `pnpm dev` to generate snapshots and then eventually calculate the TWAP values of XRD holding and the corresponding voted option into a CSV file.
   - Snapshotting takes while and might fail sometimes . In that change the START_DATE env variable to the last snapshot that got completed. The job is idempotent and you can choose run it from begining if required



