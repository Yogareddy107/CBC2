import { Suspense } from 'react';
import { db } from '@/lib/db';
import { analyses as analysesTable } from '@/lib/db/schema';
import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Github, ExternalLink, Clock, Sparkles, Activity, Gitlab, Globe, Cloud, Code, Terminal, FolderOpen, FileArchive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NewAnalysisForm } from '@/components/dashboard/NewAnalysisForm';
import { BroadcastBox } from '@/components/BroadcastBox';
import { desc, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { cn } from '@/lib/utils';
import { isAdminEmail } from '@/lib/admin';

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
        <div className="max-w-5xl mx-auto px-6 py-6 md:py-16 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Centered Hero Section */}
            <header className="text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-tight">
                        What shall we <span className="text-[#FF7A00]">analyze</span> today?
                    </h1>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">Ecosystem Support</span>
                        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 px-4 py-2 rounded-2xl bg-secondary/5 border border-border/5 backdrop-blur-sm">
                            {/* VCS Group */}
                            <div className="flex items-center gap-3 border-r border-border/10 pr-6 last:border-0 last:pr-0">
                                <Github className="w-3.5 h-3.5 text-slate-400 hover:text-[#24292e] transition-colors" />
                                <Gitlab className="w-3.5 h-3.5 text-slate-400 hover:text-[#FC6D26] transition-colors" />
                                <Globe className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 transition-colors" />
                            </div>
                            {/* Cloud Group */}
                            <div className="flex items-center gap-3 border-r border-border/10 pr-6 last:border-0 last:pr-0">
                                <div className="flex items-center gap-2 group cursor-default">
                                    <Cloud className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-[0.15em]">AWS / GCP / Azure</span>
                                </div>
                            </div>
                            {/* IDE Group */}
                            <div className="flex items-center gap-3 border-r border-border/10 pr-6 last:border-0 last:pr-0">
                                <div className="flex items-center gap-2 group cursor-default">
                                    <Code className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-[0.15em]">VS Code / IntelliJ</span>
                                </div>
                            </div>
                            {/* Local Group */}
                            <div className="flex items-center gap-3">
                                <FolderOpen className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-500 transition-colors" />
                                <FileArchive className="w-3.5 h-3.5 text-slate-400 hover:text-amber-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <Suspense fallback={<div className="h-16 max-w-2xl mx-auto animate-pulse bg-secondary/20 rounded-full" />}>
                        <NewAnalysisForm />
                    </Suspense>
                </div>
            </header>
            
            {/* What&apos;s New in 1.0 - Announcement Section */}
            <section className="bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full">1.0 Release</Badge>
                            <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">Now Live</span>
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight">
                            Meet the <span className="text-primary italic">Magic Fix</span> loop.
                        </h2>
                        <p className="text-lg text-white/50 font-medium leading-relaxed">
                            CBC 1.0 transforms from analysis into **autonomous remediation**. Identify debt, click fix, and merge.
                        </p>
                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold text-white/80">Auto-Remediation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold text-white/80">Health Trends</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Gitlab className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold text-white/80">GitLab Support</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 flex flex-col gap-3">
                        <Link href="/team" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group/item">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-white">Create a Team</span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-white/20 group-hover/item:text-primary transition-colors" />
                        </Link>
                        <div className="p-4 bg-primary rounded-2xl flex items-center justify-center gap-2 group/btn cursor-pointer">
                            <span className="text-xs font-black text-black uppercase tracking-widest">Try Magic Fix</span>
                            <Sparkles className="w-3 h-3 text-black animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Activity Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-0.5">
                        <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Recent Activity
                        </h2>
                        <p className="text-[10px] text-muted-foreground font-medium">Your latest repository insights</p>
                    </div>
                    <Link
                        href="/dashboard/history"
                        className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10"
                    >
                        View Full History
                        <ExternalLink className="w-2.5 h-2.5" />
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

            {/* Admin Broadcast Area */}
            {user && isAdminEmail(user.email) && (
                <div className="pt-12 border-t border-border/10">
                    <BroadcastBox userEmail={user.email} />
                </div>
            )}
        </div>
    );
}
