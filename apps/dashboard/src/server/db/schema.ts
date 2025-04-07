// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  json,
  pgEnum,
  pgTableCreator,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `dashboard_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)]
);

// Activity type enum
export const activityTypeEnum = pgEnum("activity_type", [
  "dex_trading",
  "lending",
  "borrowing",
  "liquidity_provision",
  "nft_trading",
  "token_holding",
  "token_staking",
  "cross_dapp_interaction",
  "first_time_dapp_usage",
]);

// Activity category enum
export const activityCategoryEnum = pgEnum("activity_category", [
  "passive",
  "active",
]);

// User table
export const users = createTable(
  "user",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    authId: d.varchar({ length: 256 }).unique(),
    isAdmin: d.boolean().default(false),
    isActive: d.boolean().default(true),
    settings: d.json().$type<Record<string, unknown>>(),
  }),
  (t) => [index("auth_id_idx").on(t.authId)]
);

// User Account table
export const userAccounts = createTable(
  "user_account",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    userId: d.uuid().references(() => users.id),
    accountAddress: d.varchar({ length: 256 }).notNull(),
    verifiedAt: d.timestamp({ withTimezone: true }),
    isExcluded: d.boolean().default(false),
    multiplier: d.decimal().default("1.0"),
    xrdBalance: d.decimal().default("0"),
    lsuBalance: d.decimal().default("0"),
    lsulpBalance: d.decimal().default("0"),
    holdingPeriodStart: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("user_id_idx").on(t.userId),
    index("account_address_idx").on(t.accountAddress),
  ]
);

// Activity table
export const activities = createTable(
  "activity",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    accountAddress: d.varchar({ length: 256 }).notNull(),
    transactionId: d.varchar({ length: 256 }).notNull(),
    activityType: d.type("activity_type").notNull(),
    activityCategory: d.type("activity_category").notNull(),
    timestamp: d.timestamp({ withTimezone: true }).notNull(),
    details: d.json().$type<Record<string, unknown>>(),
    usdValue: d.decimal(),
    assetType: d.varchar({ length: 100 }),
    derivativeFlag: d.boolean().default(false),
    weeklyPoints: d.decimal(),
    processed: d.boolean().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("account_activities_idx").on(t.accountAddress),
    index("transaction_id_idx").on(t.transactionId),
    index("activity_type_idx").on(t.activityType),
    index("activity_timestamp_idx").on(t.timestamp),
  ]
);

// Weekly Points table
export const weeklyPoints = createTable(
  "weekly_points",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    accountAddress: d.varchar({ length: 256 }).notNull(),
    weekNumber: d.integer().notNull(),
    seasonNumber: d.integer().notNull(),
    passivePoints: d.decimal().default("0"),
    activePoints: d.decimal().default("0"),
    totalPoints: d.decimal().default("0"),
    passivePercentile: d.decimal(),
    activePercentile: d.decimal(),
    multiplier: d.decimal().default("1.0"),
    calculatedAt: d.timestamp({ withTimezone: true }).notNull(),
    details: d.json().$type<Record<string, unknown>>(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("weekly_account_idx").on(t.accountAddress),
    index("weekly_season_idx").on(t.seasonNumber, t.weekNumber),
    primaryKey(t.accountAddress, t.weekNumber, t.seasonNumber),
  ]
);

// Season Points table
export const seasonPoints = createTable(
  "season_points",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    accountAddress: d.varchar({ length: 256 }).notNull(),
    seasonNumber: d.integer().notNull(),
    points: d.decimal().default("0"),
    rank: d.integer(),
    calculatedAt: d.timestamp({ withTimezone: true }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("season_account_idx").on(t.accountAddress),
    index("season_number_idx").on(t.seasonNumber),
    index("season_rank_idx").on(t.rank),
    primaryKey(t.accountAddress, t.seasonNumber),
  ]
);
