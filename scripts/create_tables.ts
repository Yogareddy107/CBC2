import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from "@libsql/client";

const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
});

async function main() {
    const statements = [
        `CREATE TABLE IF NOT EXISTS "teams" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "invite_code" text UNIQUE NOT NULL,
            "owner_id" text NOT NULL,
            "plan" text DEFAULT 'free',
            "created_at" text DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS "team_members" (
            "id" text PRIMARY KEY NOT NULL,
            "team_id" text NOT NULL REFERENCES "teams"("id"),
            "user_id" text NOT NULL,
            "role" text DEFAULT 'member',
            "joined_at" text DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS "comments" (
            "id" text PRIMARY KEY NOT NULL,
            "analysis_id" text NOT NULL,
            "user_id" text NOT NULL,
            "section_id" text NOT NULL,
            "content" text NOT NULL,
            "created_at" text DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS "file_reviews" (
            "id" text PRIMARY KEY NOT NULL,
            "analysis_id" text NOT NULL,
            "team_id" text NOT NULL,
            "file_path" text NOT NULL,
            "reviewer_id" text NOT NULL,
            "status" text DEFAULT 'pending',
            "note" text,
            "created_at" text DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS "team_checklists" (
            "id" text PRIMARY KEY NOT NULL,
            "team_id" text NOT NULL REFERENCES "teams"("id"),
            "title" text NOT NULL,
            "completed" integer DEFAULT 0,
            "assigned_to" text,
            "created_at" text DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE INDEX IF NOT EXISTS "analyses_team_id_idx" ON "analyses" ("team_id");`,
        `CREATE INDEX IF NOT EXISTS "comments_analysis_id_idx" ON "comments" ("analysis_id");`,
        `CREATE INDEX IF NOT EXISTS "file_reviews_analysis_team_idx" ON "file_reviews" ("analysis_id", "team_id");`
    ];

    for (const stmt of statements) {
        try {
            console.log("Executing:", stmt.split('\n')[0] + "...");
            await client.execute(stmt);
            console.log("Success.");
        } catch (e) {
            console.error("Failed:", e);
        }
    }
    
    // Also add team_id column to analyses if it doesn't exist
    try {
        console.log("Adding team_id to analyses...");
        await client.execute('ALTER TABLE "analyses" ADD COLUMN "team_id" text;');
        console.log("Success.");
    } catch (e) {
        console.log("team_id column might already exist or failed:", (e as any).message);
    }
}

main();
