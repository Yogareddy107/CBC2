import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq, sql, asc, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const convos = await db.select().from(conversations).where(eq(conversations.user_id, user.$id)).orderBy(desc(conversations.created_at));

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
            sql`${messages.conversation_id} = ${conversation.id} AND ${messages.sender_type} = 'admin' AND ${messages.status} = 'unread'`
          );

        return {
          id: conversation.id,
          status: conversation.status,
          created_at: conversation.created_at,
          lastMessage: last?.message ?? null,
          unread: Number(unread.unread) || 0,
        };
      })
    );

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ conversations: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const body = await request.json();
    const messageText = String(body.message || '').trim();
    const conversationId = body.conversationId;

    if (!messageText) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let convoId = conversationId;

    // If no conversationId is provided, create one
    if (!convoId) {
      const [created] = await db.insert(conversations).values({
        user_id: user.$id,
        status: 'open',
      }).returning({ id: conversations.id });

      if (!created) {
        throw new Error('Failed to create conversation');
      }

      convoId = created.id;
    }

    // Ensure the conversation belongs to the user
    const [existing] = await db.select({ id: conversations.id, userId: conversations.user_id })
      .from(conversations)
      .where(eq(conversations.id, convoId));

    if (!existing || existing.id !== convoId || existing.userId !== user.$id) {
      return NextResponse.json({ error: 'Invalid conversation' }, { status: 403 });
    }

    const [createdMessage] = await db.insert(messages).values({
      conversation_id: convoId,
      sender_type: 'user',
      message: messageText,
      status: 'unread',
    }).returning({ id: messages.id });

    return NextResponse.json({ conversationId: convoId, messageId: createdMessage?.id });
  } catch (error) {
    console.error('Error posting message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
