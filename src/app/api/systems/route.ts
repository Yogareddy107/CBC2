import { createSessionClient } from "@/lib/appwrite";
import { db } from "@/lib/db";
import { systems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// List all systems for the current user
export async function GET() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        const userSystems = await db.select()
            .from(systems)
            .where(eq(systems.user_id, user.$id));

        return NextResponse.json(userSystems);
    } catch (error) {
        console.error("Failed to list systems:", error);
        return NextResponse.json({ error: "Unauthorized or failed to fetch" }, { status: 401 });
    }
}

// Create a new system
export async function POST(req: Request) {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        const { name, description, teamId } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const [newSystem] = await db.insert(systems).values({
            id: crypto.randomUUID(),
            name,
            description: description || null,
            user_id: user.$id,
            team_id: teamId || null,
        }).returning();

        return NextResponse.json(newSystem);
    } catch (error) {
        console.error("Failed to create system:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
