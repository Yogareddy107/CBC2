import { db } from '@/lib/db';
import { analyses as analysesTable } from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import { AnalysisReport } from '@/components/AnalysisReport';
import { AnalysisRunner } from '@/components/AnalysisRunner';
import { AnalysisResult } from '@/lib/llm/client';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { ShareButton } from './ShareButton';
import { ReAnalyzeButton } from './ReAnalyzeButton';
import { Button } from '@/components/ui/button';
import { createSessionClient } from '@/lib/appwrite';
import { LayoutDashboard } from 'lucide-react';

export const metadata = {
    title: 'Codebase Analysis Report | CheckBeforeCommit',
    description: 'Shared codebase architecture and risk analysis report.',
};

interface PublicReportPageProps {
    params: {
        slug: string;
    };
}

export default async function PublicReportPage({ params: paramsPromise }: PublicReportPageProps) {
    const params = await paramsPromise;

    let user: { $id: string; email: string } | null = null;
    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = {
            $id: appwriteUser.$id,
            email: appwriteUser.email,
        };
    } catch {
        // User not logged in, which is fine for public reports
    }

    // Fetch analysis using Drizzle
    const [analysis] = await db.select()
        .from(analysesTable)
        .where(eq(analysesTable.slug, params.slug))
        .limit(1);

    if (!analysis) {
        notFound();
    }

    const isCompleted = analysis.status === 'completed';
    const result = analysis.result as AnalysisResult | null;
    const repoName = analysis.repo_url.split('/').pop() || analysis.repo_url;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center">
            
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
                <div className="max-w-[1000px] w-full mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold tracking-tight text-sm hidden sm:inline-block">
                            Check<span className="text-primary">Before</span>Commit
                        </span>
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        {user ? (
                            <Button asChild variant="ghost" size="sm" className="font-bold gap-2 text-slate-600 hover:text-black hover:bg-slate-100 rounded-xl">
                                <Link href="/dashboard" className="flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Go to Dashboard
                                </Link>
                            </Button>
                        ) : null}
                        
                        {isCompleted && (
                            <>
                                <ReAnalyzeButton slug={params.slug} />
                                <ShareButton slug={params.slug} repoName={repoName} />
                            </>
                        )}
                        <Button asChild variant="outline" size="sm" className="hidden sm:flex font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl">
                            <Link href="/">Analyze Another Repo</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="w-full px-4 py-8 md:py-12">
                {isCompleted && result ? (
                    <AnalysisReport data={result} repoUrl={analysis.repo_url} />
                ) : (
                    <div className="max-w-[1000px] mx-auto">
                         <AnalysisRunner
                            analysisId={analysis.id}
                            repoUrl={analysis.repo_url}
                            initialStatus={analysis.status || 'pending'}
                        />
                    </div>
                )}
            </main>

            {/* Footer Watermark */}
            <div className="w-full py-12 flex justify-center border-t border-border/40 bg-secondary/5 mt-auto">
                <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Automatically analyzed by CheckBeforeCommit
                    </p>
                    <div className="flex justify-center gap-4">
                       <Button asChild size="sm" className="font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-md">
                            <Link href="/">Try it yourself for free</Link>
                       </Button>
                    </div>
                </div>
            </div>

        </div>
    );
}
