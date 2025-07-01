# 🔗 Connect & View Linked Accounts

## User Story

As a Radix user, I want to enroll in the incentives program and connect multiple accounts to earn points across all my wallets with a unified dashboard view.

## Acceptance Criteria

- Users can access enrollment page and connect one or many account(s) via Radix Connect with ROLA verification
- Users can link additional accounts
- Dashboard displays all linked accounts
- Verify that account has been created on-ledger (ie not a virtual account)

## Technical Considerations

- Radix-dApp-toolkit integration
- ROLA verification flow for each account
- Responsive design with proper error handling

## Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant Backend
    participant RadixWallet

    User->>Dashboard: Access enrollment page
    User->>Dashboard: Connect account
    Dashboard->>Backend: Request ROLA challenge
    Backend-->>Dashboard: Return challenge
    Dashboard->>RadixWallet: Request connection + challenge
    RadixWallet->>User: Request approval
    User->>RadixWallet: Approve connection
    RadixWallet->>Dashboard: Return ROLA proof
    Dashboard->>Backend: Verify proof + check balance
    
    alt Eligible Account
        Backend-->>Dashboard: Account verified
        Dashboard->>User: Show success + account list
    else Ineligible Account
        Backend-->>Dashboard: Account verified but ineligible
        Dashboard->>User: Show guidance to meet requirements
    end

    User->>Dashboard: Link additional account (repeat flow)
    User->>Dashboard: Manage accounts (view/add)
```


