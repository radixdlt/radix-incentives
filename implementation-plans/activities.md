# Activities

## 1. Holdings

### ✅ 1.1 Holding XRD or Staking (LSUs) weighted by time

- **Type**: Passive
- **Reward Type**: Multiplier
- **Priority**: High
- **Assets**: XRD, LSU
- **Rules**:
  - Calculate multiplier based on total USD value (XRD + LSUs) via S-curve.
    - Config: S-curve parameters ($5k-$100k range, max 3x).
  - User must meet minimum holding duration to qualify for the full multiplier.
    - Config: Min holding duration (e.g., 24h).
  - Enforce eligibility ($50 USD minimum).
    - Config: Min eligibility value.
  - Track balance changes between start and end date.

### ✅ 1.2 Bridging/holding stable assets (xUSDC, xUSDT)

- **Type**: Passive
- **Reward Type**: Points
- **Priority**: High
- **Assets:** xUSDC, xUSDT
- **Rules**:
  - Award points based on time-weighted average USD value held.
  - Distribute weekly points pool proportionally.
  - Config: Weekly points pool size.
  - Set minimum average holding (e.g., $100 USD).
  - Config: Minimum holding value.
  - Requires balance tracking.

## 2. Trading

### ✅ 2.1 Trading volume in bluechip volatiles (xBTC, xETH)

- **Type**: Active
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Award points based on total weekly USD volume traded.
  - Minimum transaction value (e.g., $10 USD).
  - Weekly points pool size, list of recognized bluechip volatile tokens.
  - Minimum transaction value.
- **Tracking**:
  - transactions that includes `swap` events

### ✅ 2.2 Trading volume in stables (USDC, USDT)

- **Type**: Active
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Similar to bluechip volatile trading.
  - Config: Weekly points pool size, minimum transaction value, diminishing returns parameters (optional).

### ✅ 2.3 Trading volume in XRD

- **Type**: Active
- **Reward Type**: Points (Moderate Priority)
- **Rules**:
  - Similar to stablecoin trading.
  - Config: Weekly points pool size, minimum transaction value, diminishing returns parameters (optional).

### ✅ 2.4 Liquidity in bluechip volatiles

- **Type**: Passive (Providing)
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Award points based on time-weighted average USD value of LP provided.
  - Distribute weekly points pool proportionally.
  - Config: Weekly points pool size, list of recognized bluechip pools.
  - Set minimum average LP value (e.g., $200 USD).
  - Config: Minimum LP value.
  - Requires LP token tracking.
  - _(Optional: Active points for Add/Remove actions)._

### ✅ 2.5 Liquidity in stables

- **Type**: Passive (Providing)
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Similar to bluechip volatile liquidity.
  - Config: Weekly points pool size, list of recognized stable pools, minimum LP value.

### 2.6 Trading volume in (specific) Radix native assets

- **Type**: Active
- **Reward Type**: Points (Moderate Priority)
- **Rules**:
  - Similar to other trading volume activities.
  - Requires a configurable list of recognized native tokens.
  - Config: Weekly points pool size, list of native token addresses, minimum transaction value.

### 2.7 Liquidity in (specific) Radix native assets

- **Type**: Passive (Providing)
- **Reward Type**: Points (Moderate Priority)
- **Rules**:
  - Similar to other liquidity provision.
  - Requires a configurable list of recognized native pools.
  - Config: Weekly points pool size, list of native pool addresses, minimum LP value.

### Total DEX swaps of any types

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award small points per swap above minimum value OR per unique pair traded weekly.
  - Cap points per user per week.
  - Config: Points per swap/unique pair, minimum swap value (e.g., $5 USD), max points/user/week.

## 3. Lending & Borrowing

### 3.1 Lend XRD/LSU

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Award points based on time-weighted average USD value supplied.
  - Distribute weekly points pool proportionally (separate pool for XRD/LSU).
  - Config: Points pool size, list of recognized protocols/assets.
  - Set minimum average lent value (e.g., $100 USD).
  - Config: Minimum lent value.
  - Requires tracking supplied balances.
  - _(Optional: Active points for Initiate Lend actions)._

### 3.2 Lend stables

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Similar to Lend XRD/LSU, separate points pool.
  - Config: Points pool size, recognized protocols/assets, minimum lent value.

### 3.3 Lend blue chip volatiles

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Similar to Lend XRD/LSU, separate points pool.
  - Config: Points pool size, recognized protocols/assets, minimum lent value.

### 3.4 Borrow XRD/LSU

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority, lower weight than lending)
- **Rules**:
  - Award points based on time-weighted average USD value borrowed.
  - Distribute weekly points pool proportionally (separate, smaller pool than lending).
  - Config: Points pool size (lower than lending), recognized protocols/assets.
  - Set minimum average borrowed value (e.g., $100 USD).
  - Config: Minimum borrowed value.
  - Consider minimum health factor requirement (optional).
  - Config: Minimum health factor (optional).
  - Requires tracking borrowed balances.
  - _(Optional: Active points for Initiate Borrow actions)._

### 3.5 Borrow stables

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority, lower weight than lending)
- **Rules**:
  - Similar to Borrow XRD/LSU, separate points pool.
  - Config: Points pool size (lower than lending), recognized protocols/assets, minimum borrowed value, minimum health factor (optional).

### 3.6 Borrow blue chip volatiles

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority, lower weight than lending)
- **Rules**:
  - Similar to Borrow XRD/LSU, separate points pool.
  - Config: Points pool size (lower than lending), recognized protocols/assets, minimum borrowed value, minimum health factor (optional).

## 4. NFTs

### 4.1 Hold NFTs

- **Type**: Passive
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award points for holding NFTs from a whitelisted collection (time-weighted).
  - Points per NFT or per unique collection.
  - Config: Weekly points pool size, list of whitelisted collections, calculation method, time-weighting params.

### 4.2 Trade NFT collections

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award points based on USD volume of trades (whitelisted collections, recognized marketplaces).
  - Distribute weekly points pool proportionally.
  - Config: Weekly points pool size, list of collections, list of marketplaces, minimum trade value (e.g., $5 USD).

### ❌ 4.3 Hold % of collections

- _(Skip - Too complex/gameable)_

### 4.4 List NFTs

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award small fixed points for listing (whitelisted collection, recognized marketplace).
  - Cap points per user per week.
  - Consider minimum listing duration (optional).
  - Config: Points per listing, list of collections, list of marketplaces, max points/user/week, min duration (optional).

### 4.5 Mint NFTs (unsure on this one)

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award points only for minting from specific, whitelisted mints. Use sparingly.
  - Config: Points per mint, list of whitelisted mint contracts.

## 5. Tokens

### 5.1 Hold specific tokens

- **Type**: Passive
- **Reward Type**: Points (Low Priority unless specified)
- **Rules**:
  - Award points based on time-weighted average balance (value or quantity) of whitelisted tokens.
  - Distribute points pool proportionally.
  - Config: Weekly points pool size, list of whitelisted tokens, min holding value/quantity.

### 5.2 Hold certain amounts of specific tokens

- _(Covered by minimums in "Hold specific tokens")_

### 5.3 Hold multiple specific tokens

- **Type**: Passive
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award bonus points for holding minimum number (e.g., 3+) of _different_ whitelisted tokens (each above its threshold).
  - Config: Bonus points amount, list of whitelisted tokens, min number of different tokens required.

### 5.4 Mint tokens

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Avoid generally. Use only for specific, whitelisted token generation events.
  - Config: Points per mint, specific TGE contract/identifier.

### 5.5 Hold X USD Value of any combination of tokens

- _(Skip - Complex/overlaps)_

## 6. dApp Usage

### 6.1 Use specific dApps

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award points for transactions interacting with whitelisted dApp components.
  - Cap points per dApp per user per week.
  - Config: Points per interaction, list of whitelisted component addresses, max points/dApp/user/week.

### 6.2 First time use specific dApps

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award one-time bonus points for first interaction with a whitelisted dApp during the season.
  - Requires tracking first interaction per user/dApp/season.
  - Config: Bonus points amount, list of whitelisted component addresses.

### 6.3 Use multiple dApps

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award bonus points for interacting with minimum number (e.g., 3+) of _different_ whitelisted dApps within a week.
  - Config: Bonus points amount, list of whitelisted component addresses, min number of different dApps required.

### 6.4 Make user-initiated transactions

- _(Skip - Too broad)_

### 6.5 Make user-initiated transactions across multiple dapps

- _(Skip - Covered by "Use multiple dApps")_
