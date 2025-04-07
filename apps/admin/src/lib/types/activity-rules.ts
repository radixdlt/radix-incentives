export type ActivityType = {
  id: string;
  name: string;
  description: string;
  category: "passive" | "active";
};

export type ActivityRule = {
  id: string;
  activityTypeId: string;
  multiplierApplied: boolean;
  minimumValue: number;
  maximumValue: number | null;
  cappingRules: {
    dailyCap?: number;
    weeklyCap?: number;
  };
  isActive: boolean;
  version: number;
  createdAt: Date;
};

export type WeeklyRuleSet = {
  id: string;
  weekNumber: number;
  seasonNumber: number;
  effectiveFrom: Date;
  effectiveTo: Date;
  rules: ActivityRule[];
  createdAt: Date;
  createdBy: string;
  status: "draft" | "published" | "archived";
};

// Sample data for UI development
export const SAMPLE_ACTIVITY_TYPES: ActivityType[] = [
  {
    id: "holding-xrd",
    name: "Holding XRD",
    description: "Points earned for holding XRD tokens",
    category: "passive",
  },
  {
    id: "staking-lsu",
    name: "Staking (LSUs)",
    description: "Points earned for staking XRD via LSUs",
    category: "passive",
  },
  {
    id: "liquidity-provision",
    name: "Liquidity Provision",
    description: "Points earned for providing liquidity (LSULP)",
    category: "passive",
  },
  {
    id: "hold-stables",
    name: "Holding Stable Assets",
    description: "Points earned for holding stablecoins",
    category: "passive",
  },
  {
    id: "hold-nfts",
    name: "Hold NFTs",
    description: "Points earned for holding NFTs",
    category: "passive",
  },
  {
    id: "dex-trading",
    name: "DEX Trading",
    description: "Points earned for trading on DEXs",
    category: "active",
  },
  {
    id: "lending-borrowing",
    name: "Lending & Borrowing",
    description: "Points earned for lending and borrowing activities",
    category: "active",
  },
];

export const SAMPLE_RULES: ActivityRule[] = [
  {
    id: "1",
    activityTypeId: "holding-xrd",
    multiplierApplied: true,
    minimumValue: 50,
    maximumValue: null,
    cappingRules: {},
    isActive: true,
    version: 1,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "2",
    activityTypeId: "staking-lsu",
    multiplierApplied: true,
    minimumValue: 50,
    maximumValue: null,
    cappingRules: {},
    isActive: true,
    version: 1,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "3",
    activityTypeId: "liquidity-provision",
    multiplierApplied: true,
    minimumValue: 50,
    maximumValue: null,
    cappingRules: {},
    isActive: true,
    version: 1,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "4",
    activityTypeId: "dex-trading",
    multiplierApplied: true,
    minimumValue: 10,
    maximumValue: null,
    cappingRules: {
      dailyCap: 1000,
      weeklyCap: 5000,
    },
    isActive: true,
    version: 1,
    createdAt: new Date("2025-01-01"),
  },
];

export const SAMPLE_WEEKLY_RULESET: WeeklyRuleSet = {
  id: "1",
  weekNumber: 1,
  seasonNumber: 1,
  effectiveFrom: new Date("2025-01-01"),
  effectiveTo: new Date("2025-01-07"),
  rules: SAMPLE_RULES,
  createdAt: new Date("2024-12-15"),
  createdBy: "admin",
  status: "published",
};

export const SAMPLE_WEEKLY_RULESETS: WeeklyRuleSet[] = [
  SAMPLE_WEEKLY_RULESET,
  {
    id: "2",
    weekNumber: 2,
    seasonNumber: 1,
    effectiveFrom: new Date("2025-01-08"),
    effectiveTo: new Date("2025-01-14"),
    rules: SAMPLE_RULES.map((rule) => ({
      ...rule,
      id: `${rule.id}-w2`,
      version: rule.id === "4" ? 2 : 1,
    })),
    createdAt: new Date("2025-01-05"),
    createdBy: "admin",
    status: "published",
  },
  {
    id: "3",
    weekNumber: 3,
    seasonNumber: 1,
    effectiveFrom: new Date("2025-01-15"),
    effectiveTo: new Date("2025-01-21"),
    rules: SAMPLE_RULES.map((rule) => ({
      ...rule,
      id: `${rule.id}-w3`,
      version: rule.id === "4" ? 3 : 1,
      cappingRules:
        rule.id === "4"
          ? { dailyCap: 1200, weeklyCap: 6000 }
          : rule.cappingRules,
    })),
    createdAt: new Date("2025-01-12"),
    createdBy: "admin",
    status: "draft",
  },
];
