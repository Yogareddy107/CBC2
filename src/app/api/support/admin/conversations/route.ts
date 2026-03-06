import { NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { ALLOWED_ADMIN_EMAILS } from '@/lib/admin';
import { eq, sql, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    if (!user.email || !ALLOWED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const convos = await db.select().from(conversations).orderBy(desc(conversations.created_at));

    const formatted = await Promise.all(
      convos.map(async (conversation) => {
        const [last] = await db.select({ message: messages.message })
          .from(messages)
          .where(eq(messages.conversation_id, conversation.id))
          .orderBy(desc(messages.created_at))
          .limit(1);

        const [unread] = await db.select({ unread: sql`COUNT(*)` })
          .from(messages)
          .where(
            sql`${messages.conversation_id} = ${conversation.id} AND ${messages.sender_type} = 'user' AND ${messages.status} = 'unread'`
          );

        return {
          id: conversation.id,
          user_id: conversation.user_id,
          status: conversation.status,
          created_at: conversation.created_at,
          lastMessage: last?.message ?? null,
          unread: Number(unread.unread) || 0,
        };
      })
    );

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error('Error fetching admin conversations:', error);
    return NextResponse.json({ conversations: [] }, { status: 500 });
  }
}
