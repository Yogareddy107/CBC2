import { db } from '@/lib/db';
import { analyses as analysesTable } from '@/lib/db/schema';
import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import { HistoryPageClient } from '@/components/dashboard/HistoryPageClient';
import { desc, eq } from 'drizzle-orm';

export default async function HistoryPage() {
    let user: { $id: string; email: string } | null = null;
    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = {
            $id: appwriteUser.$id,
            email: appwriteUser.email,
        };
    } catch {
        redirect('/login');
    }

    const rawAnalyses = await db.select()
        .from(analysesTable)
        .where(eq(analysesTable.user_id, user.$id))
        .orderBy(desc(analysesTable.created_at));

    const analyses = rawAnalyses.map((a) => ({
        id: a.id,
        repo_url: a.repo_url,
        slug: a.slug,
        status: a.status || 'pending',
        created_at: a.created_at || new Date().toISOString(),
        summary: a.summary
    }));

    return <HistoryPageClient analyses={analyses} />;
}
