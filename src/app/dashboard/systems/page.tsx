import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { systems, system_analyses, analyses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Layers, Plus, ArrowRight, ExternalLink, GitBranch, Clock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SystemCreator } from './SystemCreator';

export default async function SystemsPage() {
    let user: { $id: string } | null = null;
    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = { $id: appwriteUser.$id };
    } catch {
        redirect('/login');
    }

    const userSystems = await db.select()
        .from(systems)
        .where(eq(systems.user_id, user.$id));

    // For each system, get linked analysis count
    const systemsWithCounts = await Promise.all(
        userSystems.map(async (sys) => {
            const linked = await db.select()
                .from(system_analyses)
                .where(eq(system_analyses.system_id, sys.id));
            return { ...sys, analysisCount: linked.length };
        })
    );

    return (
        <div className="relative min-h-screen bg-slate-50/20">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
            
            <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <header className="text-center space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/10 bg-indigo-500/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 backdrop-blur-sm shadow-sm ring-1 ring-indigo-500/5">
                                <Layers className="w-3.5 h-3.5" />
                                Architectural Mapping
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-tight">
                            Multi-Repo <span className="text-indigo-600">Systems</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                            Group and analyze multiple repositories as a single architectural system for comprehensive impact analysis.
                        </p>
                    </div>
                </header>

            {/* System Creator */}
            <SystemCreator />

            {/* Systems List */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                    <GitBranch className="w-4 h-4 text-indigo-500" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Your Systems</h2>
                </div>

                {systemsWithCounts.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-indigo-100 rounded-[2rem] bg-indigo-50/10 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-indigo-100 flex items-center justify-center shadow-sm">
                            <Layers className="w-8 h-8 text-indigo-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-[#1A1A1A]">No systems yet</p>
                            <p className="text-xs text-slate-500">Create your first system to group related repositories.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {systemsWithCounts.map((sys) => (
                            <Link
                                key={sys.id}
                                href={`/dashboard/systems/${sys.id}`}
                                className="group relative overflow-hidden flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-300">
                                        <Layers className="w-6 h-6 text-indigo-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-bold text-[#1A1A1A] group-hover:text-indigo-600 transition-colors">
                                                {sys.name}
                                            </span>
                                            <Badge variant="secondary" className="text-[9px] h-4.5 px-2 font-black uppercase tracking-widest">
                                                {sys.analysisCount} {sys.analysisCount === 1 ? 'Repo' : 'Repos'}
                                            </Badge>
                                        </div>
                                        {sys.description && (
                                            <p className="text-xs text-slate-500 line-clamp-1">
                                                {sys.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold uppercase tracking-tighter opacity-70">
                                            <Clock className="w-3 h-3" />
                                            Created {sys.created_at ? new Date(sys.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-50/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                        <ExternalLink className="w-4 h-4 text-indigo-500" />
                                    </div>
                                </div>
                                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/[0.02] to-transparent pointer-events-none" />
                            </Link>
                        ))}
                    </div>
                )}
            </section>
            </div>
        </div>
    );
}
