import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL!;
const NODE_ENV = process.env.NODE_ENV;

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(DATABASE_URL);
if (NODE_ENV !== "production") globalForDb.conn = conn;

export type Db = typeof db;
export const db = drizzle(conn, { schema });
