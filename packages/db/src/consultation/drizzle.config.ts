import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

export default {
  dialect: "postgresql",
  schema: "./src/consultation/schema.ts",
  out: "./src/consultation/drizzle",
  dbCredentials: {
    url: process.env.CONSULTATION_DATABASE_URL ?? process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
  tablesFilter: [],
} satisfies Config;
