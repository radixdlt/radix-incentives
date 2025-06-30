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
} else {
  dbConnection = primaryDb;
}

export type Db = typeof dbConnection;
export const db = dbConnection;
