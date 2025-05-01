# User Consultation Voting Power Calculation Plan

This plan outlines the steps to calculate user voting power for community consultations based on specified asset holdings and priorities.

1.  **Identify Data Sources & Contracts:**

    - **Fungible tokens:**
      - ✅ Direct XRD balances (`Prio 1`)
      - ✅ Direct LSU balances (`Prio 1`)
      - ✅ Direct LSULP balances (`Prio 1`)
    - **DEX Contracts (e.g., Caviar9, Ociswap, DefiPlaza):**
      - CaviarNine
        - Shape liquidity pools
          - ❌ [LSULP:XRD](https://www.caviarnine.com/earn/shape-liquidity/pool/component_rdx1crdhl7gel57erzgpdz3l3vr64scslq4z7vd0xgna6vh5fq5fnn9xas) (`Prio 2`)
          - ❌ [wxBTC:XRD](https://www.caviarnine.com/earn/shape-liquidity/pool/component_rdx1cp9w8443uyz2jtlaxnkcq84q5a5ndqpg05wgckzrnd3lgggpa080ed) (`Prio 3`)
          - ❌ [xUSDC:XRD](https://www.caviarnine.com/earn/shape-liquidity/pool/component_rdx1cr6lxkr83gzhmyg4uxg49wkug5s4wwc3c7cgmhxuczxraa09a97wcu) (`Prio 3`)
    - **Lending Protocol Contracts (e.g., Root Finance, Weft Finance):**
      - Root finance
        - ✅ LSULP deposited (`Prio 2`)
        - ✅ XRD deposited (`Prio 3`)
      - WEFT
        - XRD deposited in Weft (`Prio 3`)

2.  **Snapshot Mechanism:**

    - **Trigger:** A background job (using Bull MQ) will be triggered at a specific snapshot time or block height, configured by an administrator for each consultation (PRD 3.2.8, 3.1.6).
    - **Data Collection:** The job iterates through participating users and their linked accounts. For each account, it queries all relevant data sources (from Step 1) to fetch asset balances _at the exact snapshot time/block_.

3.  **Valuation Conversion (at Snapshot Time):**

    - Develop functions to convert each asset balance into its equivalent XRD value _at the snapshot time_.
    - **XRD:** 1:1 value.
    - **LSU:** Query validator component state (Gateway API) _at the snapshot time/block_ for the XRD redemption rate.
      ```
      XRD_Value = LSU_Balance * Redemption_Rate_At_Snapshot
      ```
    - **LSULP (Direct Holding & Lending - Historic Value):** Use the Gateway API `state_entity_details` endpoint _at the snapshot time/block_ for the specific LSULP pool component (e.g., `component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp`) and the LSULP resource (e.g., `resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf`).

      - Extract `dex_valuation_xrd` from the pool component's state.
      - Extract `total_supply` from the LSULP resource's state.

      ```
      XRD_per_LSULP_Historic = dex_valuation_xrd_At_Snapshot / total_supply_At_Snapshot
      XRD_Value = LSULP_Balance * XRD_per_LSULP_Historic
      ```

      _(Note: This uses an internal cached value `dex_valuation_xrd`, providing a close approximation)._

      ```
      how do i get the historic value of LSULP?

      actually there's a hack you can do... It's not perfect perfect but very close

      lsu_pool = "component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp"
      lsulp_token = "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf"

      call state_entity_details on both and find:
      1️⃣ dex_valuation_xrd from the lsu_pool
      2️⃣ and the total_supply from the lsulp_token

      Then the historic price is 1 LSULP = dex_valuation_xrd/total_supply

      The reason this is a HACK is because the dex_valuation_xrd is an internal cached value, but it's so close it's good enough!
      ```

    - **LP Tokens (LSULP:XRD, wxBTC:XRD):** Query the specific DEX pool contract state (Gateway API) _at the snapshot time/block_ for user/total LP tokens and XRD reserves.
      ```
      User_Pool_Share_At_Snapshot = User_LP_Tokens_At_Snapshot / Total_LP_Tokens_At_Snapshot
      XRD_Value = User_Pool_Share_At_Snapshot * Pool_XRD_Reserves_At_Snapshot
      ```
    - **XRD (Lending):** Query the lending contract state (Gateway API) _at the snapshot time/block_ for the deposited amount. Value is 1:1.

4.  **Voting Power Calculation:**

    - For each user, sum the calculated XRD-equivalent values from _all_ tracked assets across _all_ priority levels and _all_ linked accounts obtained during the snapshot.
      ```
      Total_Voting_Power = Sum(XRD_Value_Asset1) + Sum(XRD_Value_Asset2) + ...
      ```
    - _Note:_ Initially assumes a simple summation across priorities (P1+P2+P3). Explicit weighting can be added later via admin configuration if needed (PRD 3.1.6).

5.  **Data Storage:**

    - Create a new database table (e.g., `userConsultationSnapshot`).
    - **Fields**: `id`, `userId`, `consultationId`, `snapshotTimestamp` (or `snapshotBlockHeight`), `calculatedVotingPower`, `assetBreakdown` (JSON, optional).

6.  **API Endpoint:**

    - Create a protected tRPC query (e.g., `consultation.getVotingPower`).
    - **Input:** `consultationId`.
    - **Action:** Retrieves the pre-calculated `calculatedVotingPower` for the authenticated user and the given consultation from the `userConsultationSnapshot` table.

7.  **Admin Configuration:**

    - Enhance the Admin Dashboard (Section 3.2.8) to allow:
      - Defining consultations (question, options, dates).
      - Specifying snapshot time/block height.
      - Configuring asset types and contract/component/resource addresses for calculation per consultation.

8.  **Frontend Display:**
    - The User Dashboard's Community Consultation section (PRD 5.2.5) will use the `consultation.getVotingPower` tRPC query to display the user's voting power for the viewed consultation.
