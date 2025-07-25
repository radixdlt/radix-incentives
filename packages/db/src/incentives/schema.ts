import type { ActivityCategoryId, ActivityId } from "data";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
  pgTableCreator,
  timestamp,
  varchar,
  char,
  text,
  primaryKey,
  uuid,
  jsonb,
  index,
  boolean,
  decimal,
  pgEnum,
  integer,
  bigint,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => name);

export const challenge = createTable("challenge", {
  challenge: char("challenge", { length: 64 })
    .primaryKey()
    .$defaultFn(() =>
      Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    ),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const users = createTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  identityAddress: varchar("identity_address", { length: 255 })
    .unique()
    .notNull(),
  label: varchar("label", { length: 255 }),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const user = users;

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessions = createTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp("expires_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accounts = createTable("account", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  address: varchar("address", { length: 255 }).notNull().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Enums (Define possible string values for enum columns)
export const seasonStatusEnum = pgEnum("season_status", [
  "upcoming",
  "active",
  "completed",
]);
export const activityWeekStatusEnum = pgEnum("activity_week_status", [
  "active",
  "inactive",
]);

// Season Table
export const seasons = createTable("season", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  status: seasonStatusEnum("status").notNull().default("upcoming"),
});

export const seasonsRelations = relations(seasons, ({ many }) => ({
  weeks: many(weeks),
}));

// Week Table
export const weeks = createTable("week", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  endDate: timestamp("end_date", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  processed: boolean("processed").notNull().default(false),
});

export const weeksRelations = relations(weeks, ({ one, many }) => ({
  season: one(seasons, { fields: [weeks.seasonId], references: [seasons.id] }),
  activityWeeks: many(activityWeeks),
}));

export const activityCategories = createTable("activity_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const dapps = createTable("dapp", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website").notNull(),
});

export const dappsRelations = relations(dapps, ({ many }) => ({
  activities: many(activities),
}));

// Activity Table
export const activities = createTable("activity", {
  id: text("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  category: text("category")
    .notNull()
    .references(() => activityCategories.id, { onDelete: "cascade" }),
  dapp: text("dapp").references(() => dapps.id),
  componentAddresses: jsonb("component_addresses").$defaultFn(() => []),
  data: jsonb("data").$defaultFn(() => ({})),
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
  "activity_week",
  {
    activityId: text("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    weekId: uuid("week_id")
      .notNull()
      .references(() => weeks.id, { onDelete: "cascade" }),
    multiplier: decimal("multiplier", { precision: 18, scale: 6 })
      .notNull()
      .default("1"),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: "activity_week_pk",
        columns: [table.activityId, table.weekId],
      }),
    };
  }
);

export const activityWeeksRelations = relations(activityWeeks, ({ one }) => ({
  activity: one(activities, {
    fields: [activityWeeks.activityId],
    references: [activities.id],
  }),
  week: one(weeks, { fields: [activityWeeks.weekId], references: [weeks.id] }),
}));

export const activityCategoryWeeks = createTable(
  "activity_category_weeks",
  {
    activityCategoryId: text("activity_category_id")
      .notNull()
      .references(() => activityCategories.id, { onDelete: "cascade" }),
    weekId: uuid("week_id")
      .notNull()
      .references(() => weeks.id, { onDelete: "cascade" }),
    pointsPool: integer("points_pool").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: "activity_category_week_pk",
      columns: [table.weekId, table.activityCategoryId],
    }),
  })
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
  })
);

// UserActivity Table
export const events = createTable(
  "event",
  {
    transactionId: text("transaction_id").notNull(),
    eventIndex: integer("event_index").notNull(),
    dApp: text("dApp").notNull(),
    stateVersion: integer("state_version").notNull(),
    timestamp: timestamp("timestamp", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    globalEmitter: text("global_emitter").notNull(),
    packageAddress: text("package_address").notNull(),
    blueprint: text("blueprint").notNull(),
    eventName: text("event_name").notNull(),
    eventData: jsonb("event_data").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.transactionId, table.eventIndex] }),
  })
);

export const snapshotStatusEnum = pgEnum("snapshot_status", [
  "not_started",
  "processing",
  "completed",
  "failed",
]);

export const snapshots = createTable("snapshot", {
  id: uuid("id").primaryKey().defaultRandom(),
  timestamp: timestamp("timestamp", {
    mode: "date",
    withTimezone: true,
  }),
  status: snapshotStatusEnum("status").notNull().default("not_started"),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const accountBalances = createTable(
  "account_balances",
  {
    timestamp: timestamp("timestamp", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    accountAddress: varchar("account_address", { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: "cascade" }),
    data: jsonb("data").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.accountAddress, table.timestamp],
    }),
    // Note: Indexes will be created per partition, not on the main table
    timestampIdx: index("idx_account_balances_timestamp").on(table.timestamp),
    accountIdx: index("idx_account_balances_account").on(table.accountAddress),
  })
);

export const accountActivityPoints = createTable(
  "account_activity_points",
  {
    accountAddress: varchar("account_address", { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: "cascade" }),
    weekId: uuid("week_id")
      .notNull()
      .references(() => weeks.id, { onDelete: "cascade" }),
    activityId: text("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    activityPoints: decimal("activity_points", {
      precision: 18,
      scale: 6,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.accountAddress, table.weekId, table.activityId],
    }),
  })
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
  })
);

export const userSeasonPoints = createTable(
  "user_season_points",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    seasonId: uuid("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    weekId: uuid("week_id")
      .notNull()
      .references(() => weeks.id, { onDelete: "cascade" }),
    points: decimal("points", { precision: 18, scale: 6 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.seasonId, table.weekId] }),
  })
);

export const seasonPointsMultiplier = createTable(
  "season_points_multiplier",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekId: uuid("week_id")
      .notNull()
      .references(() => weeks.id, { onDelete: "cascade" }),
    multiplier: decimal("multiplier", { precision: 18, scale: 2 }).notNull(),
    cumulativeTWABalance: decimal("cumulative_twa_balance", {
      precision: 18,
      scale: 2,
    }).notNull(),
    totalTWABalance: decimal("total_twa_balance", {
      precision: 18,
      scale: 2,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.weekId] }),
  })
);

export const transactionFees = createTable(
  "transaction_fees",
  {
    transactionId: text("transaction_id").notNull(),
    accountAddress: varchar("account_address", { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: "cascade" }),
    fee: decimal("fee", { precision: 18, scale: 2 }).notNull(),
    timestamp: timestamp("timestamp", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.timestamp, table.accountAddress, table.transactionId],
    }),
  })
);

export const componentCalls = createTable(
  "component_calls",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    data: jsonb("data").notNull(),
    timestamp: timestamp("timestamp", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.timestamp],
    }),
  })
);

export const tradingVolume = createTable(
  "trading_volume",
  {
    accountAddress: varchar("account_address", { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: "cascade" }),
    timestamp: timestamp("timestamp", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    data: jsonb("data").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.timestamp, table.accountAddress],
    }),
  })
);

export const config = createTable("config", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: jsonb("value").notNull(),
});

export const componentWhitelist = createTable("component_whitelist", {
  componentAddress: varchar("component_address", { length: 255 }).primaryKey(),
}, (table) => ({
  componentAddressIdx: index("idx_component_whitelist_address").on(table.componentAddress),
}));

export type Config = InferSelectModel<typeof config>;
export type User = InferSelectModel<typeof users>;
export type Challenge = InferSelectModel<typeof challenge>;
export type Session = InferSelectModel<typeof sessions>;
export type Account = InferSelectModel<typeof accounts>;
export type Season = InferSelectModel<typeof seasons>;
export type Week = InferSelectModel<typeof weeks>;
export type ActivityCategory = Omit<
  InferSelectModel<typeof activityCategories>,
  "id"
> & {
  id: ActivityCategoryId;
};
export type NewActivity = typeof activities.$inferInsert;
export type Activity = Omit<
  InferSelectModel<typeof activities>,
  "category" | "id"
> & {
  id: ActivityId;
  category: ActivityCategoryId;
};
export type ActivityWeek = Omit<
  InferSelectModel<typeof activityWeeks>,
  "activityId"
> & {
  activityId: ActivityId;
};

export type Event = InferSelectModel<typeof events>;
export type Snapshot = InferSelectModel<typeof snapshots>;
export type AccountBalance = InferSelectModel<typeof accountBalances>;

export type AccountActivityPoints = Omit<
  InferSelectModel<typeof accountActivityPoints>,
  "activityId"
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
