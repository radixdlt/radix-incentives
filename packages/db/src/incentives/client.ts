import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { withReplicas } from "drizzle-orm/pg-core";

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_READ_URL = process.env.DATABASE_READ_URL;
const NODE_ENV = process.env.NODE_ENV;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

let readConn: postgres.Sql;
let readDb: PostgresJsDatabase<typeof schema> | undefined;
if (DATABASE_READ_URL) {
  readConn = postgres(DATABASE_READ_URL);
  readDb = drizzle(readConn, { schema });
} else {
  readDb = undefined;
}

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(DATABASE_URL);
if (NODE_ENV !== "production") globalForDb.conn = conn;

const primaryDb = drizzle(conn, { schema });
let dbConnection: PostgresJsDatabase<typeof schema>;

if (readDb) {
  dbConnection = withReplicas(primaryDb, [readDb]);
  console.log("Using read replicas as well");
} else {
  dbConnection = primaryDb;
  console.log("Using primary database");
}

export type Db = typeof dbConnection;
export type ReadOnlyDb = typeof readDb;

// Main database connection (with read replicas if available)
export const db = dbConnection;

// Read-only database connection (undefined if no read replica configured)
export const readOnlyDb = readDb;

// Primary database connection (always write-capable)
export const primaryDatabase = primaryDb;
