import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./schema";

/**
 * One pooled connection per server instance. `prepare: false` keeps the client compatible with
 * transaction-mode poolers (Neon / Vercel Postgres pooled URLs).
 */
function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add your Postgres connection string to the environment.");
  return postgres(url, { max: 5, prepare: false, idle_timeout: 20, connect_timeout: 10 });
}

const globalForDb = globalThis as unknown as { __latentSql?: ReturnType<typeof createClient> };
const sql = globalForDb.__latentSql ?? createClient();
if (process.env.NODE_ENV !== "production") globalForDb.__latentSql = sql;

export const db = drizzle(sql, { schema });
export type Db = typeof db;
