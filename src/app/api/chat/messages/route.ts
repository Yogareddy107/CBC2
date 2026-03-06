import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq, sql, asc } from 'drizzle-orm';
import { isAdminEmail } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const url = new URL(request.url);
    const conversationId = String(url.searchParams.get('conversationId') || '');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const [conversation] = await db.select({ userId: conversations.user_id })
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const userIsOwner = conversation.userId === user.$id;
    const userIsAdmin = isAdminEmail(user.email);

    if (!userIsOwner && !userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (userIsOwner) {
      // Mark admin messages as read when the user views the conversation.
      await db.update(messages)
        .set({ status: 'read' })
        .where(
          sql`${messages.conversation_id} = ${conversationId} AND ${messages.sender_type} = 'admin' AND ${messages.status} = 'unread'`
        );
    }

    const convoMessages = await db.select()
      .from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(asc(messages.created_at));

    const result = convoMessages.map((m) => ({
      id: m.id,
      sender_type: m.sender_type,
      message: m.message,
      status: m.status,
      created_at: m.created_at,
    }));

    return NextResponse.json({ messages: result });
  } catch (error) {
    console.error('Error in /api/chat/messages:', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}
