import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

/**
 * CAUTION: In Next.js dev mode, a new client is created on every hot reload.
 * Using a global singleton prevents connection leak/socket exhaustion 
 * under high developer churn or scaling events.
 */

const globalForDb = global as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
});

export const db = globalForDb.db ?? drizzle(client);

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
