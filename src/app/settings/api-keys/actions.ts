'use server';

import { db } from "@/lib/db";
import { api_keys } from "@/lib/db/schema";
import { createSessionClient } from "@/lib/appwrite";
import { eq, and } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "node:crypto";

// Basic SHA-256 hashing for keys
function hashKey(key: string) {
    return createHash('sha256').update(key).digest('hex');
}

export async function generateApiKey(name: string) {
    const { account } = await createSessionClient();
    let user;
    try {
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    // Generate a secure random key
    const rawKey = `cbc_${randomBytes(24).toString('hex')}`;
    const keyHash = hashKey(rawKey);

    await db.insert(api_keys).values({
        id: randomUUID(),
        user_id: user.$id,
        key_hash: keyHash,
        name: name,
    });

    return { success: true, key: rawKey }; // Return the raw key ONLY once on creation
}

export async function listApiKeys() {
    const { account } = await createSessionClient();
    let user;
    try {
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    const keys = await db.select({
        id: api_keys.id,
        name: api_keys.name,
        last_used: api_keys.last_used,
        created_at: api_keys.created_at
    })
    .from(api_keys)
    .where(eq(api_keys.user_id, user.$id));

    return keys;
}

export async function deleteApiKey(id: string) {
    const { account } = await createSessionClient();
    let user;
    try {
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    await db.delete(api_keys)
        .where(and(eq(api_keys.id, id), eq(api_keys.user_id, user.$id)));

    return { success: true };
}
