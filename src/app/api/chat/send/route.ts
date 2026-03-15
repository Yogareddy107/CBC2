import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isAdminEmail } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const body = await request.json();
    const sender = String(body.sender || 'user');
    const messageText = String(body.message || '').trim();
    const conversationId = body.conversationId;

    if (!messageText) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Admin must be in allowed list
    if (sender === 'admin' && !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Ensure conversation exists and belongs to the user (unless admin)
    let convoId = conversationId;

    if (!convoId) {
      if (sender !== 'user') {
        return NextResponse.json({ error: 'conversationId is required for admin messages' }, { status: 400 });
      }

      const [created] = await db.insert(conversations).values({
        user_id: user.$id,
        status: 'open',
      }).returning({ id: conversations.id });

      if (!created) {
        throw new Error('Failed to create conversation');
      }

      convoId = created.id;
    }

    const [conversation] = await db.select({ userId: conversations.user_id })
      .from(conversations)
      .where(eq(conversations.id, convoId));

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (sender === 'user' && conversation.userId !== user.$id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [createdMessage] = await db.insert(messages).values({
      conversation_id: convoId,
      sender_type: sender === 'admin' ? 'admin' : 'user',
      message: messageText,
      status: 'unread',
    }).returning({ id: messages.id });

    return NextResponse.json({ conversationId: convoId, messageId: createdMessage?.id });
  } catch (error) {
    console.error('Error in /api/chat/send:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
