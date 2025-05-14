import { type InferSelectModel, relations } from "drizzle-orm";
import { date } from "drizzle-orm/mysql-core";
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
  uniqueIndex,
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accounts = createTable("account", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .$defaultFn(() => crypto.randomUUID()),
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

export const consultations = createTable(
  "consultation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    consultationId: text("consultation_id").notNull(),
    accountAddress: varchar("account_address", { length: 255 }) // Link to the user profile
      .notNull()
      .references(() => accounts.address, { onDelete: "cascade" }),
    selectedOption: text("selected_option").notNull(),
    rolaProof: jsonb("rola_proof"), // Store ROLA proof details
    timestamp: timestamp("timestamp", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      // Unique constraint for one vote per account per consultation
      consultationVoteUid: uniqueIndex("consultation_vote_uidx").on(
        table.consultationId,
        table.accountAddress
      ),
      consultationIdIdx: index("consultation_id_idx").on(table.consultationId),
      accountAddressIdx: index("account_address_idx").on(table.accountAddress),
    };
  }
);

export const consultationsRelations = relations(consultations, ({ one }) => ({
  account: one(accounts, {
    fields: [consultations.accountAddress],
    references: [accounts.address],
  }),
}));

export const votingPower = createTable(
  "voting_power",
  {
    timestamp: timestamp("timestamp", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    accountAddress: varchar("account_address", { length: 255 })
      .notNull()
      .references(() => accounts.address, { onDelete: "cascade" }),
    votingPower: text("voting_power").notNull(),
    balances: jsonb("balances"),
  },
  (vp) => ({
    compoundKey: primaryKey({ columns: [vp.timestamp, vp.accountAddress] }),
  })
);

export type User = InferSelectModel<typeof users>;
export type Challenge = InferSelectModel<typeof challenge>;
export type Session = InferSelectModel<typeof sessions>;
export type Account = InferSelectModel<typeof accounts>;
export type Consultation = InferSelectModel<typeof consultations>;
export type VotingPower = InferSelectModel<typeof votingPower>;
