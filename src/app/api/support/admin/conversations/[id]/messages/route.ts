import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { ALLOWED_ADMIN_EMAILS } from '@/lib/admin';
import { eq, sql, asc } from 'drizzle-orm';

async function assertAdmin() {
  const { account } = await createSessionClient();
  const user = await account.get();
  if (!user.email || !ALLOWED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdmin();

    const { id: conversationId } = await params;

    // Mark user messages as read when admin views
    await db.update(messages)
      .set({ status: 'read' })
      .where(
        sql`${messages.conversation_id} = ${conversationId} AND ${messages.sender_type} = 'user' AND ${messages.status} = 'unread'`
      );

    const convoMessages = await db.select().from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(asc(messages.created_at));

    return NextResponse.json({ messages: convoMessages });
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdmin();

    const { id: conversationId } = await params;
    const body = await request.json();
    const messageText = String(body.message || '').trim();

    if (!messageText) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const [existing] = await db.select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!existing) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const [created] = await db.insert(messages).values({
      conversation_id: conversationId,
      sender_type: 'admin',
      message: messageText,
      status: 'unread',
    }).returning({ id: messages.id });

    return NextResponse.json({ messageId: created?.id });
  } catch (error) {
    console.error('Error sending admin message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
