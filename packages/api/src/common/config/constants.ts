export const Thresholds = {
  XRD_BALANCE_THRESHOLD: 50, //value is in USD value
  ACTIVITY_POINTS_THRESHOLD: 1, //average USD value over the week (after rebase)
  ACCOUNT_INACTIVITY_THRESHOLD: 1, // Minimum XRD value in USD to keep snapshots enabled
} as const;
