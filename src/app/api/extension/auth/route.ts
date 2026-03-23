import { createSessionClient } from "@/lib/appwrite";
import { db } from "@/lib/db";
import { api_keys } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

// List API keys
export async function GET() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        const keys = await db.select({
            id: api_keys.id,
            name: api_keys.name,
            last_used: api_keys.last_used,
            created_at: api_keys.created_at
        })
        .from(api_keys)
        .where(eq(api_keys.user_id, user.$id));

        return NextResponse.json(keys);
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// Generate new API key
export async function POST(req: Request) {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

        // Generate a random key
        const rawKey = `cbc_${randomBytes(24).toString('hex')}`;
        const keyHash = createHash('sha256').update(rawKey).digest('hex');

        const [newKey] = await db.insert(api_keys).values({
            id: crypto.randomUUID(),
            user_id: user.$id,
            name: name,
            key_hash: keyHash,
        }).returning({ id: api_keys.id });

        // IMPORTANT: We only show the raw key once
        return NextResponse.json({ 
            id: newKey.id,
            apiKey: rawKey,
            message: "Save this key now. It will NOT be shown again."
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// Revoke API key
export async function DELETE(req: Request) {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.delete(api_keys)
            .where(and(eq(api_keys.id, id), eq(api_keys.user_id, user.$id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
