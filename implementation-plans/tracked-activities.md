# Tracked Activities

## Holdings

### Holding XRD or Staking (LSUs) weighted by time

- **Type**: Passive
- **Reward Type**: Multiplier (Core mechanic)
- **Rules**:
  - Calculate multiplier based on total USD value (XRD + LSUs) via S-curve.
  - Config: S-curve parameters ($5k-$100k range, max 3x).
  - Apply time-weighting (min holding period, scaling period).
  - Config: Min holding duration (e.g., 7 days), scaling duration (e.g., 4 weeks).
  - Enforce eligibility ($50 USD minimum).
  - Config: Min eligibility value.
  - Requires balance tracking (snapshots or stream).

### Bridging/holding stable assets (xUSDC, xUSDT)

- **Type**: Passive
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Award points based on time-weighted average USD value held.
  - Distribute weekly points pool proportionally.
  - Config: Weekly points pool size.
  - Set minimum average holding (e.g., $100 USD).
  - Config: Minimum holding value.
  - Requires balance tracking.

## Trading

### Trading volume in bluechip volatiles (xBTC, xETH)

- **Type**: Active
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Award points based on total weekly USD volume traded.
  - Minimum transaction value (e.g., $10 USD).
  - Weekly points pool size, list of recognized bluechip volatile tokens.
  - Minimum transaction value.
- **Tracking**:
  - transactions that includes `swap` events

### Trading volume in stables (USDC, USDT)

- **Type**: Active
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Similar to bluechip volatile trading.
  - Config: Weekly points pool size, minimum transaction value, diminishing returns parameters (optional).

### Trading volume in XRD

- **Type**: Active
- **Reward Type**: Points (Moderate Priority)
- **Rules**:
  - Similar to stablecoin trading.
  - Config: Weekly points pool size, minimum transaction value, diminishing returns parameters (optional).

### Liquidity in bluechip volatiles

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

### Liquidity in stables

- **Type**: Passive (Providing)
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Similar to bluechip volatile liquidity.
  - Config: Weekly points pool size, list of recognized stable pools, minimum LP value.

### Trading volume in (specific) Radix native assets

- **Type**: Active
- **Reward Type**: Points (Moderate Priority)
- **Rules**:
  - Similar to other trading volume activities.
  - Requires a configurable list of recognized native tokens.
  - Config: Weekly points pool size, list of native token addresses, minimum transaction value.

### Liquidity in (specific) Radix native assets

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

## Lending & Borrowing

### Lend XRD/LSU

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

### Lend stables

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Similar to Lend XRD/LSU, separate points pool.
  - Config: Points pool size, recognized protocols/assets, minimum lent value.

### Lend blue chip volatiles

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority)
- **Rules**:
  - Similar to Lend XRD/LSU, separate points pool.
  - Config: Points pool size, recognized protocols/assets, minimum lent value.

### Borrow XRD/LSU

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

### Borrow stables

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority, lower weight than lending)
- **Rules**:
  - Similar to Borrow XRD/LSU, separate points pool.
  - Config: Points pool size (lower than lending), recognized protocols/assets, minimum borrowed value, minimum health factor (optional).

### Borrow blue chip volatiles

- **Type**: Passive (Maintaining position)
- **Reward Type**: Points (High Priority, lower weight than lending)
- **Rules**:
  - Similar to Borrow XRD/LSU, separate points pool.
  - Config: Points pool size (lower than lending), recognized protocols/assets, minimum borrowed value, minimum health factor (optional).

## NFTs

### Hold NFTs

- **Type**: Passive
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award points for holding NFTs from a whitelisted collection (time-weighted).
  - Points per NFT or per unique collection.
  - Config: Weekly points pool size, list of whitelisted collections, calculation method, time-weighting params.

### Trade NFT collections

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award points based on USD volume of trades (whitelisted collections, recognized marketplaces).
  - Distribute weekly points pool proportionally.
  - Config: Weekly points pool size, list of collections, list of marketplaces, minimum trade value (e.g., $5 USD).

### Hold % of collections

- _(Skip - Too complex/gameable)_

### List NFTs

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award small fixed points for listing (whitelisted collection, recognized marketplace).
  - Cap points per user per week.
  - Consider minimum listing duration (optional).
  - Config: Points per listing, list of collections, list of marketplaces, max points/user/week, min duration (optional).

### Mint NFTs (unsure on this one)

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award points only for minting from specific, whitelisted mints. Use sparingly.
  - Config: Points per mint, list of whitelisted mint contracts.

## Tokens

### Hold specific tokens

- **Type**: Passive
- **Reward Type**: Points (Low Priority unless specified)
- **Rules**:
  - Award points based on time-weighted average balance (value or quantity) of whitelisted tokens.
  - Distribute points pool proportionally.
  - Config: Weekly points pool size, list of whitelisted tokens, min holding value/quantity.

### Hold certain amounts of specific tokens

- _(Covered by minimums in "Hold specific tokens")_

### Hold multiple specific tokens

- **Type**: Passive
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award bonus points for holding minimum number (e.g., 3+) of _different_ whitelisted tokens (each above its threshold).
  - Config: Bonus points amount, list of whitelisted tokens, min number of different tokens required.

### Mint tokens

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Avoid generally. Use only for specific, whitelisted token generation events.
  - Config: Points per mint, specific TGE contract/identifier.

### Hold X USD Value of any combination of tokens

- _(Skip - Complex/overlaps)_

## dApp Usage

### Use specific dApps

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award points for transactions interacting with whitelisted dApp components.
  - Cap points per dApp per user per week.
  - Config: Points per interaction, list of whitelisted component addresses, max points/dApp/user/week.

### First time use specific dApps

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award one-time bonus points for first interaction with a whitelisted dApp during the season.
  - Requires tracking first interaction per user/dApp/season.
  - Config: Bonus points amount, list of whitelisted component addresses.

### Use multiple dApps

- **Type**: Active
- **Reward Type**: Points (Low Priority)
- **Rules**:
  - Award bonus points for interacting with minimum number (e.g., 3+) of _different_ whitelisted dApps within a week.
  - Config: Bonus points amount, list of whitelisted component addresses, min number of different dApps required.

### Make user-initiated transactions

- _(Skip - Too broad)_

### Make user-initiated transactions across multiple dapps

- _(Skip - Covered by "Use multiple dApps")_
