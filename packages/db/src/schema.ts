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
  json,
  decimal,
  pgEnum,
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
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
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accounts = createTable("account", {
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  address: varchar("address", { length: 255 }).notNull().primaryKey(),
  label: varchar("label", { length: 255 }),
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

// Export all admin-related schema components
export const adminUsers = createTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(), // Hashed password
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  role: text("role").notNull().default("admin"), // admin, superadmin
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  permissions: json("permissions").default({}),
});

export const adminLogs = createTable("admin_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminUsers.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: json("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});

export const reportTemplates = createTable("report_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  template: json("template").notNull(),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

// Relations
export const adminRelations = relations(adminUsers, ({ many }) => ({
  logs: many(adminLogs),
  reportTemplates: many(reportTemplates),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [adminLogs.adminId],
    references: [adminUsers.id],
  }),
}));

export const reportTemplatesRelations = relations(
  reportTemplates,
  ({ one }) => ({
    createdBy: one(adminUsers, {
      fields: [reportTemplates.createdById],
      references: [adminUsers.id],
    }),
  })
);

// --- Add JobLog Schema Below ---

export const jobLogs = createTable(
  "job_log",
  {
    id: uuid("id").primaryKey().defaultRandom(), // Log entry's unique PK
    jobId: varchar("job_id", { length: 255 }).notNull(), // Application-generated ID passed to BullMQ
    queueName: varchar("queue_name", { length: 100 }).notNull(),
    jobName: varchar("job_name", { length: 255 }).notNull(),
    jobArguments: jsonb("job_arguments"),
    triggerSource: varchar("trigger_source", { length: 50 })
      .notNull()
      .default("system"),
    triggeredByAdminUserId: uuid("triggered_by_admin_user_id").references(
      () => adminUsers.id,
      { onDelete: "set null" }
    ),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(), // When enqueued
    startedAt: timestamp("started_at", { mode: "date", withTimezone: true }), // When worker started
    endedAt: timestamp("ended_at", { mode: "date", withTimezone: true }), // When worker finished
    errorMessage: text("error_message"),
    errorStacktrace: text("error_stacktrace"),
  },
  (table) => {
    return {
      // Index on the jobId used by BullMQ and for lookups
      jobIdIdx: index("joblog_job_id_idx").on(table.jobId),
      // Other indexes remain useful
      queueStatusIdx: index("joblog_queue_status_idx").on(
        table.queueName,
        table.status
      ),
      jobNameIdx: index("joblog_job_name_idx").on(table.jobName),
      createdAtIdx: index("joblog_created_at_idx").on(table.createdAt),
    };
  }
);

// Relations for JobLog
export const jobLogsRelations = relations(jobLogs, ({ one }) => ({
  triggeredByAdmin: one(adminUsers, {
    fields: [jobLogs.triggeredByAdminUserId],
    references: [adminUsers.id],
    relationName: "triggered_by_admin", // Optional custom relation name
  }),
}));

// --- New Schema based on acitivity-management.md ---

// Enums (Define possible string values for enum columns)
export const seasonStatusEnum = pgEnum("season_status", [
  "upcoming",
  "active",
  "completed",
]);
export const weekStatusEnum = pgEnum("week_status", [
  "upcoming",
  "active",
  "completed",
]);
export const activityTypeEnum = pgEnum("activity_type", ["passive", "active"]);
export const rewardTypeEnum = pgEnum("reward_type", ["points", "multiplier"]);
export const activityCategoryEnum = pgEnum("activity_category", [
  "holding",
  "trading",
  "liquidity",
  "lending",
  "borrowing",
  "nft",
  "token",
  "dapp_usage",
  // Add other categories as needed
]);
export const activityWeekStatusEnum = pgEnum("activity_week_status", [
  "active",
  "inactive",
]);

// Season Table
export const seasons = createTable("season", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: timestamp("start_date", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  endDate: timestamp("end_date", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  status: seasonStatusEnum("status").notNull().default("upcoming"),
});

export const seasonsRelations = relations(seasons, ({ many }) => ({
  weeks: many(weeks),
  userSeasonPoints: many(userSeasonPoints),
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
  status: weekStatusEnum("status").notNull().default("upcoming"),
  isProcessed: boolean("is_processed").notNull().default(false),
});

export const weeksRelations = relations(weeks, ({ one, many }) => ({
  season: one(seasons, { fields: [weeks.seasonId], references: [seasons.id] }),
  activityWeeks: many(activityWeeks),
  userActivities: many(userActivities),
  userWeeklyPoints: many(userWeeklyPoints),
  userWeeklyMultipliers: many(userWeeklyMultipliers),
}));

// Activity Table
export const activities = createTable("activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: activityTypeEnum("type").notNull(),
  rewardType: rewardTypeEnum("reward_type").notNull(),
  category: activityCategoryEnum("category"),
  rules: jsonb("rules"), // Store complex rules as JSON
});

export const activitiesRelations = relations(activities, ({ many }) => ({
  activityWeeks: many(activityWeeks),
  userActivities: many(userActivities),
}));

// ActivityWeek Junction Table
export const activityWeeks = createTable(
  "activity_week",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    weekId: uuid("week_id")
      .notNull()
      .references(() => weeks.id, { onDelete: "cascade" }),
    pointsPool: decimal("points_pool", { precision: 18, scale: 2 }), // For points-based activities
    status: activityWeekStatusEnum("status").notNull().default("inactive"),
  },
  (table) => {
    return {
      // Unique constraint to prevent duplicate activity entries for the same week
      activityWeekUid: index("activity_week_uidx").on(
        table.activityId,
        table.weekId
      ),
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

// Transaction Table
export const transactions = createTable("transaction", {
  // Using transactionId from blockchain as primary key might be better if truly unique and needed for lookups
  // id: uuid("id").primaryKey().defaultRandom(), // Option 1: Internal UUID PK
  transactionId: text("transaction_id").primaryKey(), // Option 2: Blockchain Tx ID as PK
  // userId might not be directly known at tx ingestion, might link via UserActivity later
  // userId: uuid("user_id").references(() => users.id),
  timestamp: timestamp("timestamp", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  stateVersion: text("state_version"), // Assuming state version is text/varchar
  rawData: jsonb("raw_data").notNull(), // Store the full transaction payload
  processedAt: timestamp("processed_at", { mode: "date", withTimezone: true }), // When parsed into UserActivity
});

export const transactionsRelations = relations(transactions, ({ many }) => ({
  userActivities: many(userActivities), // A transaction can lead to multiple activities
}));

// UserActivity Table
export const userActivities = createTable("user_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }) // Link to the User ID
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  weekId: uuid("week_id")
    .notNull()
    .references(() => weeks.id, { onDelete: "cascade" }),
  // transactionId FK depends on PK choice in transactions table
  // transactionId: uuid("transaction_id").references(() => transactions.id), // If internal PK used
  transactionId: text("transaction_id").references(
    () => transactions.transactionId
  ), // If tx hash is PK
  timestamp: timestamp("timestamp", {
    mode: "date",
    withTimezone: true,
  }).notNull(), // When the activity occurred (might differ slightly from tx timestamp)
  value: decimal("value", { precision: 18, scale: 2 }), // USD value equivalent
  metadata: jsonb("metadata"), // Additional context
});

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, { fields: [userActivities.userId], references: [users.id] }),
  activity: one(activities, {
    fields: [userActivities.activityId],
    references: [activities.id],
  }),
  week: one(weeks, { fields: [userActivities.weekId], references: [weeks.id] }),
  transaction: one(transactions, {
    fields: [userActivities.transactionId],
    references: [transactions.transactionId],
  }), // Adjust FK reference based on Transaction PK
}));

// UserWeeklyPoints Table
export const userWeeklyPoints = createTable("user_weekly_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekId: uuid("week_id")
    .notNull()
    .references(() => weeks.id, { onDelete: "cascade" }),
  activityPoints: jsonb("activity_points"), // JSON: { activityId: points, ... }
  basePoints: decimal("base_points", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  appliedMultiplier: decimal("applied_multiplier", { precision: 10, scale: 4 })
    .notNull()
    .default("1"),
  totalPoints: decimal("total_points", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  isConverted: boolean("is_converted").notNull().default(false), // To season points
});

export const userWeeklyPointsRelations = relations(
  userWeeklyPoints,
  ({ one }) => ({
    user: one(users, {
      fields: [userWeeklyPoints.userId],
      references: [users.id],
    }),
    week: one(weeks, {
      fields: [userWeeklyPoints.weekId],
      references: [weeks.id],
    }),
  })
);

// UserWeeklyMultipliers Table
export const userWeeklyMultipliers = createTable("user_weekly_multipliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekId: uuid("week_id")
    .notNull()
    .references(() => weeks.id, { onDelete: "cascade" }),
  activityMultipliers: jsonb("activity_multipliers"), // JSON: { activityId: multiplier, ... }
  // totalMultiplier field might be redundant if the main multiplier is applied globally later.
  // totalMultiplier: decimal("total_multiplier", { precision: 10, scale: 4 }).notNull().default("1"),
});

export const userWeeklyMultipliersRelations = relations(
  userWeeklyMultipliers,
  ({ one }) => ({
    user: one(users, {
      fields: [userWeeklyMultipliers.userId],
      references: [users.id],
    }),
    week: one(weeks, {
      fields: [userWeeklyMultipliers.weekId],
      references: [weeks.id],
    }),
  })
);

// UserSeasonPoints Table
export const userSeasonPoints = createTable("user_season_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  seasonId: uuid("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  totalPoints: decimal("total_points", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  // Rank might be better calculated dynamically or stored in a separate leaderboard table
  // rank: integer("rank"),
});

export const userSeasonPointsRelations = relations(
  userSeasonPoints,
  ({ one }) => ({
    user: one(users, {
      fields: [userSeasonPoints.userId],
      references: [users.id],
    }),
    season: one(seasons, {
      fields: [userSeasonPoints.seasonId],
      references: [seasons.id],
    }),
  })
);

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type Account = InferSelectModel<typeof accounts>;
export type JobLog = InferSelectModel<typeof jobLogs>;
export type Season = InferSelectModel<typeof seasons>;
export type Week = InferSelectModel<typeof weeks>;
export type Activity = InferSelectModel<typeof activities>;
export type ActivityWeek = InferSelectModel<typeof activityWeeks>;
export type Transaction = InferSelectModel<typeof transactions>;
export type UserActivity = InferSelectModel<typeof userActivities>;
export type UserWeeklyPoints = InferSelectModel<typeof userWeeklyPoints>;
export type UserWeeklyMultipliers = InferSelectModel<
  typeof userWeeklyMultipliers
>;
export type UserSeasonPoints = InferSelectModel<typeof userSeasonPoints>;
