'use server';

import { createSessionClient, createAdminClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import { analyses, subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateProfileName(name: string) {
    try {
        const { account } = await createSessionClient();
        await account.updateName(name);
        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error: unknown) {
        console.error('Error in updateProfileName:', error);
        const message = error instanceof Error ? error.message : String(error);
        return { error: message || 'Failed to update name' };
    }
}

export async function updateProfilePassword(newPassword: string, oldPassword: string) {
    try {
        const { account } = await createSessionClient();
        // Appwrite requires the current password when updating to a new one
        await account.updatePassword(newPassword, oldPassword);
        return { success: true };
    } catch (error: unknown) {
        console.error('Error in updateProfilePassword:', error);
        const message = error instanceof Error ? error.message : String(error);
        return { error: message || 'Failed to update password' };
    }
}

export async function deleteAllAnalyses() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        await db.delete(analyses).where(eq(analyses.user_id, user.$id));
        return { success: true };
    } catch (error: unknown) {
        console.error('Error in deleteAllAnalyses:', error);
        const message = error instanceof Error ? error.message : String(error);
        return { error: message || 'Failed to delete analyses' };
    }
}

export async function deleteAccountAndData() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        // Delete stored analyses and subscriptions first
        await db.delete(analyses).where(eq(analyses.user_id, user.$id));
        await db.delete(subscriptions).where(eq(subscriptions.user_id, user.$id));

        // Then delete the Appwrite user account using Admin Client
        const { users } = await createAdminClient();
        await users.delete(user.$id);

        return { success: true };
    } catch (error: unknown) {
        console.error('Error in deleteAccountAndData:', error);
        const message = error instanceof Error ? error.message : String(error);
        return { error: message || 'Failed to delete account' };
    }
}

