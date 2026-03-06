
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
});
const db = drizzle(client);

const conversations = sqliteTable("conversations", {
    id: text("id").primaryKey(),
    user_id: text("user_id").notNull(),
});

async function test() {
    console.log("Testing DB connection...");
    console.log("URL:", process.env.DATABASE_URL);
    try {
        const result = await db.select().from(conversations).limit(1);
        console.log("Select success:", result);

        console.log("Attempting insertion test...");
        // Use a dummy user ID for testing
        const [inserted] = await db.insert(conversations).values({
            id: crypto.randomUUID(),
            user_id: 'test-user-id',
        }).returning();
        console.log("Insert success:", inserted);
    } catch (err) {
        console.error("DB Error:", err);
    }
}

test();
