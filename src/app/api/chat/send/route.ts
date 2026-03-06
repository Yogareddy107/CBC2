import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isAdminEmail } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    let user;
    try {
      const { account } = await createSessionClient();
      user = await account.get();
      console.log('[API CHAT SEND] Auth success:', user.$id);
    } catch (e) {
      console.error('[API CHAT SEND] Auth failed:', e);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const body = await request.json();
    const sender = String(body.sender || 'user');
    const messageText = String(body.message || '').trim();
    const conversationId = body.conversationId;

    console.log('[API CHAT SEND] Payload:', { sender, messageText, conversationId });

    if (!messageText) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Admin must be in allowed list
    if (sender === 'admin' && !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Ensure conversation exists and belongs to the user (unless admin)
    let convoId = conversationId;
    let isOwner = false;

    if (!convoId) {
      if (sender !== 'user') {
        return NextResponse.json({ error: 'conversationId is required for admin messages' }, { status: 400 });
      }

      console.log('[API CHAT SEND] Creating new conversation...');
      try {
        const newConvoId = crypto.randomUUID();
        await db.insert(conversations).values({
          id: newConvoId,
          user_id: user.$id,
          status: 'open',
        });
        convoId = newConvoId;
        isOwner = true;
        console.log('[API CHAT SEND] Conversation created manually:', convoId);
      } catch (e) {
        console.error('[API CHAT SEND] Error creating conversation:', e);
        throw e;
      }
    } else {
      console.log('[API CHAT SEND] Finding existing conversation:', convoId);
      try {
        const [conversation] = await db.select({ userId: conversations.user_id })
          .from(conversations)
          .where(eq(conversations.id, convoId));

        if (!conversation) {
          console.log('[API CHAT SEND] Conversation not found:', convoId);
          return NextResponse.json({ error: 'Conversation not found. Please refresh.' }, { status: 404 });
        }
        isOwner = conversation.userId === user.$id;
      } catch (e) {
        console.error('[API CHAT SEND] Error finding conversation:', e);
        throw e;
      }
    }

    const userIsAdmin = isAdminEmail(user.email);

    if (sender === 'user' && !isOwner && !userIsAdmin) {
      console.log('[API CHAT SEND] Forbidden access attempt');
      return NextResponse.json({ error: 'You do not have permission to send messages to this conversation' }, { status: 403 });
    }

    console.log('[API CHAT SEND] Inserting message...');
    try {
      const messageId = crypto.randomUUID();
      await db.insert(messages).values({
        id: messageId,
        conversation_id: convoId,
        sender_type: sender === 'admin' ? 'admin' : 'user',
        message: messageText,
        status: 'unread',
      });

      console.log('[API CHAT SEND] Message inserted manually:', messageId);
      return NextResponse.json({ conversationId: convoId, messageId: messageId });
    } catch (e) {
      console.error('[API CHAT SEND] Error inserting message:', e);
      throw e;
    }
  } catch (error) {
    const errorLog = `\n[${new Date().toISOString()}] Detailed Error in /api/chat/send: ${error instanceof Error ? error.stack : String(error)}\n`;
    try {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
      fs.appendFileSync(path.join(logDir, 'api_errors.log'), errorLog);
    } catch (e) {
      console.error('Failed to write to error log file:', e);
    }
    console.error('Detailed Error in /api/chat/send:', error);
    return NextResponse.json({ error: 'Failed to send message', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
