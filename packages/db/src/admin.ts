import { relations } from "drizzle-orm";
import { boolean, json, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createTable } from "./schema";

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

export const campaignConfig = createTable("campaign_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  seasonNumber: text("season_number").notNull(),
  weekNumber: text("week_number").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  rules: json("rules").notNull(),
  multiplierThresholds: json("multiplier_thresholds").notNull(),
  minimumHoldingRequirement: text("minimum_holding_requirement").notNull(),
  whitelistedActivities: json("whitelisted_activities"),
  rewardDistributionMethod: text("reward_distribution_method").notNull(),
  minimumRewardPercentile: text("minimum_reward_percentile"),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  isActive: boolean("is_active").notNull().default(false),
  version: text("version").notNull(),
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
  campaignConfigs: many(campaignConfig),
  reportTemplates: many(reportTemplates),
}));

export const campaignConfigRelations = relations(campaignConfig, ({ one }) => ({
  createdBy: one(adminUsers, {
    fields: [campaignConfig.createdById],
    references: [adminUsers.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(adminUsers, {
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
