import type { Config } from "drizzle-kit";

const DATABASE_URL =
  process.env.INCENTIVES_DATABASE_URL ?? process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

export default {
  schema: "./src/incentives/schema.ts",
  dialect: "postgresql",
  out: "./src/incentives/drizzle",
  dbCredentials: {
    url: DATABASE_URL,
  },
  strict: true,
  verbose: true,
  tablesFilter: [],
} satisfies Config;
