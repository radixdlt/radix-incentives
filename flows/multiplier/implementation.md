# Multiplier implementation

## Flow

### **Find accounts**

- Get list of accounts eligible for airdrop

> - include all accounts and filter on eligibility later?
> - pros & cons?

### **Find transactions**

- Get all transactions that updates account balance within startDate and endDate (week interval):
  - Tokens
    - XRD
    - LSU
    - Derivatives (TBD)
  - Q: Ask gateway owner, query Network Gateway DB directly or use available network gateway API?

### **Process data**

- Calculate
  - TWA denominated in USD
  - output multiplier based on S-curve formula
    - do we want to be able to adjust this formula on a per-week basis?
