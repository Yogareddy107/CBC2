import { createSessionClient } from '@/lib/appwrite';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { systems, system_analyses, analyses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import { Layers, ArrowLeft, ExternalLink, Clock, Github, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SystemDetailPageProps {
    params: { id: string };
}

export default async function SystemDetailPage({ params: paramsPromise }: SystemDetailPageProps) {
    const params = await paramsPromise;
    let user: { $id: string } | null = null;
    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = { $id: appwriteUser.$id };
    } catch {
        redirect('/login');
    }

    const [system] = await db.select()
        .from(systems)
        .where(and(eq(systems.id, params.id), eq(systems.user_id, user.$id)))
        .limit(1);

    if (!system) notFound();

    // Get linked analyses
    const linkedAnalyses = await db.select({
        id: analyses.id,
        repo_url: analyses.repo_url,
        status: analyses.status,
        summary: analyses.summary,
        created_at: analyses.created_at,
    })
    .from(system_analyses)
    .innerJoin(analyses, eq(system_analyses.analysis_id, analyses.id))
    .where(eq(system_analyses.system_id, params.id));

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="space-y-6">
                <Link
                    href="/dashboard/systems"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Systems
                </Link>

                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Layers className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A]">
                            {system.name}
                        </h1>
                        {system.description && (
                            <p className="text-sm text-slate-500 font-medium mt-1">{system.description}</p>
                        )}
                    </div>
                </div>
            </header>

            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                        Linked Repositories ({linkedAnalyses.length})
                    </h2>
                </div>

                {linkedAnalyses.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
                            <Github className="w-8 h-8 text-slate-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-[#1A1A1A]">No repositories linked yet</p>
                            <p className="text-xs text-slate-500 max-w-sm">
                                Use the Systems API to link existing analyses to this system. You can add analyses via the PATCH endpoint.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {linkedAnalyses.map((analysis) => {
                            const repoName = analysis.repo_url.split('/').pop() || analysis.repo_url;
                            const date = analysis.created_at ? new Date(analysis.created_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            }) : 'N/A';

                            return (
                                <Link
                                    key={analysis.id}
                                    href={`/report/${analysis.id}`}
                                    className="group relative overflow-hidden flex items-center justify-between p-5 rounded-2xl bg-white border border-border/40 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-300">
                                            <Github className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="font-bold text-[#1A1A1A] group-hover:text-indigo-600 transition-colors">
                                                    {repoName}
                                                </span>
                                                <Badge
                                                    variant={analysis.status === 'completed' ? 'secondary' : analysis.status === 'failed' ? 'destructive' : 'outline'}
                                                    className="text-[9px] h-4.5 px-2 font-black uppercase tracking-widest"
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
                                    <div className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                        <ExternalLink className="w-4 h-4 text-indigo-500" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
