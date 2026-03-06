import { Suspense } from 'react';
import { db } from '@/lib/db';
import { analyses as analysesTable } from '@/lib/db/schema';
import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Github, ExternalLink, Clock, Sparkles, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NewAnalysisForm } from '@/components/dashboard/NewAnalysisForm';
import { desc, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
    let user: { $id: string, email: string } | null = null;
    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = {
            $id: appwriteUser.$id,
            email: appwriteUser.email,
        };
    } catch (e) {
        const cookieStore = await cookies();
        const cookieNames = Array.from(cookieStore.getAll()).map(c => c.name);
        const hasSession = cookieNames.some(name =>
            name.includes('appwrite') || name.includes('session')
        );

        if (hasSession) {
            redirect('/auth/session-recovery');
        }
        redirect('/login');
    }

    const analyses = await db.select()
        .from(analysesTable)
        .where(eq(analysesTable.user_id, user.$id))
        .orderBy(desc(analysesTable.created_at))
        .limit(5);

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700">
            {/* Hero Section */}
            <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FFFDF6] via-white to-amber-50/40 border border-amber-100/20 p-8 md:p-16 text-center space-y-8 shadow-sm">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Sparkles className="w-80 h-80 -rotate-12" />
                </div>
                <div className="absolute -bottom-24 -left-24 p-12 opacity-[0.03] pointer-events-none text-primary">
                    <Github className="w-96 h-96 rotate-12" />
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Next-Gen Repo Intelligence
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1A1A1A] max-w-3xl mx-auto leading-[1.1]">
                        What shall we <span className="text-primary italic">analyze</span> today?
                    </h1>
                    <p className="text-muted-foreground text-base md:text-xl max-w-xl mx-auto leading-relaxed font-medium opacity-80">
                        Paste any public GitHub URL to unlock deep architectural insights and system clarity.
                    </p>
                </div>

                <div className="relative z-10 mt-8">
                    <Suspense fallback={<div className="h-16 max-w-2xl mx-auto animate-pulse bg-secondary/20 rounded-2xl" />}>
                        <NewAnalysisForm />
                    </Suspense>
                </div>
            </header>

            {/* Recent Activity Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Recent Activity
                        </h2>
                        <p className="text-xs text-muted-foreground font-medium">Your latest repository insights</p>
                    </div>
                    <Link
                        href="/dashboard/history"
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10"
                    >
                        View Full History
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>

                {!analyses || analyses.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-primary/5 rounded-[2rem] bg-secondary/5 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-primary/10 flex items-center justify-center shadow-sm">
                            <Github className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-[#1A1A1A]">No analyses yet</p>
                            <p className="text-xs text-muted-foreground">Your recent reports will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {analyses.map((analysis) => {
                            const repoName = analysis.repo_url.split('/').pop() || analysis.repo_url;
                            const date = analysis.created_at ? new Date(analysis.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }) : 'N/A';

                            return (
                                <Link
                                    key={analysis.id}
                                    href={`/report/${analysis.id}`}
                                    className="group relative overflow-hidden flex items-center justify-between p-5 rounded-2xl bg-white border border-border/40 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center border border-border/10 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                            <Github className="w-6 h-6 text-muted-foreground group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="font-bold text-[#1A1A1A] group-hover:text-primary transition-colors">
                                                    {repoName}
                                                </span>
                                                <Badge
                                                    variant={analysis.status === 'completed' ? 'secondary' : analysis.status === 'failed' ? 'destructive' : 'outline'}
                                                    className="text-[9px] h-4.5 px-2 font-black uppercase tracking-widest bg-opacity-50 backdrop-blur-sm"
                                                >
                                                    {analysis.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold uppercase tracking-tighter opacity-70">
                                                <Clock className="w-3 h-3" />
                                                Analyzed {date}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="p-2 rounded-lg bg-secondary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                            <ExternalLink className="w-4 h-4 text-primary" />
                                        </div>
                                    </div>
                                    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.02] to-transparent pointer-events-none" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
