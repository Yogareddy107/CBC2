'use server';

import { db } from '@/lib/db';
import { notifications, notification_status } from '@/lib/db/schema';
import { eq, and, or, isNull, desc, not, exists, sql } from 'drizzle-orm';
import { createSessionClient } from '@/lib/appwrite';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        if (!user) return [];

        // Fetch notifications: 
        // 1. Specifically for this user
        // 2. Global (user_id is null) AND not marked as read in notification_status
        const userNotifs = await db.select()
            .from(notifications)
            .leftJoin(notification_status, and(
                eq(notification_status.notification_id, notifications.id),
                eq(notification_status.user_id, user.$id)
            ))
            .where(
                and(
                    or(
                        eq(notifications.user_id, user.$id),
                        isNull(notifications.user_id)
                    ),
                    or(
                        isNull(notification_status.is_read),
                        eq(notification_status.is_read, false)
                    )
                )
            )
            .orderBy(desc(notifications.created_at))
            .limit(20);

        return userNotifs.map(n => ({
            ...n.notifications,
            is_read: n.notification_status?.is_read ?? false
        }));
    } catch (e) {
        console.error('Error fetching notifications:', e);
        return [];
    }
}

export async function markAsRead(notificationId: string) {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        if (!user) return { success: false };

        // Check if status record exists
        const existing = await db.select()
            .from(notification_status)
            .where(and(
                eq(notification_status.notification_id, notificationId),
                eq(notification_status.user_id, user.$id)
            ))
            .limit(1);

        if (existing.length > 0) {
            await db.update(notification_status)
                .set({ is_read: true, read_at: new Date().toISOString() })
                .where(eq(notification_status.id, existing[0].id));
        } else {
            await db.insert(notification_status)
                .values({
                    user_id: user.$id,
                    notification_id: notificationId,
                    is_read: true,
                    read_at: new Date().toISOString()
                });
        }

        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error('Error marking notification as read:', e);
        return { success: false };
    }
}

import { isAdminEmail } from '@/lib/admin';

export async function broadcastNotification(title: string, message: string, type: 'info' | 'warning' | 'feature' | 'success' = 'info', link?: string) {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        
        // Use isAdminEmail utility
        if (!isAdminEmail(user.email)) throw new Error('Unauthorized: Admin only');

        await db.insert(notifications).values({
            title,
            message,
            type,
            link: link || null,
        });

        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error('Error broadcasting notification:', e);
        return { success: false, error: (e as Error).message };
    }
}

export async function sendUserNotification(targetUserId: string, title: string, message: string, type: 'info' | 'warning' | 'feature' | 'success' = 'info') {
    try {
        await db.insert(notifications).values({
            user_id: targetUserId,
            title,
            message,
            type
        });
        return { success: true };
    } catch (e) {
        console.error('Error sending user notification:', e);
        return { success: false };
    }
}
