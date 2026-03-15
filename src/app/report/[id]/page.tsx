import { db } from '@/lib/db';
import { analyses as analysesTable } from '@/lib/db/schema';
import { createSessionClient } from '@/lib/appwrite';
import { notFound } from 'next/navigation';
import { AnalysisReport } from '@/components/AnalysisReport';
import { AnalysisRunner } from '@/components/AnalysisRunner';
import { AnalysisResult } from '@/lib/llm/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ShareReportButton } from '@/components/ShareReportButton';
import { eq } from 'drizzle-orm';

interface ReportPageProps {
    params: {
        id: string;
    };
}

export default async function ReportPage({ params: paramsPromise }: ReportPageProps) {
    const params = await paramsPromise;
    let user: { id: string, email: string } | null = null;
    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = {
            id: appwriteUser.$id,
            email: appwriteUser.email,
        };
    } catch {
        // User might not be logged in
    }



    // Fetch analysis using Drizzle
    const [analysis] = await db.select()
        .from(analysesTable)
        .where(eq(analysesTable.id, params.id))
        .limit(1);

    if (!analysis) {
        notFound();
    }

    const isCompleted = analysis.status === 'completed';
    const result = analysis.result as AnalysisResult | null;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar user={user} />

                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Button asChild variant="ghost" size="sm" className="font-bold gap-2 text-slate-600 hover:text-black hover:bg-white rounded-xl h-9">
                        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
                             {user ? (
                                <>
                                    <LayoutDashboard className="w-4 h-4" />
                                    Back to Dashboard
                                </>
                             ) : (
                                <>
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Home
                                </>
                             )}
                        </Link>
                    </Button>
                    <ShareReportButton />
                </div>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {isCompleted && result ? (
                    <AnalysisReport data={result} repoUrl={analysis.repo_url} />
                ) : (
                    <AnalysisRunner
                        analysisId={analysis.id}
                        repoUrl={analysis.repo_url}
                        initialStatus={analysis.status || 'pending'}
                    />
                )}
            </main>
        </div>
    );
}

