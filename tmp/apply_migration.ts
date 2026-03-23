import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
});

async function migrate() {
    console.log('🚀 Starting migration for new tables...\n');

    const statements = [
        `CREATE TABLE IF NOT EXISTS "systems" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "description" text,
            "user_id" text NOT NULL,
            "team_id" text,
            "created_at" text DEFAULT CURRENT_TIMESTAMP,
            "updated_at" text DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS "systems_user_id_idx" ON "systems" ("user_id")`,

        `CREATE TABLE IF NOT EXISTS "system_analyses" (
            "id" text PRIMARY KEY NOT NULL,
            "system_id" text NOT NULL REFERENCES "systems"("id") ON DELETE CASCADE,
            "analysis_id" text NOT NULL REFERENCES "analyses"("id") ON DELETE CASCADE,
            "created_at" text DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS "system_analyses_system_id_idx" ON "system_analyses" ("system_id")`,

        `CREATE TABLE IF NOT EXISTS "api_keys" (
            "id" text PRIMARY KEY NOT NULL,
            "user_id" text NOT NULL,
            "key_hash" text NOT NULL UNIQUE,
            "name" text NOT NULL,
            "last_used" text,
            "created_at" text DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS "api_keys_user_id_idx" ON "api_keys" ("user_id")`,
    ];

    for (const sql of statements) {
        try {
            await client.execute(sql);
            const tableName = sql.match(/"(\w+)"/)?.[1] || 'unknown';
            console.log(`✅ Success: ${tableName}`);
        } catch (err: any) {
            if (err.message?.includes('already exists')) {
                console.log(`⏭️  Skipped (already exists)`);
            } else {
                console.error(`❌ Error:`, err.message);
            }
        }
    }

    console.log('\n✅ Migration complete!');
    process.exit(0);
}

migrate();
