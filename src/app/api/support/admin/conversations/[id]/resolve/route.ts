import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { ALLOWED_ADMIN_EMAILS } from '@/lib/admin';
import { eq } from 'drizzle-orm';

async function assertAdmin() {
  const { account } = await createSessionClient();
  const user = await account.get();
  if (!user.email || !ALLOWED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertAdmin();

    const { id: conversationId } = await params;

    await db.update(conversations)
      .set({ status: 'resolved' })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving conversation:', error);
    return NextResponse.json({ error: 'Failed to resolve' }, { status: 500 });
  }
}
