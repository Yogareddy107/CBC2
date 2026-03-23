'use server';

import { createSessionClient, generateApiKey } from "@/lib/appwrite";
import { revalidatePath } from "next/cache";
import { db } from '@/lib/db';
import { analyses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function createApiKeyAction() {
    try {
        const { account } = await createSessionClient();
        const apiKey = generateApiKey();
        
        await account.updatePrefs({
            cbc_api_key: apiKey
        });

        revalidatePath('/dashboard/profile');
        return { success: true, apiKey };
    } catch (error: any) {
        console.error("[createApiKeyAction] Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteApiKeyAction() {
    try {
        const { account } = await createSessionClient();
        
        await account.updatePrefs({
            cbc_api_key: null
        });

        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error("[deleteApiKeyAction] Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateProfileName(name: string) {
    try {
        const { account } = await createSessionClient();
        await account.updateName(name);
        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error("[updateProfileName] Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateProfilePassword(newPassword: string, oldPassword: string) {
    try {
        const { account } = await createSessionClient();
        await account.updatePassword(newPassword, oldPassword);
        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error("[updateProfilePassword] Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAllAnalyses() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        await db.delete(analyses).where(eq(analyses.user_id, user.$id));
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: any) {
        console.error("[deleteAllAnalyses] Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAccountAndData() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        
        // Delete all analyses first
        await db.delete(analyses).where(eq(analyses.user_id, user.$id));
        
        // Delete the Appwrite session (user will be logged out)
        await account.deleteSession('current');
        
        return { success: true };
    } catch (error: any) {
        console.error("[deleteAccountAndData] Error:", error);
        return { success: false, error: error.message };
    }
}
