import type { ActivityCategoryId, ActivityId } from 'data';
import { type InferSelectModel, relations } from 'drizzle-orm';
import {
  boolean,
  char,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => name);

export const challenge = createTable('challenge', {
  challenge: char('challenge', { length: 64 })
    .primaryKey()
    .$defaultFn(() =>
      Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    ),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const users = createTable(
  'user',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identityAddress: varchar('identity_address', { length: 255 })
      .unique()
      .notNull(),
    label: varchar('label', { length: 255 }),
    referralCode: varchar('referral_code', { length: 6 }).unique(),
    referredBy: uuid('referred_by'),
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    email: varchar('email', { length: 255 }),
  },
  (table) => ({
    referredByIdx: index('referred_by_idx').on(table.referredBy),
  }),
);

export const user = users;

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  referredBy: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}));

export const sessions = createTable('session', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp('expires_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accounts = createTable('account', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  address: varchar('address', { length: 255 }).notNull().primaryKey(),
  label: varchar('label', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  snapshotEnabled: boolean('snapshot_enabled').default(true).notNull(),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  'verification_token',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// Enums (Define possible string values for enum columns)
export const seasonStatusEnum = pgEnum('season_status', [
  'upcoming',
  'active',
  'completed',
]);
export const activityWeekStatusEnum = pgEnum('activity_week_status', [
  'active',
  'inactive',
]);

// Season Table
export const seasons = createTable('season', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  status: seasonStatusEnum('status').notNull().default('upcoming'),
  config: jsonb('config').notNull().default({}),
});

export const seasonsRelations = relations(seasons, ({ many }) => ({
  weeks: many(weeks),
}));

// Week Table
export const weeks = createTable('week', {
  id: uuid('id').primaryKey().defaultRandom(),
  seasonId: uuid('season_id')
    .notNull()
    .references(() => seasons.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  endDate: timestamp('end_date', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  processed: boolean('processed').notNull().default(false),
});

export const weeksRelations = relations(weeks, ({ one, many }) => ({
  season: one(seasons, { fields: [weeks.seasonId], references: [seasons.id] }),
  activityWeeks: many(activityWeeks),
}));

export const activityCategories = createTable('activity_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  dappIds: jsonb('dapp_ids').$defaultFn(() => []),
  showOnEarnPage: boolean('show_on_earn_page').notNull().default(true),
  multiplier: boolean('multiplier').notNull().default(false),
  icon: text('icon').default('FileText'),
  color: text('color').default('bg-slate-500/10 text-slate-600'),
});

export const dapps = createTable('dapp', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  website: text('website').notNull(),
  description: text('description'),
  longDescription: text('long_description'),
  tags: jsonb('tags').$defaultFn(() => []),
  resources: jsonb('resources').$defaultFn(() => []),
  showOnEarnPage: boolean('show_on_earn_page').notNull().default(true),
});

export const dappsRelations = relations(dapps, ({ many }) => ({
  activities: many(activities),
}));

// Activity Table
export const activities = createTable('activity', {
  id: text('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  category: text('category')
    .notNull()
    .references(() => activityCategories.id, { onDelete: 'cascade' }),
  dapp: text('dapp').references(() => dapps.id),
  componentAddresses: jsonb('component_addresses').$defaultFn(() => []),
  data: jsonb('data').$defaultFn(() => ({})),
});

export const activitiesRelations = relations(activities, ({ many, one }) => ({
  activityWeeks: many(activityWeeks),
  activityCategories: one(activityCategories, {
    fields: [activities.category],
    references: [activityCategories.id],
  }),
  dapp: one(dapps, {
    fields: [activities.dapp],
    references: [dapps.id],
  }),
}));

// ActivityWeek Junction Table
export const activityWeeks = createTable(
  'activity_week',
  {
    activityId: text('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'cascade' }),
    weekId: uuid('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    multiplier: decimal('multiplier', { precision: 18, scale: 6 })
      .notNull()
      .default('1'),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: 'activity_week_pk',
        columns: [table.activityId, table.weekId],
      }),
    };
  },
);

export const activityWeeksRelations = relations(activityWeeks, ({ one }) => ({
  activity: one(activities, {
    fields: [activityWeeks.activityId],
    references: [activities.id],
  }),
  week: one(weeks, { fields: [activityWeeks.weekId], references: [weeks.id] }),
}));

export const activityCategoryWeeks = createTable(
  'activity_category_weeks',
  {
    activityCategoryId: text('activity_category_id')
      .notNull()
      .references(() => activityCategories.id, { onDelete: 'cascade' }),
    weekId: uuid('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    pointsPool: integer('points_pool').notNull(),
    lowerBoundsPercentage: decimal('lower_bounds_percentage')
      .notNull()
      .default('0.1'),
    outlierThresholdPercentage: decimal('outlier_threshold_percentage')
      .notNull()
      .default('0.05'),
    enableOutlierDetection: boolean('enable_outlier_detection')
      .notNull()
      .default(false),
  },
  (table) => ({
    pk: primaryKey({
      name: 'activity_category_week_pk',
      columns: [table.weekId, table.activityCategoryId],
    }),
  }),
);

export const activityCategoryWeeksRelations = relations(
  activityCategoryWeeks,
  ({ one }) => ({
    activityCategory: one(activityCategories, {
      fields: [activityCategoryWeeks.activityCategoryId],
      references: [activityCategories.id],
    }),
    week: one(weeks, {
      fields: [activityCategoryWeeks.weekId],
      references: [weeks.id],
    }),
  }),
);

// UserActivity Table
export const events = createTable(
  'event',
  {
    transactionId: text('transaction_id').notNull(),
    eventIndex: integer('event_index').notNull(),
    dApp: text('dApp').notNull(),
    stateVersion: integer('state_version').notNull(),
    timestamp: timestamp('timestamp', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    globalEmitter: text('global_emitter').notNull(),
    packageAddress: text('package_address').notNull(),
    blueprint: text('blueprint').notNull(),
    eventName: text('event_name').notNull(),
    eventData: jsonb('event_data').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.transactionId, table.eventIndex] }),
  }),
);

export const snapshotStatusEnum = pgEnum('snapshot_status', [
  'not_started',
  'processing',
  'completed',
  'failed',
]);

export const snapshots = createTable('snapshot', {
  id: uuid('id').primaryKey().defaultRandom(),
  timestamp: timestamp('timestamp', {
    mode: 'date',
    withTimezone: true,
  }),
  status: snapshotStatusEnum('status').notNull().default('not_started'),
  updatedAt: timestamp('updated_at', {
    mode: 'date',
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const accountBalances = createTable(
  'account_balances',
  {
    timestamp: timestamp('timestamp', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    accountAddress: varchar('account_address', { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: 'cascade' }),
    data: jsonb('data').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.accountAddress, table.timestamp],
    }),
    // Note: Indexes will be created per partition, not on the main table
    timestampIdx: index('idx_account_balances_timestamp').on(table.timestamp),
    accountIdx: index('idx_account_balances_account').on(table.accountAddress),
  }),
);

export const accountActivityPoints = createTable(
  'account_activity_points',
  {
    accountAddress: varchar('account_address', { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: 'cascade' }),
    weekId: uuid('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    activityId: text('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'cascade' }),
    activityPoints: decimal('activity_points', {
      precision: 18,
      scale: 6,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.accountAddress, table.weekId, table.activityId],
    }),
  }),
);

export const accountActivityPointsRelations = relations(
  accountActivityPoints,
  ({ one }) => ({
    account: one(accounts, {
      fields: [accountActivityPoints.accountAddress],
      references: [accounts.address],
    }),
    week: one(weeks, {
      fields: [accountActivityPoints.weekId],
      references: [weeks.id],
    }),
    activity: one(activities, {
      fields: [accountActivityPoints.activityId],
      references: [activities.id],
    }),
  }),
);

export const userSeasonPoints = createTable(
  'user_season_points',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    weekId: uuid('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    points: decimal('points', { precision: 18, scale: 6 }).notNull(),
    referralPoints: decimal('referral_points', {
      precision: 18,
      scale: 6,
    }),
    data: jsonb('data'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.seasonId, table.weekId] }),
  }),
);

export const seasonPointsMultiplier = createTable(
  'season_points_multiplier',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    weekId: uuid('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    multiplier: decimal('multiplier', { precision: 18, scale: 2 }).notNull(),
    cumulativeTWABalance: decimal('cumulative_twa_balance', {
      precision: 18,
      scale: 2,
    }).notNull(),
    totalTWABalance: decimal('total_twa_balance', {
      precision: 18,
      scale: 2,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.weekId] }),
  }),
);

export const transactionFees = createTable(
  'transaction_fees',
  {
    transactionId: text('transaction_id').notNull(),
    accountAddress: varchar('account_address', { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: 'cascade' }),
    fee: decimal('fee', { precision: 18, scale: 2 }).notNull(),
    timestamp: timestamp('timestamp', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.timestamp, table.accountAddress, table.transactionId],
    }),
  }),
);

export const componentCalls = createTable(
  'component_calls',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    data: jsonb('data').notNull(),
    timestamp: timestamp('timestamp', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.timestamp],
    }),
  }),
);

export const tradingVolume = createTable(
  'trading_volume',
  {
    accountAddress: varchar('account_address', { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    data: jsonb('data').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.timestamp, table.accountAddress],
    }),
  }),
);

export const config = createTable('config', {
  key: varchar('key', { length: 255 }).primaryKey(),
  value: jsonb('value').notNull(),
});

export const componentWhitelist = createTable(
  'component_whitelist',
  {
    componentAddress: varchar('component_address', {
      length: 255,
    }).primaryKey(),
  },
  (table) => ({
    componentAddressIdx: index('idx_component_whitelist_address').on(
      table.componentAddress,
    ),
  }),
);

export const userSeasonBonuses = createTable(
  'user_season_bonuses',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    seasonBonus: decimal('season_bonus', { precision: 10, scale: 6 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.seasonId] }),
    userIdIdx: index('idx_user_season_bonuses_user_id').on(table.userId),
    seasonIdIdx: index('idx_user_season_bonuses_season_id').on(table.seasonId),
  }),
);

// Leaderboard pre-aggregation tables
export const seasonLeaderboardCache = createTable(
  'season_leaderboard_cache',
  {
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    weekId: uuid('week_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    totalPoints: decimal('total_points', { precision: 18, scale: 6 }).notNull(),
    totalReferralPoints: decimal('total_referral_points', {
      precision: 18,
      scale: 6,
    }),
    categoryBreakdown: jsonb('category_breakdown').notNull(),
    rank: integer('rank').notNull(),
    lastUpdated: timestamp('last_updated', {
      mode: 'date',
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.seasonId, table.weekId, table.userId] }),
    rankIdx: index('idx_season_leaderboard_rank').on(
      table.seasonId,
      table.weekId,
      table.rank,
    ),
    userIdx: index('idx_season_leaderboard_user').on(table.userId),
  }),
);

export const categoryLeaderboardCache = createTable(
  'category_leaderboard_cache',
  {
    weekId: uuid('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    categoryId: varchar('category_id', { length: 255 }).notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    totalPoints: decimal('total_points', { precision: 18, scale: 6 }).notNull(),
    rank: integer('rank').notNull(),
    activityBreakdown: jsonb('activity_breakdown').notNull(),
    lastUpdated: timestamp('last_updated', {
      mode: 'date',
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.weekId, table.categoryId, table.userId] }),
    rankIdx: index('idx_category_leaderboard_rank').on(
      table.weekId,
      table.categoryId,
      table.rank,
    ),
    userIdx: index('idx_category_leaderboard_user').on(table.userId),
  }),
);

export const leaderboardStatsCache = createTable('leaderboard_stats_cache', {
  cacheKey: varchar('cache_key', { length: 255 }).primaryKey(),
  totalUsers: integer('total_users').notNull(),
  median: decimal('median', { precision: 18, scale: 6 }),
  average: decimal('average', { precision: 18, scale: 6 }),
  lastUpdated: timestamp('last_updated', {
    mode: 'date',
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export type Config = InferSelectModel<typeof config>;
export type User = InferSelectModel<typeof users>;
export type Challenge = InferSelectModel<typeof challenge>;
export type Session = InferSelectModel<typeof sessions>;
export type Account = InferSelectModel<typeof accounts>;
export type Season = InferSelectModel<typeof seasons>;
export type Week = InferSelectModel<typeof weeks>;
export type Dapp = InferSelectModel<typeof dapps>;
export type ActivityCategory = Omit<
  InferSelectModel<typeof activityCategories>,
  'id'
> & {
  id: ActivityCategoryId;
};
export type NewActivity = typeof activities.$inferInsert;
export type Activity = Omit<
  InferSelectModel<typeof activities>,
  'category' | 'id'
> & {
  id: ActivityId;
  category: ActivityCategoryId;
};
export type ActivityWeek = Omit<
  InferSelectModel<typeof activityWeeks>,
  'activityId'
> & {
  activityId: ActivityId;
};
export type ActivityData = {
  showOnEarnPage?: boolean;
  ap?: boolean;
  multiplier?: boolean;
};

export const ActivitySchema = z.object({
  id: z.string(),
  category: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  dapp: z.string().nullable(),
  componentAddresses: z.array(z.string()),
  data: z.object({
    showOnEarnPage: z.boolean().optional(),
    ap: z.boolean().optional(),
    multiplier: z.boolean().optional(),
  }),
});

export type Event = InferSelectModel<typeof events>;
export type Snapshot = InferSelectModel<typeof snapshots>;
export type AccountBalance = InferSelectModel<typeof accountBalances>;

export type AccountActivityPoints = Omit<
  InferSelectModel<typeof accountActivityPoints>,
  'activityId'
> & {
  activityId: ActivityId;
};
export type UserSeasonPoints = InferSelectModel<typeof userSeasonPoints>;
export type SeasonPointsMultiplier = InferSelectModel<
  typeof seasonPointsMultiplier
>;
export type TradingVolume = InferSelectModel<typeof tradingVolume>;
export type TransactionFee = InferSelectModel<typeof transactionFees>;
export type ComponentCall = InferSelectModel<typeof componentCalls>;
export type ComponentWhitelist = InferSelectModel<typeof componentWhitelist>;

// Leaderboard cache types
export type SeasonLeaderboardCache = InferSelectModel<
  typeof seasonLeaderboardCache
>;
export type CategoryLeaderboardCache = InferSelectModel<
  typeof categoryLeaderboardCache
>;
export type LeaderboardStatsCache = InferSelectModel<
  typeof leaderboardStatsCache
>;

// Margin account lookup table for Surge trading
export const marginAccounts = createTable(
  'margin_accounts',
  {
    marginAccountAddress: varchar('margin_account_address', {
      length: 255,
    }).notNull(),
    recoveryAccountAddress: varchar('recovery_account_address', {
      length: 255,
    }),
    collateralAccountAddress: varchar('collateral_account_address', {
      length: 255,
    }),
    tradingAccountAddress: varchar('trading_account_address', {
      length: 255,
    }),
    stateVersion: integer('state_version').notNull(),
  },
  (table) => ({
    // Composite primary key to allow multiple ownership records per margin account
    pk: primaryKey({
      columns: [table.marginAccountAddress, table.stateVersion],
    }),
    recoveryAccountIdx: index('idx_margin_accounts_recovery').on(
      table.recoveryAccountAddress,
    ),
    collateralAccountIdx: index('idx_margin_accounts_collateral').on(
      table.collateralAccountAddress,
    ),
    tradingAccountIdx: index('idx_margin_accounts_trading').on(
      table.tradingAccountAddress,
    ),
    stateVersionIdx: index('idx_margin_accounts_state_version').on(
      table.stateVersion,
    ),
  }),
);

// Note: No foreign key relation to accounts table since margin accounts
// should be able to link to any parent account, regardless of whether
// that parent account is registered in the incentives program

export type MarginAccount = InferSelectModel<typeof marginAccounts>;

export const milestoneType = pgEnum('milestone_type', [
  'tvl',
  'transactions',
  'dex_volume',
  'wallet_downloads',
]);

export const milestones = createTable(
  'milestone',
  {
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id),
    type: milestoneType('type').notNull(),
    goal: decimal('goal', { precision: 20, scale: 2 }).notNull(),
    rewardXrd: decimal('reward_xrd', { precision: 20, scale: 0 }).notNull(),
    currentValue: decimal('current_value', { precision: 20, scale: 2 })
      .notNull()
      .default('0'),
    isAchieved: boolean('is_achieved').notNull().default(false),
    lastUpdated: timestamp('last_updated', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.seasonId, table.type, table.goal] }),
    seasonIdx: index('idx_milestones_season').on(table.seasonId),
    lastUpdatedIdx: index('idx_milestones_last_updated').on(table.lastUpdated),
  }),
);

export type Milestone = InferSelectModel<typeof milestones>;

// Transaction Count Table - tracks total transaction count at specific timestamps
export const transactionCounts = createTable('transaction_count', {
  timestamp: timestamp('timestamp', { mode: 'date', withTimezone: true })
    .notNull()
    .primaryKey(),
  totalTransactionCount: integer('total_transaction_count').notNull(),
});

export type TransactionCount = InferSelectModel<typeof transactionCounts>;

export const resourceRewardDefinitions = createTable(
  'resource_reward_definition',
  {
    address: varchar('address', { length: 255 }).primaryKey(),
    url: varchar('url', { length: 500 }),
  },
);

export type ResourceRewardDefinition = InferSelectModel<
  typeof resourceRewardDefinitions
>;

export const resourceRewardWeeks = createTable(
  'resource_reward_week',
  {
    address: varchar('address', { length: 255 })
      .notNull()
      .references(() => resourceRewardDefinitions.address, {
        onDelete: 'cascade',
      }),
    weekId: uuid('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    points: integer('points').notNull(),
    weeklyLimit: integer('weekly_limit'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.address, table.weekId] }),
    weekIdIdx: index('idx_resource_reward_week_week_id').on(table.weekId),
  }),
);

export type ResourceRewardWeek = InferSelectModel<typeof resourceRewardWeeks>;

export const resourceRewardClaims = createTable(
  'resource_reward_claim',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    resourceManager: varchar('resource_manager', { length: 255 })
      .notNull()
      .references(() => resourceRewardDefinitions.address, {
        onDelete: 'cascade',
      }),
    localId: varchar('local_id', { length: 255 }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    weekId: uuid('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    claimedAt: timestamp('claimed_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    weekIdIdx: index('idx_resource_claims_week_id').on(table.weekId),
  }),
);

export type ResourceRewardClaim = InferSelectModel<typeof resourceRewardClaims>;

export const resourceRewardWeeksRelations = relations(
  resourceRewardWeeks,
  ({ one }) => ({
    resourceRewardDefinition: one(resourceRewardDefinitions, {
      fields: [resourceRewardWeeks.address],
      references: [resourceRewardDefinitions.address],
    }),
    week: one(weeks, {
      fields: [resourceRewardWeeks.weekId],
      references: [weeks.id],
    }),
  }),
);

export const resourceRewardDefinitionsRelations = relations(
  resourceRewardDefinitions,
  ({ many }) => ({
    resourceRewardWeeks: many(resourceRewardWeeks),
  }),
);

export const resourceClaimsRelations = relations(
  resourceRewardClaims,
  ({ one }) => ({
    resourceManager: one(resourceRewardDefinitions, {
      fields: [resourceRewardClaims.resourceManager],
      references: [resourceRewardDefinitions.address],
    }),
    user: one(users, {
      fields: [resourceRewardClaims.userId],
      references: [users.id],
    }),
    week: one(weeks, {
      fields: [resourceRewardClaims.weekId],
      references: [weeks.id],
    }),
    season: one(seasons, {
      fields: [resourceRewardClaims.seasonId],
      references: [seasons.id],
    }),
  }),
);

export const accountRecoveryRequestStatusEnum = pgEnum(
  'account_recovery_request_status',
  ['pending', 'completed', 'failed'],
);

export const accountRecoveryRequests = createTable('account_recovery_request', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  requesterUserId: uuid('requester_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: accountRecoveryRequestStatusEnum('status')
    .notNull()
    .default('pending'),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accountRecoveryRequestsRelations = relations(
  accountRecoveryRequests,
  ({ one }) => ({
    user: one(users, {
      fields: [accountRecoveryRequests.userId],
      references: [users.id],
    }),
    requesterUser: one(users, {
      fields: [accountRecoveryRequests.requesterUserId],
      references: [users.id],
    }),
  }),
);

export const accountRecoveryProofs = createTable(
  'account_recovery_proof',
  {
    recoveryRequestId: uuid('recovery_request_id')
      .notNull()
      .references(() => accountRecoveryRequests.id, { onDelete: 'cascade' }),
    accountAddress: varchar('account_address', { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: 'cascade' }),
    verifiedAt: timestamp('verified_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.recoveryRequestId, table.accountAddress],
    }),
  }),
);

export type AccountRecoveryRequest = InferSelectModel<
  typeof accountRecoveryRequests
>;

export type AccountRecoveryProof = InferSelectModel<
  typeof accountRecoveryProofs
>;

export const accountRecoveryProofsRelations = relations(
  accountRecoveryProofs,
  ({ one }) => ({
    recoveryRequest: one(accountRecoveryRequests, {
      fields: [accountRecoveryProofs.recoveryRequestId],
      references: [accountRecoveryRequests.id],
    }),
    account: one(accounts, {
      fields: [accountRecoveryProofs.accountAddress],
      references: [accounts.address],
    }),
  }),
);

export const competitions = createTable('competition', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  startDate: timestamp('start_date', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  endDate: timestamp('end_date', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  prizeCount: integer('prize_count').notNull(),
});

export type Competition = InferSelectModel<typeof competitions>;

export const competitionParticipants = createTable(
  'competition_participant',
  {
    competitionId: uuid('competition_id')
      .notNull()
      .references(() => competitions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isWinner: boolean('is_winner').notNull().default(false),
    expired: boolean('expired').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    claimedAt: timestamp('claimed_at', { mode: 'date', withTimezone: true }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.competitionId, table.userId] }),
  }),
);

export type CompetitionParticipant = InferSelectModel<
  typeof competitionParticipants
>;

export const userSeasonReward = createTable(
  'user_season_reward',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    // Total amount (including bonus rewards) of rewards claimable by user
    amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.seasonId, table.userId] }),
  }),
);

export const userSeasonRewardClaimStatusEnum = pgEnum(
  'user_season_reward_claim_status',
  ['pending', 'success', 'failed'],
);

export const userSeasonRewardClaims = createTable(
  'user_season_reward_claim',
  {
    transactionId: varchar('transaction_id', { length: 255 }).primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
    status: userSeasonRewardClaimStatusEnum('status')
      .notNull()
      .default('pending'),
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    accountAddress: varchar('account_address', { length: 255 }).notNull(),
  },
  (table) => ({
    userIdSeasonIdIdx: index(
      'idx_user_season_reward_claims_user_id_season_id_status',
    ).on(table.seasonId, table.userId, table.status),
  }),
);

export type UserSeasonRewardClaimsTable = InferSelectModel<
  typeof userSeasonRewardClaims
>;
