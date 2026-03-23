import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
});

const db = drizzle(client);

async function main() {
    try {
        const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
        console.log("Tables in database:", res.rows.map(r => r.name));
    } catch (e) {
        console.error("Failed to list tables:", e);
    }
}

main();
