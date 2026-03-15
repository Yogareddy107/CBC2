import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
    const client = createClient({
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN!,
    });

    try {
        console.log("Adding slug column...");
        await client.execute(`ALTER TABLE analyses ADD COLUMN slug TEXT;`);
    } catch (e: any) {
        console.log("Slug column might already exist", e.message);
    }

    try {
        console.log("Adding team_id column...");
        await client.execute(`ALTER TABLE analyses ADD COLUMN team_id TEXT;`);
    } catch (e: any) {
        console.log("team_id column might already exist", e.message);
    }
    
    console.log("Done adding columns manually.");
}

run();
