type UserId = string;

interface Output {
  balance: number;
  weeklyPoints: number;
  calculatedPoints: number;
}

interface Input {
  balance: number;
  weeklyPoints: number;
}

type UserEntry = [UserId, Input];

// Constants
const B_MIN = 10_000;
const K = 15;
const Q0 = 0.18;

// Logistic multiplier function
export const computeMultiplier = (q: number): number => {
  if (q < 0.02) return 0.5;
  if (q < 0.5) return 0.5 + 2.5 / (1 + Math.exp(-K * (q - Q0)));
  return 3.0;
};

// --- Helper Functions ---

const filterAndSortEligibleUsers = (
  users: Record<UserId, Input>,
  minBalance: number
): UserEntry[] =>
  Object.entries(users)
    .filter(([, data]) => data.balance >= minBalance)
    .sort(([, dataA], [, dataB]) => dataA.balance - dataB.balance);

const calculateTotalEligibleBalance = (eligibleEntries: UserEntry[]): number =>
  eligibleEntries.reduce((sum, [, data]) => sum + data.balance, 0);

const computeMultipliersForEligibleUsers = (
  eligibleEntries: UserEntry[],
  totalEligibleBalance: number
): Map<UserId, number> => {
  const multipliers = new Map<UserId, number>();
  let cumulativeBalance = 0;

  if (totalEligibleBalance === 0) {
    return multipliers; // Return empty map if no balance
  }

  for (const [userId, data] of eligibleEntries) {
    cumulativeBalance += data.balance;
    const percentile = cumulativeBalance / totalEligibleBalance;
    const multiplier = computeMultiplier(percentile);
    multipliers.set(userId, multiplier);
  }
  return multipliers;
};

const applyCalculatedMultipliers = (
  users: Record<UserId, Input>,
  multipliers: Map<UserId, number>
): Record<UserId, Output> => {
  // Create a deep copy and cast to Output type early
  const updatedUsers: Record<UserId, Output> = {};
  for (const userId in users) {
    updatedUsers[userId] = {
      ...users[userId],
      calculatedPoints: users[userId].weeklyPoints, // Default calculated points to original
    };
  }

  for (const [userId, multiplier] of multipliers.entries()) {
    // Only apply if the user exists (eligible)
    if (updatedUsers[userId]) {
      updatedUsers[userId].calculatedPoints =
        updatedUsers[userId].weeklyPoints * multiplier;
    }
  }
  return updatedUsers;
};

// --- Composition Function ---

// Core reward calculation composed from helpers
export const applyMultipliers = (
  users: Record<UserId, Input>
): Record<UserId, Output> => {
  const eligibleEntries = filterAndSortEligibleUsers(users, B_MIN);

  // Handle cases with no eligible users early
  if (eligibleEntries.length === 0) {
    // Return a copy with calculatedPoints initialized to weeklyPoints
    const initialOutput: Record<UserId, Output> = {};
    for (const userId in users) {
      initialOutput[userId] = {
        ...users[userId],
        calculatedPoints: users[userId].weeklyPoints,
      };
    }
    return initialOutput;
  }

  const totalEligibleBalance = calculateTotalEligibleBalance(eligibleEntries);
  const multipliers = computeMultipliersForEligibleUsers(
    eligibleEntries,
    totalEligibleBalance
  );
  const updatedUsers = applyCalculatedMultipliers(users, multipliers);

  return updatedUsers;
};
