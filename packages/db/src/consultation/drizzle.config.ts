import type { Config } from "drizzle-kit";

const DATABASE_URL =
  process.env.DATABASE_URL ?? process.env.CONSULTATION_DATABASE_URL;

if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

export default {
  dialect: "postgresql",
  schema: "./src/consultation/schema.ts",
  out: "./src/consultation/drizzle",
  dbCredentials: {
    url: DATABASE_URL,
  },
  strict: true,
  verbose: true,
  tablesFilter: [],
} satisfies Config;
